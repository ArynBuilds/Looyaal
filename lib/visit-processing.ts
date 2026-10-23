import { SupabaseClient } from '@supabase/supabase-js'
import { resolveAttributionOnVisit } from './attribution'
import { updateStreak } from './streaks'
import { trackChallengeProgress } from './challenges'
import { getLocalDayAndHour } from './timezone'

export interface ProcessVisitOptions {
  orgId: string
  locationId: string
  customerId: string
  visitType: 'manual' | 'reward_redeem' | 'campaign_redeem' | 'subscription_redeem'
  drinkName?: string
  menuItemId?: string
  awardStamp: boolean
  checkRateLimit: boolean
}

export interface ProcessVisitResult {
  visitId: string | null
  stampAwarded: boolean
  stampsGiven: number
  newStampCount: number
  cardCompleted: boolean
  streakUpdated: boolean
  challengeProgressed: boolean
  rateLimited: boolean
  doubleStamp: boolean
  isDeadHourVisit: boolean
  cardMissing: boolean
}

export async function processVisit(
  admin: SupabaseClient,
  options: ProcessVisitOptions
): Promise<ProcessVisitResult> {
  const { orgId, locationId, customerId, visitType, drinkName, menuItemId, awardStamp, checkRateLimit } = options
  const now = new Date()

  // Resolve the real price server-side from the menu (never trust a client
  // price). When the barista picks a priced menu item, this lets us record the
  // actual transaction amount instead of relying on the basket estimate.
  let resolvedPrice: number | null = null
  if (menuItemId) {
    const { data: menuItem } = await admin
      .from('menu_items')
      .select('price')
      .eq('id', menuItemId)
      .eq('org_id', orgId)
      .maybeSingle()
    const price = menuItem?.price == null ? null : Number(menuItem.price)
    resolvedPrice = price != null && price > 0 ? price : null
  }

  // Fetch location timezone for local-time storage of day_of_week/hour_of_day
  const { data: locationRow } = await admin
    .from('locations')
    .select('timezone')
    .eq('id', locationId)
    .maybeSingle()
  const locationTz = (locationRow as { timezone: string | null } | null)?.timezone || 'Europe/Istanbul'
  const { day: localDay, hour: localHour } = getLocalDayAndHour(now, locationTz)

  // 1. Rate limit check (30-second cooldown per customer per location — prevents double-scan only)
  if (checkRateLimit) {
    const cutoff = new Date(now.getTime() - 30 * 1000).toISOString()
    const { data: recentVisit } = await admin
      .from('visits')
      .select('id')
      .eq('customer_id', customerId)
      .eq('location_id', locationId)
      .gte('visited_at', cutoff)
      .limit(1)
      .maybeSingle()

    if (recentVisit) {
      return {
        visitId: null, stampAwarded: false, stampsGiven: 0, newStampCount: -1,
        cardCompleted: false, streakUpdated: false, challengeProgressed: false,
        rateLimited: true, doubleStamp: false, isDeadHourVisit: false,
        cardMissing: false,
      }
    }
  }

  // 2. Check for goal_gradient attribution BEFORE inserting visit (need to know for 2x stamp)
  let isGoalGradientVisit = false
  if (awardStamp) {
    const { data: pendingGG } = await admin
      .from('customer_offers')
      .select('id')
      .eq('customer_id', customerId)
      .eq('type', 'goal_gradient')
      .in('status', ['active', 'claimed'])
      .limit(1)
      .maybeSingle()
    isGoalGradientVisit = !!pendingGG
  }

  // Dead-hour auto 2x-stamp removed 2026-04-11: replaced by dead_hour_targeted
  // offer system. Walk-in customers no longer get a free 2x bonus; only the
  // targeted customers who claim their personalized offer get the discount.
  const isDeadHourVisit = false
  const stampsToAward = isGoalGradientVisit ? 2 : 1

  // 3. Insert visit record (day_of_week / hour_of_day in LOCATION-LOCAL time)
  const { data: visit } = await admin.from('visits').insert({
    org_id: orgId,
    location_id: locationId,
    customer_id: customerId,
    visit_type: isDeadHourVisit ? 'dead_hour_redeem' : visitType,
    visited_at: now.toISOString(),
    day_of_week: localDay,
    hour_of_day: localHour,
    amount: resolvedPrice ?? undefined,
    items: drinkName
      ? [{ name: drinkName, qty: 1, ...(resolvedPrice != null ? { price: resolvedPrice } : {}) }]
      : undefined,
  }).select('id').single()

  const visitId = visit?.id || null

  // 4. Resolve attribution
  if (visitId) {
    await resolveAttributionOnVisit(admin, customerId, visitId, locationId)
  }

  // 5. Award stamp (overflow beyond stamps_required is tracked silently;
  // card reset happens on reward redemption in barista/confirm)
  let stampAwarded = false
  let newStampCount = -1

  let cardMissing = false
  if (awardStamp) {
    const { data: card } = await admin
      .from('loyalty_cards')
      .select('id, current_stamps, total_stamps')
      .eq('customer_id', customerId)
      .eq('org_id', orgId)
      .maybeSingle()

    if (card) {
      const nextStamps = card.current_stamps + stampsToAward
      await admin.from('loyalty_cards').update({
        current_stamps: nextStamps,
        total_stamps: card.total_stamps + stampsToAward,
      }).eq('id', card.id)
      newStampCount = nextStamps
      stampAwarded = true
    } else {
      cardMissing = true
      console.error(
        '[processVisit] loyalty_cards row missing',
        JSON.stringify({ orgId, customerId, locationId }),
      )
    }
  }

  // 5. Update customer (last_visit_at, total_visits)
  const { data: cust } = await admin
    .from('customers')
    .select('total_visits')
    .eq('id', customerId)
    .single()

  await admin.from('customers').update({
    last_visit_at: now.toISOString(),
    total_visits: (cust?.total_visits || 0) + 1,
  }).eq('id', customerId)

  // 6. Auto-revive if paused
  await admin.from('customers').update({
    automation_status: 'active',
    notification_ignores: 0,
  }).eq('id', customerId).eq('automation_status', 'paused')

  // 7. Update streak
  let streakUpdated = false
  try {
    await updateStreak(admin, customerId)
    streakUpdated = true
  } catch { /* streak update is best-effort */ }

  // 8. Track challenge progress
  let challengeProgressed = false
  try {
    await trackChallengeProgress(admin, customerId, drinkName)
    challengeProgressed = true
  } catch { /* challenge tracking is best-effort */ }

  return {
    visitId, stampAwarded, stampsGiven: awardStamp ? stampsToAward : 0,
    newStampCount, cardCompleted: false, doubleStamp: isGoalGradientVisit || isDeadHourVisit,
    streakUpdated, challengeProgressed, rateLimited: false, isDeadHourVisit,
    cardMissing,
  }
}

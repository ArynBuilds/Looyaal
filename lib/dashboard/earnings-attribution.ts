import type { SupabaseClient } from '@supabase/supabase-js'
import { computeAvgBasket } from './avg-basket'

export type SegmentKey =
  | 'loyalty'
  | 'subscription'
  | 'dead_hour'
  | 'campaign'
  | 'win_back'

export interface Segment {
  key: SegmentKey
  label: string
  value_try: number
  count: number
  why: string
}

export interface EarningsBreakdown {
  total_try: number
  segments: Segment[]
  avg_basket_try: number
  avg_basket_source: 'daily_stats' | 'customer_avg' | 'menu_avg' | 'default'
}

const SEGMENT_LABELS: Record<SegmentKey, string> = {
  loyalty: 'Sadakat ziyaretleri',
  subscription: 'Abonelik geliri',
  dead_hour: 'Ölü saat dönüşleri',
  campaign: 'Kampanya dönüşleri',
  win_back: 'Geri-kazanılan müşteriler',
}

const SEGMENT_WHY: Record<SegmentKey, string> = {
  loyalty: 'QR ile damga toplayan normal ziyaretler, ortalama sepet ile hesaplandı.',
  subscription: 'Aktif aboneliklerin bu dönemdeki gelir payı.',
  dead_hour: 'Ölü saat olarak işaretlenmiş zamanlarda gerçekleşen ziyaretler.',
  campaign: 'Bir kampanyanın teklifini kullanan ziyaretler.',
  win_back: 'Son dönemde at_risk veya lost segmentinden geri gelen müşteriler.',
}

interface ComputeInput {
  orgId: string
  locationId?: string | null
  periodStartIso: string
  periodEndIso: string
}

export async function computeEarningsBreakdown(
  supabase: SupabaseClient,
  input: ComputeInput,
): Promise<EarningsBreakdown> {
  const { orgId, locationId, periodStartIso, periodEndIso } = input
  const periodDays = Math.max(
    1,
    (new Date(periodEndIso).getTime() - new Date(periodStartIso).getTime()) / 86400000,
  )

  const basket = await computeAvgBasket(supabase, {
    orgId,
    locationId,
    sinceIso: periodStartIso,
  })

  // Pull all visits in the period in one query.
  // Exclude free reward redemptions (no revenue) and subscription redemptions
  // (already counted in the subscription segment) so we don't overstate.
  let visitsQuery = supabase
    .from('visits')
    .select('id, amount, is_dead_hour, customer_id, location_id, visit_type')
    .eq('org_id', orgId)
    .gte('visited_at', periodStartIso)
    .lt('visited_at', periodEndIso)
    .not('visit_type', 'in', '(reward_redeem,subscription_redeem)')
  if (locationId) visitsQuery = visitsQuery.eq('location_id', locationId)
  const { data: visits } = await visitsQuery
  const visitRows = visits ?? []
  const visitIds = visitRows.map((v) => v.id)

  // Campaign-redeemed visit ids
  const campaignVisitIds = new Set<string>()
  if (visitIds.length > 0) {
    const { data: redemptions } = await supabase
      .from('campaign_redemptions')
      .select('visit_id')
      .eq('org_id', orgId)
      .in('visit_id', visitIds)
    for (const r of redemptions ?? []) {
      if (r.visit_id) campaignVisitIds.add(r.visit_id as string)
    }
  }

  // Customer segments snapshot — for win-back: customers whose
  // PREVIOUS rfm_segment was 'at_risk' or 'lost' before this week's visit.
  // Heuristic: customers.rfm_segment_prev OR customers.last_visit_before.
  // If your schema doesn't track prior segment, use a fallback: customers
  // whose last_visit_at older than 14 days at the start of the week,
  // and who appear in this week's visits.
  const customerIdsInPeriod = Array.from(new Set(visitRows.map((v) => v.customer_id)))
  const winBackCustomerIds = new Set<string>()
  if (customerIdsInPeriod.length > 0) {
    const fourteenDaysBeforePeriod = new Date(new Date(periodStartIso).getTime() - 14 * 86400000).toISOString()
    const { data: candidates } = await supabase
      .from('customers')
      .select('id, last_visit_at, rfm_segment')
      .eq('org_id', orgId)
      .in('id', customerIdsInPeriod)
    for (const c of candidates ?? []) {
      // last_visit_at on customers is updated by visit triggers; we need the
      // pre-this-week value. Approximation: the customer's currently-stored
      // rfm_segment was computed at the latest daily-intelligence run.
      // If they ARE currently at_risk / lost they're a candidate.
      const seg = c.rfm_segment as string | null
      if (seg === 'at_risk' || seg === 'lost') {
        winBackCustomerIds.add(c.id as string)
        continue
      }
      // Fallback: if their last_visit_at field is older than 14 days
      // before the period start, count as win-back.
      const last = c.last_visit_at as string | null
      if (last && new Date(last).toISOString() < fourteenDaysBeforePeriod) {
        winBackCustomerIds.add(c.id as string)
      }
    }
  }

  // Per-visit revenue estimate
  function visitValue(v: { amount: number | null }): number {
    if (v.amount !== null && Number(v.amount) > 0) return Number(v.amount)
    return basket.value
  }

  let loyaltyTry = 0
  let deadHourTry = 0
  let campaignTry = 0
  let winBackTry = 0
  let loyaltyCount = 0
  let deadHourCount = 0
  let campaignCount = 0
  let winBackCount = 0

  for (const v of visitRows) {
    const val = visitValue(v)
    const isCampaign = campaignVisitIds.has(v.id)
    const isWinBack = winBackCustomerIds.has(v.customer_id)
    const isDead = !!v.is_dead_hour

    // Priority order: campaign > win_back > dead_hour > loyalty
    // (a visit only counts in one segment to avoid double-counting)
    if (isCampaign) {
      campaignTry += val
      campaignCount++
    } else if (isWinBack) {
      winBackTry += val
      winBackCount++
    } else if (isDead) {
      deadHourTry += val
      deadHourCount++
    } else {
      loyaltyTry += val
      loyaltyCount++
    }
  }

  // Subscription revenue: active subscriptions × monthly plan price,
  // pro-rated to the requested window length (price × days / 30).
  let subscriptionTry = 0
  let subscriptionCount = 0
  {
    let subQuery = supabase
      .from('customer_subscriptions')
      .select('plan_id, sold_at_location_id, subscription_plans(price_try)')
      .eq('org_id', orgId)
      .eq('status', 'active')
    if (locationId) subQuery = subQuery.eq('sold_at_location_id', locationId)
    const { data: subs } = await subQuery
    for (const s of (subs ?? []) as unknown as Array<{ subscription_plans: { price_try: number } | null }>) {
      const price = Number(s.subscription_plans?.price_try ?? 0)
      if (price > 0) {
        subscriptionTry += price * (periodDays / 30)
        subscriptionCount++
      }
    }
  }

  const total = round2(loyaltyTry + subscriptionTry + deadHourTry + campaignTry + winBackTry)

  const allSegments: Segment[] = [
    { key: 'loyalty', label: SEGMENT_LABELS.loyalty, value_try: round2(loyaltyTry), count: loyaltyCount, why: SEGMENT_WHY.loyalty },
    { key: 'subscription', label: SEGMENT_LABELS.subscription, value_try: round2(subscriptionTry), count: subscriptionCount, why: SEGMENT_WHY.subscription },
    { key: 'dead_hour', label: SEGMENT_LABELS.dead_hour, value_try: round2(deadHourTry), count: deadHourCount, why: SEGMENT_WHY.dead_hour },
    { key: 'campaign', label: SEGMENT_LABELS.campaign, value_try: round2(campaignTry), count: campaignCount, why: SEGMENT_WHY.campaign },
    { key: 'win_back', label: SEGMENT_LABELS.win_back, value_try: round2(winBackTry), count: winBackCount, why: SEGMENT_WHY.win_back },
  ]
  const segments: Segment[] = allSegments.filter((s) => s.value_try > 0)

  return {
    total_try: total,
    segments,
    avg_basket_try: basket.value,
    avg_basket_source: basket.source,
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

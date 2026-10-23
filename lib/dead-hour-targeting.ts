// Dead hour targeting engine
// Runs once per day in daily-intelligence AFTER the NBA loop completes.
// For customers NBA picked 'nothing' for, evaluates dead-hour slots today
// and creates drink-scoped discount offers for top candidates per slot.
// Learning via Thompson sampling on per-customer dead_hour_propensity.

import { SupabaseClient } from '@supabase/supabase-js'
import { thompsonSample } from './thompson-sampling'
import { getLocalDayAndHour } from './timezone'
import { generatePersonalizedMessage } from './intelligence'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DeadHourSlotRow {
  id: string
  org_id: string
  location_id: string
  day_of_week: number
  hour: number
  severity: number
  avg_visits: number
  overall_avg: number
  abandoned_at: string | null
}

export interface DeadHourWindow {
  locationId: string
  locationName: string
  locationTz: string
  dayOfWeek: number
  startHour: number        // inclusive
  endHour: number          // exclusive
  windowHours: number      // number of hour-rows combined
  avgVisitsPerHour: number
  severity: number         // max severity across rows in window
  slotIds: string[]        // dead_hour_suggestions.id values in this window
}

export interface PropensityRow {
  customer_id: string
  alpha: number
  beta: number
  visits_during_dead_hour: number
}

export interface Candidate {
  customerId: string
  fullName: string | null
  pushSubscription: unknown
  topItem: string          // guaranteed non-empty (cold-start filter)
  topItems: { item: string; count: number }[]
  preferredVisitDay: number | null
  primaryLocationId: string | null
  totalVisits: number
  firstVisitAt: string | null
  propensity: { alpha: number; beta: number; visits_during_dead_hour: number }
}

// ---------------------------------------------------------------------------
// Per-customer cooldown
// ---------------------------------------------------------------------------

// Scale the dead-hour push cooldown to the customer's natural cadence. A 72h
// flat cooldown locks daily/bi-daily regulars out of dead-hour targeting for
// 3 days after a single push, which misfires for specialty coffee cafés where
// the core segment visits every 2-3 days. We use 1.5× avgGap floored at 48h
// (absolute minimum breathing room) and capped at 72h (absolute maximum, to
// preserve the old behavior for slow-cadence customers).
const MIN_COOLDOWN_HOURS = 48
const MAX_COOLDOWN_HOURS = 72
export function computeCooldownHours(
  totalVisits: number,
  firstVisitAt: string | null,
  now: Date
): number {
  if (!firstVisitAt || totalVisits <= 1) return MAX_COOLDOWN_HOURS
  const lifetimeMs = now.getTime() - new Date(firstVisitAt).getTime()
  if (lifetimeMs <= 0) return MAX_COOLDOWN_HOURS
  const avgGapHours = (lifetimeMs / (totalVisits - 1)) / 3600000
  const scaled = avgGapHours * 1.5
  return Math.min(MAX_COOLDOWN_HOURS, Math.max(MIN_COOLDOWN_HOURS, scaled))
}

// ---------------------------------------------------------------------------
// Window clustering
// ---------------------------------------------------------------------------

export function clusterDeadHoursIntoWindows(
  rows: DeadHourSlotRow[],
  locationMap: Map<string, { name: string; timezone: string }>
): DeadHourWindow[] {
  // Group by (location_id, day_of_week)
  const groups = new Map<string, DeadHourSlotRow[]>()
  for (const r of rows) {
    const key = `${r.location_id}-${r.day_of_week}`
    const list = groups.get(key) || []
    list.push(r)
    groups.set(key, list)
  }

  const windows: DeadHourWindow[] = []
  for (const [, list] of groups) {
    list.sort((a, b) => a.hour - b.hour)
    let current: DeadHourSlotRow[] = []

    const flush = () => {
      if (current.length === 0) return
      const first = current[0]
      const last = current[current.length - 1]
      const loc = locationMap.get(first.location_id)
      if (!loc) { current = []; return }
      windows.push({
        locationId: first.location_id,
        locationName: loc.name,
        locationTz: loc.timezone,
        dayOfWeek: first.day_of_week,
        startHour: first.hour,
        endHour: last.hour + 1,
        windowHours: current.length,
        avgVisitsPerHour: current.reduce((s, r) => s + r.avg_visits, 0) / current.length,
        severity: Math.max(...current.map((r) => r.severity)),
        slotIds: current.map((r) => r.id),
      })
      current = []
    }

    for (const r of list) {
      if (current.length === 0 || r.hour === current[current.length - 1].hour + 1) {
        current.push(r)
      } else {
        flush()
        current.push(r)
      }
    }
    flush()
  }

  return windows
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export function scoreCandidate(candidate: Candidate, window: DeadHourWindow): number {
  const alpha = candidate.propensity.alpha || 1
  const beta = candidate.propensity.beta || 1
  const base = thompsonSample(alpha, beta)

  // Slot-fit bonus
  let fitBonus = 1.0
  if (candidate.preferredVisitDay === window.dayOfWeek) {
    fitBonus = 1.5
  } else if (candidate.propensity.visits_during_dead_hour > 0) {
    fitBonus = 1.2
  }

  return base * fitBonus
}

export function slotCapacity(window: DeadHourWindow, capacityMultiplier: number = 3): number {
  // max(avg visits during window * multiplier, 5 exploration floor)
  // capacityMultiplier is tuned per café maturity tier (ramping=1.5, full=3).
  // The floor of 5 is the exploration minimum — even in ramping mode we need
  // enough pushes per slot for Thompson Sampling to gather signal.
  const expected = window.avgVisitsPerHour * window.windowHours
  return Math.max(Math.floor(expected * capacityMultiplier), 5)
}

// ---------------------------------------------------------------------------
// Convert a local-timezone hour to a UTC ISO timestamp for today's date
// ---------------------------------------------------------------------------

export function localHourToUtcIso(now: Date, tz: string, hour: number): string {
  // Compute today's date in the target timezone
  const dateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const y = dateFmt.find((p) => p.type === 'year')?.value || '2026'
  const m = dateFmt.find((p) => p.type === 'month')?.value || '01'
  const d = dateFmt.find((p) => p.type === 'day')?.value || '01'

  // Compute offset minutes from UTC at this instant in this tz
  const tzFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  })
  const utcFmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  })
  const [tzH, tzM] = tzFmt.format(now).split(':').map(Number)
  const [utcH, utcM] = utcFmt.format(now).split(':').map(Number)
  let offsetMin = (tzH * 60 + tzM) - (utcH * 60 + utcM)
  if (offsetMin > 12 * 60) offsetMin -= 24 * 60
  if (offsetMin < -12 * 60) offsetMin += 24 * 60

  // Target: yyyy-mm-dd hour:00:00 LOCAL -> UTC
  const localMs = Date.parse(`${y}-${m}-${d}T${String(hour).padStart(2, '0')}:00:00Z`)
  return new Date(localMs - offsetMin * 60000).toISOString()
}

// ---------------------------------------------------------------------------
// Main entry point — called from daily-intelligence
// ---------------------------------------------------------------------------

export interface DeadHourConfig {
  severityThreshold: number   // minimum dead_hour_suggestions.severity to consider (0..1)
  capacityMultiplier: number  // slot capacity = max(avg*hours*multiplier, 5 floor)
}

export interface SelectDeadHourTargetsArgs {
  supabase: SupabaseClient
  orgId: string
  orgSlug: string
  now: Date
  nbaNothingSet: Set<string>    // customer_ids where NBA picked 'nothing' today
  deadHourDiscount: number       // org.dead_hour_discount
  quietStart?: number            // org quiet_hours_start as hour (default 9). Push won't fire before this.
  config?: DeadHourConfig        // defaults to { severityThreshold: 0.5, capacityMultiplier: 3 }
}

export interface SelectDeadHourTargetsResult {
  windowsEvaluated: number
  windowsSkippedUnreachable: number
  candidatesConsidered: number
  targeted: number
  skippedNoTopItem: number
  skippedRecentPush: number
  skippedNotNba: number
  skippedNotVisitedLocation: number
}

export async function selectDeadHourTargets(
  args: SelectDeadHourTargetsArgs
): Promise<SelectDeadHourTargetsResult> {
  const { supabase, orgId, orgSlug, now, nbaNothingSet, deadHourDiscount } = args
  const config = args.config || { severityThreshold: 0.5, capacityMultiplier: 3 }
  const quietStart = args.quietStart ?? 9
  const result: SelectDeadHourTargetsResult = {
    windowsEvaluated: 0,
    windowsSkippedUnreachable: 0,
    candidatesConsidered: 0,
    targeted: 0,
    skippedNoTopItem: 0,
    skippedRecentPush: 0,
    skippedNotNba: 0,
    skippedNotVisitedLocation: 0,
  }

  // 1. Fetch active (non-abandoned) dead-hour slots for this org
  const { data: slotRows } = await supabase
    .from('dead_hour_suggestions')
    .select('id, org_id, location_id, day_of_week, hour, severity, avg_visits, overall_avg, abandoned_at')
    .eq('org_id', orgId)
    .is('abandoned_at', null)
    .gt('severity', config.severityThreshold)

  if (!slotRows || slotRows.length === 0) return result

  // 2. Fetch locations for TZ/name lookups
  const { data: locationRows } = await supabase
    .from('locations')
    .select('id, name, timezone')
    .eq('org_id', orgId)
    .eq('is_active', true)

  const locationMap = new Map<string, { name: string; timezone: string }>()
  for (const loc of locationRows || []) {
    locationMap.set(loc.id, {
      name: loc.name,
      timezone: (loc as { timezone: string | null }).timezone || 'Europe/Istanbul',
    })
  }

  // 3. Cluster into windows
  const allWindows = clusterDeadHoursIntoWindows(slotRows as DeadHourSlotRow[], locationMap)

  // 4. Filter to windows that are TODAY in each location's local timezone
  const todayWindows = allWindows.filter((w) => {
    const { day } = getLocalDayAndHour(now, w.locationTz)
    return w.dayOfWeek === day
  })

  if (todayWindows.length === 0) return result
  result.windowsEvaluated = todayWindows.length

  // 5. Candidate pool: customers opted in, active, with push sub, with > 0 visits
  const { data: customers } = await supabase
    .from('customers')
    .select('id, full_name, push_subscription, top_items, preferred_visit_day, primary_location_id, total_visits, first_visit_at')
    .eq('org_id', orgId)
    .eq('push_opted_in', true)
    .eq('automation_status', 'active')
    .not('push_subscription', 'is', null)
    .gt('total_visits', 0)

  if (!customers || customers.length === 0) return result
  result.candidatesConsidered = customers.length
  const customerIds = customers.map((c) => c.id)

  // 6. Latest push timestamp per customer in the last MAX_COOLDOWN_HOURS
  //    window. We fetch up to the maximum possible cooldown in one batched
  //    query, then apply each customer's personal cooldown during the
  //    per-candidate loop below.
  const maxCooldownCutoff = new Date(now.getTime() - MAX_COOLDOWN_HOURS * 3600000).toISOString()
  const { data: recentPushes } = await supabase
    .from('notification_queue')
    .select('customer_id, created_at')
    .eq('org_id', orgId)
    .in('status', ['sent', 'queued'])
    .gte('created_at', maxCooldownCutoff)
    .in('customer_id', customerIds)
  const latestPushMap = new Map<string, number>()
  for (const p of recentPushes || []) {
    const t = new Date(p.created_at).getTime()
    const existing = latestPushMap.get(p.customer_id)
    if (!existing || t > existing) latestPushMap.set(p.customer_id, t)
  }

  // 7. Propensity map
  const { data: propRows } = await supabase
    .from('dead_hour_propensity')
    .select('customer_id, alpha, beta, visits_during_dead_hour')
    .eq('org_id', orgId)
    .in('customer_id', customerIds)
  const propMap = new Map<string, PropensityRow>()
  for (const p of propRows || []) {
    propMap.set(p.customer_id, p as PropensityRow)
  }

  // 8. Fetch the set of (customer, location) pairs — batched single query
  const visitedLocationSet = new Set<string>() // key: `${customerId}-${locationId}`
  const uniqueLocationIds = Array.from(new Set(todayWindows.map((w) => w.locationId)))
  if (uniqueLocationIds.length > 0) {
    const { data: visitors } = await supabase
      .from('visits')
      .select('customer_id, location_id')
      .in('location_id', uniqueLocationIds)
      .in('customer_id', customerIds)
    for (const v of visitors || []) {
      visitedLocationSet.add(`${v.customer_id}-${v.location_id}`)
    }
  }

  // 9. Build candidate objects
  const candidates: Candidate[] = []
  for (const c of customers) {
    const items = (c.top_items as { item: string; count: number }[] | null) || []
    const topItem = items[0]?.item
    if (!topItem) { result.skippedNoTopItem++; continue } // cold-start filter
    candidates.push({
      customerId: c.id,
      fullName: c.full_name,
      pushSubscription: c.push_subscription,
      topItem,
      topItems: items,
      preferredVisitDay: (c as { preferred_visit_day: number | null }).preferred_visit_day,
      primaryLocationId: (c as { primary_location_id: string | null }).primary_location_id,
      totalVisits: (c as { total_visits: number }).total_visits,
      firstVisitAt: (c as { first_visit_at: string | null }).first_visit_at,
      propensity: propMap.get(c.id) || { alpha: 1, beta: 1, visits_during_dead_hour: 0 },
    })
  }

  // 10. For each window: check reachability, filter eligible, score, pick top capacity, queue push + offer
  const alreadyPickedToday = new Set<string>()
  for (const window of todayWindows) {
    // Compute the earliest push time that respects quiet hours: 1 hour before
    // window opens, clamped to quietStart. If that time is already past the
    // window's end, the customer can't see the push in time to visit — skip.
    const pushHourLocal = Math.max(quietStart, window.startHour - 1)
    if (pushHourLocal >= window.endHour) {
      result.windowsSkippedUnreachable++
      continue
    }

    const eligible: Array<{ candidate: Candidate; score: number }> = []
    for (const candidate of candidates) {
      if (alreadyPickedToday.has(candidate.customerId)) continue
      if (!nbaNothingSet.has(candidate.customerId)) { result.skippedNotNba++; continue }
      const latestPushMs = latestPushMap.get(candidate.customerId)
      if (latestPushMs !== undefined) {
        const personalCooldownMs = computeCooldownHours(
          candidate.totalVisits,
          candidate.firstVisitAt,
          now
        ) * 3600000
        if ((now.getTime() - latestPushMs) < personalCooldownMs) {
          result.skippedRecentPush++
          continue
        }
      }
      if (!visitedLocationSet.has(`${candidate.customerId}-${window.locationId}`)) {
        result.skippedNotVisitedLocation++
        continue
      }
      eligible.push({ candidate, score: scoreCandidate(candidate, window) })
    }

    const capacity = slotCapacity(window, config.capacityMultiplier)
    eligible.sort((a, b) => b.score - a.score)
    const picked = eligible.slice(0, capacity)

    for (const { candidate } of picked) {
      alreadyPickedToday.add(candidate.customerId)
      await queueDeadHourPush({
        supabase, orgId, orgSlug, now, customer: candidate, window, deadHourDiscount,
        pushHourLocal,
      })
      result.targeted++
    }
  }

  return result
}

// ---------------------------------------------------------------------------
// Internal: build and insert the push + offer + audit row for one target
// ---------------------------------------------------------------------------

interface QueueArgs {
  supabase: SupabaseClient
  orgId: string
  orgSlug: string
  now: Date
  customer: Candidate
  window: DeadHourWindow
  deadHourDiscount: number
  pushHourLocal: number  // local hour to schedule push (pre-computed by caller)
}

async function queueDeadHourPush(args: QueueArgs): Promise<void> {
  const { supabase, orgId, orgSlug, now, customer, window, deadHourDiscount, pushHourLocal } = args

  const timeRangeStr = `${String(window.startHour).padStart(2, '0')}:00-${String(window.endHour).padStart(2, '0')}:00`

  const message = generatePersonalizedMessage(
    {
      full_name: customer.fullName,
      top_items: customer.topItems,
      optimal_discount: null,
    },
    {
      type: 'dead_hour',
      defaultDiscount: deadHourDiscount,
      deadHourStart: `${String(window.startHour).padStart(2, '0')}:00`,
      deadHourEnd: `${String(window.endHour).padStart(2, '0')}:00`,
    },
    { name: window.locationName },
    null
  )

  const expiresAt = localHourToUtcIso(now, window.locationTz, window.endHour)

  // 1. Schedule push at pushHourLocal in the location's timezone.
  //    max(quietStart, windowStart - 1) — before window opens, never in quiet hours.
  //    Check BEFORE creating the offer so we don't leak orphan offers when the
  //    cron ran late. Rolling forward to tomorrow doesn't help because the
  //    offer's expiresAt is today's window end.
  const scheduledForIso = localHourToUtcIso(now, window.locationTz, pushHourLocal)
  const scheduledFor = new Date(scheduledForIso)
  if (scheduledFor.getTime() < now.getTime()) {
    console.log('[dead-hour] push time already passed, aborting',
      { customerId: customer.customerId, scheduledFor: scheduledForIso, now: now.toISOString() })
    return
  }

  // 2. Create customer_offers row (drink-scoped). If this fails, abort the push
  // entirely — a push that advertises a specific discount but links to a generic
  // page is worse than no push at all.
  const { data: offer, error: offerError } = await supabase
    .from('customer_offers')
    .insert({
      org_id: orgId,
      customer_id: customer.customerId,
      type: 'dead_hour_targeted',
      title: `${customer.topItem} %${deadHourDiscount} indirim`,
      description: message,
      offer_type: 'discount_percent',
      offer_value: deadHourDiscount,
      free_item_name: customer.topItem,
      applies_to_item: customer.topItem,
      status: 'active',
      expires_at: expiresAt,
    })
    .select('id')
    .single()

  if (offerError || !offer) {
    console.error('[dead-hour] customer_offers insert failed, aborting push', {
      orgId, customerId: customer.customerId, error: offerError?.message,
    })
    return
  }

  // 3. Queue push (offer.id guaranteed to exist at this point)
  await supabase.from('notification_queue').insert({
    org_id: orgId,
    customer_id: customer.customerId,
    title: `${timeRangeStr} arası ${customer.topItem} %${deadHourDiscount} indirimli`,
    body: message,
    url: `/?tab=magaza&offer=${offer.id}`,
    scheduled_for: scheduledFor.toISOString(),
    notification_type: 'dead_hour_targeted',
    offer_type: 'discount_percent',
    offer_value: deadHourDiscount,
    personalization_tier: 'tier2',
  })

  // 4. Audit row
  await supabase.from('notification_audit').insert({
    org_id: orgId,
    customer_id: customer.customerId,
    decision_date: now.toISOString().split('T')[0],
    action_chosen: 'dead_hour_targeted',
    action_reason: `Dead hour ${window.dayOfWeek} ${timeRangeStr}`,
    tier: 3,
    discount_used: deadHourDiscount,
    was_holdback: false,
    outcome: 'pending',
    attribution_window_hours: 24,
    scheduled_for: scheduledFor.toISOString(),
    customer_state_json: {
      dead_hour_slot_ids: window.slotIds,
      window_day: window.dayOfWeek,
      window_start: window.startHour,
      window_end: window.endHour,
      location_id: window.locationId,
      top_item: customer.topItem,
    },
  })
}

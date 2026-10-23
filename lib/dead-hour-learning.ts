// Dead hour learning loop
// Called once per day from daily-intelligence the day AFTER a dead_hour_targeted
// push was sent. Reads pending notification_audit rows, checks whether the
// customer visited the right location in the right window, and updates
// dead_hour_propensity (Thompson sampling state) accordingly. Also abandons
// slots that have had 20+ attempts and 0 conversions over the last 4 weeks.

import { SupabaseClient } from '@supabase/supabase-js'

// ---------------------------------------------------------------------------
// Learning loop — called next day from daily-intelligence
// ---------------------------------------------------------------------------

// TODO(perf): batch query when customer count > 200. Currently this function
// issues ~4 sequential Supabase round-trips per pending audit row (visits query,
// offers query, propensity SELECT, propensity UPDATE, audit UPDATE). For a café
// with ~12 audit rows per day this is fine. For a 500-customer chain sending
// ~150 dead-hour pushes per day that's 600+ round-trips and this cron will
// start timing out. Rewrite as: single batched visits query with .in(customer_id)
// + .in(location_id) + date range, single batched offers query same shape,
// bulk upsert to dead_hour_propensity via RPC. Do this BEFORE onboarding the
// first chain with >200 active customers.
export async function resolveDeadHourAttributions(
  supabase: SupabaseClient,
  orgId: string,
  now: Date
): Promise<{ resolved: number }> {
  // Look at yesterday's dead_hour_targeted decisions that haven't yet been
  // processed by the learning loop. We filter by dead_hour_learned_at IS NULL
  // instead of outcome='pending' because resolveAttributionOnVisit flips the
  // outcome to 'visited' in real time — if we only scanned pending rows we'd
  // never credit successful conversions, and Thompson Sampling would learn
  // only from misses (biasing alpha down over time). See migration
  // 20260411000001_dead_hour_learned_at.sql for context.
  const yesterdayStr = new Date(now.getTime() - 1 * 86400000).toISOString().split('T')[0]
  const twoDaysAgoStr = new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0]

  const { data: auditRows } = await supabase
    .from('notification_audit')
    .select('id, customer_id, scheduled_for, decision_date, customer_state_json, outcome')
    .eq('org_id', orgId)
    .eq('action_chosen', 'dead_hour_targeted')
    .is('dead_hour_learned_at', null)
    .gte('decision_date', twoDaysAgoStr)
    .lte('decision_date', yesterdayStr)

  let resolved = 0
  for (const row of auditRows || []) {
    const state = (row.customer_state_json || {}) as {
      window_start?: number
      window_end?: number
      location_id?: string
    }
    const locationId = state.location_id
    const startHour = state.window_start
    const endHour = state.window_end
    if (!locationId || startHour == null || endHour == null) continue

    // Window: hours [startHour, endHour). ± 30 min grace: allow startHour - 1
    // (catches 30 min early) and endHour (catches 30 min late in next hour slot).
    const minHour = Math.max(0, startHour - 1)
    const maxHour = endHour

    // Fetch visits by this customer at this location on the decision_date.
    // Widen UTC bounds by ±12 hours to catch visits whose local date matches
    // decisionDate but whose UTC timestamp lands on the day before or after
    // (Turkey is UTC+3, so a 01:00 local visit is stored as 22:00 UTC previous
    // day). We then filter in memory using local day_of_week + hour_of_day,
    // which visit-processing.ts stores as the local timezone values.
    const decisionDate = (row.decision_date as string) || (row.scheduled_for as string)?.split('T')[0]
    if (!decisionDate) continue

    const decisionMs = new Date(`${decisionDate}T00:00:00Z`).getTime()
    const windowStartMs = decisionMs - 12 * 3600000
    const windowEndMs = decisionMs + 36 * 3600000 // +24h of the day + 12h buffer

    const { data: visits } = await supabase
      .from('visits')
      .select('id, hour_of_day, day_of_week, visited_at')
      .eq('customer_id', row.customer_id)
      .eq('location_id', locationId)
      .gte('visited_at', new Date(windowStartMs).toISOString())
      .lte('visited_at', new Date(windowEndMs).toISOString())

    // Match by local day_of_week + hour_of_day (these are stored with the
    // location's local timezone, not UTC — see visit-processing.ts).
    const decisionDayOfWeek = new Date(`${decisionDate}T00:00:00Z`).getUTCDay()
    let inWindow = false
    for (const v of visits || []) {
      const h = v.hour_of_day as number
      const dow = v.day_of_week as number
      if (dow === decisionDayOfWeek && h >= minHour && h <= maxHour) { inWindow = true; break }
    }

    // Check if the offer was claimed/redeemed via QR (same widened bounds)
    const { data: offers } = await supabase
      .from('customer_offers')
      .select('id, status')
      .eq('customer_id', row.customer_id)
      .eq('org_id', orgId)
      .eq('type', 'dead_hour_targeted')
      .gte('created_at', new Date(windowStartMs).toISOString())
      .lte('created_at', new Date(windowEndMs).toISOString())

    let redeemedViaQr = false
    for (const o of offers || []) {
      if (o.status === 'claimed' || o.status === 'redeemed') { redeemedViaQr = true; break }
    }

    // Propensity update
    let alphaDelta = 0
    let betaDelta = 0
    if (inWindow && redeemedViaQr) { alphaDelta = 2; betaDelta = 0 }
    else if (inWindow)             { alphaDelta = 1; betaDelta = 0 }
    else                           { alphaDelta = 0; betaDelta = 1 }

    await upsertPropensity(supabase, orgId, row.customer_id, alphaDelta, betaDelta)

    // Always stamp dead_hour_learned_at so we don't double-process. Only
    // overwrite the user-facing outcome if it's still pending — if the
    // real-time resolver already flipped it to 'visited', keep that. The
    // learning loop uses a STRICTER window check (visit hour must fall inside
    // the slot window ± 1h grace), while the resolver uses a looser 24h
    // check. They'll usually agree, but on disagreement we trust the
    // resolver's decision for user-facing state and just record our own
    // propensity delta.
    const updatePayload: Record<string, unknown> = {
      dead_hour_learned_at: now.toISOString(),
    }
    if (row.outcome === 'pending') {
      updatePayload.outcome = inWindow ? 'visited' : 'no_visit'
      updatePayload.outcome_resolved_at = now.toISOString()
    }
    await supabase.from('notification_audit').update(updatePayload).eq('id', row.id)

    resolved++
  }

  return { resolved }
}

async function upsertPropensity(
  supabase: SupabaseClient,
  orgId: string,
  customerId: string,
  alphaDelta: number,
  betaDelta: number
): Promise<void> {
  const { data: existing } = await supabase
    .from('dead_hour_propensity')
    .select('alpha, beta, dead_hour_attempts, dead_hour_successes')
    .eq('org_id', orgId)
    .eq('customer_id', customerId)
    .maybeSingle()

  if (existing) {
    await supabase.from('dead_hour_propensity').update({
      alpha: existing.alpha + alphaDelta,
      beta: existing.beta + betaDelta,
      dead_hour_attempts: existing.dead_hour_attempts + 1,
      dead_hour_successes: existing.dead_hour_successes + (alphaDelta > 0 ? 1 : 0),
      updated_at: new Date().toISOString(),
    }).eq('org_id', orgId).eq('customer_id', customerId)
  } else {
    await supabase.from('dead_hour_propensity').insert({
      org_id: orgId,
      customer_id: customerId,
      alpha: 1 + alphaDelta,
      beta: 1 + betaDelta,
      dead_hour_attempts: 1,
      dead_hour_successes: alphaDelta > 0 ? 1 : 0,
    })
  }
}

// ---------------------------------------------------------------------------
// Abandonment checker — mark slots with 20+ attempts and 0 conversions as abandoned
// ---------------------------------------------------------------------------

export async function checkSlotAbandonment(
  supabase: SupabaseClient,
  orgId: string,
  now: Date
): Promise<{ abandoned: number }> {
  const fourWeeksAgoDate = new Date(now.getTime() - 28 * 86400000).toISOString().split('T')[0]

  const { data: slots } = await supabase
    .from('dead_hour_suggestions')
    .select('id')
    .eq('org_id', orgId)
    .is('abandoned_at', null)

  if (!slots || slots.length === 0) return { abandoned: 0 }

  const { data: audits } = await supabase
    .from('notification_audit')
    .select('id, outcome, customer_state_json')
    .eq('org_id', orgId)
    .eq('action_chosen', 'dead_hour_targeted')
    .gte('decision_date', fourWeeksAgoDate)

  const perSlot = new Map<string, { total: number; visited: number }>()
  for (const a of audits || []) {
    const state = (a.customer_state_json || {}) as { dead_hour_slot_ids?: string[] }
    for (const sid of state.dead_hour_slot_ids || []) {
      const agg = perSlot.get(sid) || { total: 0, visited: 0 }
      agg.total++
      if (a.outcome === 'visited') agg.visited++
      perSlot.set(sid, agg)
    }
  }

  let abandoned = 0
  for (const slot of slots) {
    const agg = perSlot.get(slot.id)
    if (!agg) continue
    if (agg.total >= 20 && agg.visited === 0) {
      await supabase.from('dead_hour_suggestions').update({
        abandoned_at: now.toISOString(),
      }).eq('id', slot.id)
      abandoned++
    }
  }

  return { abandoned }
}

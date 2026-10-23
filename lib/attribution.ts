import { SupabaseClient } from '@supabase/supabase-js'

/**
 * When a customer visits (barista scan), check if any pending notifications
 * should be attributed to this visit. Uses per-action attribution windows.
 */
export async function resolveAttributionOnVisit(
  supabase: SupabaseClient,
  customerId: string,
  visitId: string,
  locationId: string
) {
  const now = new Date()
  // Look back max 7 days for any pending attributions
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 3600000).toISOString()

  const { data: pending } = await supabase
    .from('notification_audit')
    .select('id, attribution_window_hours, scheduled_for, customer_state_json')
    .eq('customer_id', customerId)
    .eq('outcome', 'pending')
    .gte('scheduled_for', sevenDaysAgo)

  for (const n of pending || []) {
    const windowMs = (n.attribution_window_hours || 24) * 3600000
    const scheduledDate = new Date(n.scheduled_for)
    if (now.getTime() - scheduledDate.getTime() > windowMs) continue

    // Location gate: if the audit was scoped to a specific location, only
    // attribute when the visit happened at that location. Audits without a
    // location_id in state (e.g. pre-change rows, or location-agnostic
    // actions like birthday/streak_reminder/near_reward) attribute as before.
    const auditLocId = (n.customer_state_json as { location_id?: string } | null)?.location_id
    if (auditLocId && auditLocId !== locationId) continue

    await supabase.from('notification_audit')
      .update({
        outcome: 'visited',
        outcome_visit_id: visitId,
        outcome_resolved_at: now.toISOString(),
      })
      .eq('id', n.id)
  }
}

/**
 * Expire notification_audit records whose attribution window has passed
 * without a customer visit. Called in daily-intelligence cron.
 */
export async function expirePendingAttributions(
  supabase: SupabaseClient,
  orgId: string
) {
  const now = new Date()

  const { data: pending } = await supabase
    .from('notification_audit')
    .select('id, attribution_window_hours, scheduled_for')
    .eq('org_id', orgId)
    .eq('outcome', 'pending')

  let expired = 0
  for (const n of pending || []) {
    const windowMs = (n.attribution_window_hours || 24) * 3600000
    const scheduledDate = new Date(n.scheduled_for)
    if (now.getTime() - scheduledDate.getTime() > windowMs) {
      await supabase.from('notification_audit')
        .update({
          outcome: 'no_visit',
          outcome_resolved_at: now.toISOString(),
        })
        .eq('id', n.id)
      expired++
    }
  }
  return expired
}

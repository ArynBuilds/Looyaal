// Find-or-create a customer membership for (org, phone), mirroring the original
// onboarding side-effects: customer row, welcome loyalty card (1 stamp), signup
// visit. Used by the phone login route.

import type { createAdminClient } from '@/lib/supabase/admin'

type Admin = ReturnType<typeof createAdminClient>

export interface MembershipOpts {
  fullName?: string | null
}

export interface MembershipResult {
  customer: { id: string; phone: string; full_name: string | null }
  isNew: boolean
}

export async function ensureMembership(
  admin: Admin,
  orgId: string,
  phone: string,
  opts: MembershipOpts = {},
): Promise<MembershipResult> {
  const { data: existing } = await admin
    .from('customers')
    .select('id, phone, full_name')
    .eq('org_id', orgId)
    .eq('phone', phone)
    .maybeSingle()

  if (existing) {
    return { customer: { id: existing.id, phone: existing.phone, full_name: existing.full_name }, isNew: false }
  }

  const now = new Date()
  const nowIso = now.toISOString()

  const { data: created, error: createError } = await admin
    .from('customers')
    .insert({
      org_id: orgId,
      phone,
      full_name: opts.fullName || null,
      first_visit_at: nowIso,
      last_visit_at: nowIso,
      total_visits: 1,
      push_opted_in: true,
    })
    .select('id, phone, full_name')
    .single()

  if (createError || !created) {
    throw new Error(createError?.message || 'customer_create_failed')
  }

  const { data: program } = await admin
    .from('loyalty_programs')
    .select('id')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .maybeSingle()

  if (program) {
    await admin.from('loyalty_cards').insert({
      org_id: orgId,
      customer_id: created.id,
      program_id: program.id,
      current_stamps: 1,
      total_stamps: 1,
    })
  }

  const { data: primaryLocation } = await admin
    .from('locations')
    .select('id, timezone')
    .eq('org_id', orgId)
    .eq('is_active', true)
    .order('is_primary', { ascending: false })
    .limit(1)
    .single()

  if (primaryLocation) {
    const { getLocalDayAndHour } = await import('@/lib/timezone')
    const locTz = (primaryLocation as { timezone: string | null }).timezone || 'Europe/Istanbul'
    const { day: localDay, hour: localHour } = getLocalDayAndHour(now, locTz)
    await admin.from('visits').insert({
      org_id: orgId,
      location_id: primaryLocation.id,
      customer_id: created.id,
      visit_type: 'signup_bonus',
      visited_at: nowIso,
      day_of_week: localDay,
      hour_of_day: localHour,
      stamps_earned: 1,
    })
  }


  return { customer: { id: created.id, phone: created.phone, full_name: created.full_name }, isNew: true }
}

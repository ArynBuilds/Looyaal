// lib/ensure-primary-location.ts — Make sure an org has at least one active
// location. Called when the owner finishes onboarding.

import { createAdminClient } from '@/lib/supabase/admin'

export async function ensurePrimaryLocation(orgId: string): Promise<void> {
  const client = createAdminClient()

  const { count } = await client
    .from('locations')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('is_active', true)

  if ((count ?? 0) > 0) return

  const { data: orgInfo } = await client
    .from('organizations')
    .select('name, city, address')
    .eq('id', orgId)
    .maybeSingle()

  await client.from('locations').insert({
    org_id: orgId,
    name: (orgInfo?.name || 'Sube') + ' - Ana Sube',
    city: orgInfo?.city || '',
    address: orgInfo?.address || '',
    is_active: true,
    is_primary: true,
  })
}

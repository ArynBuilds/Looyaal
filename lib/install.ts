// lib/install.ts — Single-cafe install state. One install serves exactly one
// organization; the first visitor creates the owner account and that org.

import { createAdminClient } from '@/lib/supabase/admin'

export interface InstallState {
  hasOwner: boolean
  orgSlug: string | null
  onboarded: boolean
}

export async function getInstallState(): Promise<InstallState> {
  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('slug, onboarding_completed')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  return {
    hasOwner: Boolean(org),
    orgSlug: org?.slug ?? null,
    onboarded: Boolean(org?.onboarding_completed),
  }
}

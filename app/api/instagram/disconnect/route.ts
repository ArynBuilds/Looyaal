import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  const orgId = userData.org_id

  // Clear Instagram tokens from organization
  await admin.from('organizations').update({
    instagram_access_token: null,
    instagram_user_id: null,
    instagram_page_id: null,
    instagram_connected_at: null,
  }).eq('id', orgId)

  // Delete all influencer data for this org (Meta Platform Terms: data must not persist without active connection)
  await admin.from('influencers').delete().eq('org_id', orgId)

  return NextResponse.json({ ok: true })
}

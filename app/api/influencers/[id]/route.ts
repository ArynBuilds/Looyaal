import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  // Verify influencer belongs to this org before deleting
  const { data: influencer } = await admin.from('influencers').select('id').eq('id', id).eq('org_id', userData.org_id).single()
  if (!influencer) {
    return NextResponse.json({ error: 'Influencer bulunamadı' }, { status: 404 })
  }

  await admin.from('influencers').delete().eq('id', id).eq('org_id', userData.org_id)

  return NextResponse.json({ ok: true })
}

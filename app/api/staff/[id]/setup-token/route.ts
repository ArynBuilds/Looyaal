import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { issueBaristaSetupToken } from '@/lib/barista-setup-token'
import { NextResponse } from 'next/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') return NextResponse.json({ error: 'Only owners' }, { status: 403 })

  const { data: target } = await admin
    .from('users')
    .select('id, org_id, role, is_active')
    .eq('id', id)
    .single()

  if (!target || target.org_id !== userData.org_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (target.role !== 'barista' && target.role !== 'manager') {
    return NextResponse.json({ error: 'Cannot issue setup token for this role' }, { status: 400 })
  }
  if (!target.is_active) {
    return NextResponse.json({ error: 'User is inactive' }, { status: 400 })
  }

  const { token, expiresAt } = await issueBaristaSetupToken(admin, {
    userId: target.id,
    orgId: target.org_id,
    issuedBy: user.id,
  })

  return NextResponse.json({ setupToken: token, setupExpiresAt: expiresAt })
}

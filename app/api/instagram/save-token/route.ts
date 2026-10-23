import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getInstagramBusinessAccountId } from '@/lib/instagram'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  const { accessToken, state } = await request.json()
  if (!accessToken) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  // Verify state matches this org
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
      if (decoded.orgId !== userData.org_id) {
        return NextResponse.json({ error: 'Invalid state' }, { status: 400 })
      }
    } catch { /* state validation is best-effort */ }
  }

  // Find Instagram Business Account via Facebook Pages
  const igAccount = await getInstagramBusinessAccountId(accessToken)

  if (!igAccount) {
    return NextResponse.json({
      error: 'Instagram Business hesabı bulunamadı. Instagram hesabınızın bir Facebook Sayfasına bağlı olduğundan emin olun.',
    }, { status: 400 })
  }

  // Store on the organization
  await admin.from('organizations').update({
    instagram_access_token: accessToken,
    instagram_user_id: igAccount.userId,
    instagram_page_id: igAccount.pageId,
    instagram_connected_at: new Date().toISOString(),
  }).eq('id', userData.org_id)

  return NextResponse.json({ ok: true, userId: igAccount.userId })
}

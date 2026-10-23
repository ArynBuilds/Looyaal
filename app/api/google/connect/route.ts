import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildOAuthUrl } from '@/lib/google-business'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const locationId = searchParams.get('locationId')
  if (!locationId) return NextResponse.json({ error: 'locationId required' }, { status: 400 })

  // Verify location belongs to this org
  const { data: loc } = await admin.from('locations').select('id').eq('id', locationId).eq('org_id', userData.org_id).single()
  if (!loc) return NextResponse.json({ error: 'Location not found' }, { status: 404 })

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const redirectUri = `${APP_URL}/api/google/callback`
  const url = buildOAuthUrl(locationId, redirectUri)

  return NextResponse.redirect(url)
}

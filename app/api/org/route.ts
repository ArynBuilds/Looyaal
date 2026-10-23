import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { ensurePrimaryLocation } from '@/lib/ensure-primary-location'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data: org, error } = await admin
    .from('organizations')
    .select('*')
    .eq('id', userData.org_id)
    .single()

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json(org)
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (userData.role !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  const body = await request.json()

  // Only allow safe fields to be updated.
  // Note: quiet_hours_start/end + max_notifications_per_week intentionally
  // omitted — owners no longer override these via UI; the AI engine uses
  // platform defaults (09:00–21:00, 4/week) with column-level fallbacks.
  const allowedFields = [
    'name', 'logo_url', 'banner_url', 'primary_color', 'phone', 'email',
    'address', 'city', 'pwa_theme', 'onboarding_completed',
    'pwa_config', 'estimated_daily_customers', 'surprise_pool',
    'min_discount', 'max_discount',
  ] as const
  const safeBody: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) safeBody[key] = body[key]
  }

  const { error } = await admin
    .from('organizations')
    .update(safeBody)
    .eq('id', userData.org_id)

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }

  // Finishing onboarding gives the cafe its first branch.
  if (safeBody.onboarding_completed === true) {
    await ensurePrimaryLocation(userData.org_id)
  }
  return NextResponse.json({ ok: true })
}

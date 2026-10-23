import { createAdminClient } from '@/lib/supabase/admin'
import { lookupBaristaSetupToken } from '@/lib/barista-setup-token'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get('t')
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const admin = createAdminClient()
  const lookup = await lookupBaristaSetupToken(admin, token)
  if (!lookup) return NextResponse.json({ error: 'Gecersiz veya suresi dolmus QR' }, { status: 401 })

  const { data: targetUser } = await admin
    .from('users')
    .select('full_name, assigned_locations')
    .eq('id', lookup.userId)
    .single()

  const { data: org } = await admin
    .from('organizations')
    .select('name, slug')
    .eq('id', lookup.orgId)
    .single()

  let locationName: string | null = null
  if (targetUser?.assigned_locations?.[0]) {
    const { data: loc } = await admin
      .from('locations')
      .select('name')
      .eq('id', targetUser.assigned_locations[0])
      .single()
    locationName = loc?.name ?? null
  }

  return NextResponse.json({
    displayName: targetUser?.full_name ?? null,
    orgName: org?.name ?? null,
    orgSlug: org?.slug ?? null,
    locationName,
  })
}

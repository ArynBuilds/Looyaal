import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { syntheticBaristaEmail } from '@/lib/synthetic-email'
import { nextBaristaDisplayName } from '@/lib/barista-display-name'
import { issueBaristaSetupToken } from '@/lib/barista-setup-token'

const createSchema = z.object({
  location_id: z.string().uuid(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') return NextResponse.json({ error: 'Only owners can manage staff' }, { status: 403 })

  const { data } = await admin
    .from('users')
    .select('id, full_name, role, assigned_locations, is_active, created_at')
    .eq('org_id', userData.org_id)
    .neq('id', user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') return NextResponse.json({ error: 'Only owners' }, { status: 403 })

  let parsed: z.infer<typeof createSchema>
  try {
    parsed = createSchema.parse(await request.json())
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const { data: location } = await admin
    .from('locations')
    .select('id, org_id')
    .eq('id', parsed.location_id)
    .single()
  if (!location || location.org_id !== userData.org_id) {
    return NextResponse.json({ error: 'Invalid location' }, { status: 400 })
  }

  const displayName = await nextBaristaDisplayName(admin, userData.org_id)
  const email = syntheticBaristaEmail()

  const { data: authUser, error: authError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  })
  if (authError || !authUser?.user) {
    return NextResponse.json({ error: authError?.message ?? 'Auth user create failed' }, { status: 500 })
  }

  // Upsert handles two real-world cases cleanly:
  //   (a) Some triggers on auth.users insert a placeholder public.users row.
  //   (b) Previous failed attempts may have left an orphan row when the
  //       rollback deleteUser() didn't propagate.
  // The trigger's org_name guard means it won't flip an owner row by accident.
  const { error: insertError } = await admin.from('users').upsert({
    id: authUser.user.id,
    org_id: userData.org_id,
    email,
    full_name: displayName,
    role: 'barista',
    assigned_locations: [parsed.location_id],
    is_active: true,
  }, { onConflict: 'id' })
  if (insertError) {
    console.error('[staff/POST] users upsert failed', JSON.stringify({
      message: insertError.message,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
      orgId: userData.org_id,
      locationId: parsed.location_id,
    }))
    await admin.auth.admin.deleteUser(authUser.user.id)
    return NextResponse.json({ error: `DB: ${insertError.message}` }, { status: 500 })
  }

  const { token, expiresAt } = await issueBaristaSetupToken(admin, {
    userId: authUser.user.id,
    orgId: userData.org_id,
    issuedBy: user.id,
  })

  return NextResponse.json({
    id: authUser.user.id,
    displayName,
    assignedLocationId: parsed.location_id,
    setupToken: token,
    setupExpiresAt: expiresAt,
  })
}

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { consumeBaristaSetupToken, lookupBaristaSetupToken } from '@/lib/barista-setup-token'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const setupSchema = z.object({
  t: z.string().length(32),
  password: z.string().min(8).max(128),
})

export async function POST(request: Request) {
  let body: z.infer<typeof setupSchema>
  try {
    body = setupSchema.parse(await request.json())
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const admin = createAdminClient()
  const lookup = await lookupBaristaSetupToken(admin, body.t)
  if (!lookup) return NextResponse.json({ error: 'Gecersiz veya suresi dolmus QR' }, { status: 401 })

  const consumed = await consumeBaristaSetupToken(admin, lookup.rowId)
  if (!consumed) return NextResponse.json({ error: 'Bu QR zaten kullanildi' }, { status: 409 })

  const { data: targetUser } = await admin
    .from('users')
    .select('id, email, full_name, org_id, is_active')
    .eq('id', lookup.userId)
    .single()
  if (!targetUser || !targetUser.is_active) {
    return NextResponse.json({ error: 'Kullanici pasif' }, { status: 403 })
  }

  const { error: passError } = await admin.auth.admin.updateUserById(targetUser.id, {
    password: body.password,
    ban_duration: 'none',
  } as { password: string; ban_duration: string })
  if (passError) return NextResponse.json({ error: passError.message }, { status: 500 })

  const { data: org } = await admin
    .from('organizations')
    .select('slug')
    .eq('id', targetUser.org_id)
    .single()

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: targetUser.email,
    password: body.password,
  })
  if (signInError) return NextResponse.json({ error: signInError.message }, { status: 500 })

  const res = NextResponse.json({
    ok: true,
    orgSlug: org?.slug,
    displayName: targetUser.full_name,
  })
  res.cookies.set('barista_handle', targetUser.id, {
    path: '/',
    maxAge: 365 * 24 * 60 * 60,
    sameSite: 'lax',
    secure: true,
    httpOnly: false,
  })
  return res
}

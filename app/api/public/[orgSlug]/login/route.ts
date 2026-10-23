import { createAdminClient } from '@/lib/supabase/admin'
import { ensureMembership } from '@/lib/customer-membership'
import { signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/customer-session'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Phone-only customer login. There is no SMS verification step: the phone
// number is the identity. See SECURITY.md for the trust trade-off.
const schema = z.object({
  phone: z.string().regex(/^\+90\d{10}$/, 'Geçerli bir telefon numarası girin (+90...)'),
  fullName: z.string().max(80).optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params
    const { phone, fullName } = schema.parse(await request.json())

    const supabase = createAdminClient()
    const { data: org } = await supabase
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const { customer, isNew } = await ensureMembership(supabase, org.id, phone, { fullName })

    const res = NextResponse.json({
      customer: { id: customer.id, phone: customer.phone, full_name: customer.full_name },
      isNew,
    })
    res.cookies.set(SESSION_COOKIE, signSession(phone), sessionCookieOptions())
    return res
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

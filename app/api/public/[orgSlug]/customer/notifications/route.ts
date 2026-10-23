import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
  // Optional: when omitted, the endpoint toggles the current value. Lets the
  // PWA's "Bildirim Ayarları" menu item work as a one-tap toggle without
  // needing a separate settings screen.
  push_opted_in: z.boolean().optional(),
})

// PATCH: Toggle push notification opt-in for a customer
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { customerId } = parsed.data
  let { push_opted_in } = parsed.data

  const admin = createAdminClient()
  const { data: org } = await admin.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  // If caller didn't specify a value, flip whatever the customer has now.
  if (push_opted_in === undefined) {
    const { data: current } = await admin
      .from('customers')
      .select('push_opted_in')
      .eq('id', customerId)
      .eq('org_id', org.id)
      .single()
    if (!current) return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
    push_opted_in = !current.push_opted_in
  }

  const { error } = await admin.from('customers')
    .update({
      push_opted_in,
      push_subscription: push_opted_in ? undefined : null, // Clear subscription if opting out
    })
    .eq('id', customerId)
    .eq('org_id', org.id)

  if (error) return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  return NextResponse.json({ ok: true, push_opted_in })
}

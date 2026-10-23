import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
})

// POST: Soft-delete a customer account (set is_active=false, clear PII)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { customerId } = parsed.data

  const admin = createAdminClient()
  const { data: org } = await admin.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  // Soft-delete: deactivate + clear push subscription + clear personal data
  const { error } = await admin.from('customers')
    .update({
      push_subscription: null,
      push_opted_in: false,
      full_name: null,
      email: null,
      notes: null,
      tags: [],
    })
    .eq('id', customerId)
    .eq('org_id', org.id)

  if (error) return NextResponse.json({ error: 'Operation failed' }, { status: 500 })

  // Delete active session
  await admin.from('active_sessions').delete().eq('customer_id', customerId)

  return NextResponse.json({ ok: true })
}

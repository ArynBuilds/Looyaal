import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
  orgId: z.string().uuid(),
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customerId, orgId, subscription } = schema.parse(body)

    const admin = createAdminClient()

    // Verify customer exists, belongs to the org, and has recent activity
    const { data: customer } = await admin.from('customers')
      .select('id, org_id')
      .eq('id', customerId)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    if (customer.org_id !== orgId) {
      return NextResponse.json({ error: 'Customer does not belong to this organization' }, { status: 403 })
    }


    await admin
      .from('customers')
      .update({
        push_subscription: subscription,
        push_opted_in: true,
      })
      .eq('id', customerId)
      .eq('org_id', orgId)

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

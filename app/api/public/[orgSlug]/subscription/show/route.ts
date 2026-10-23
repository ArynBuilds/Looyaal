import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
})

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

  // Check active subscription
  const { data: sub } = await admin
    .from('customer_subscriptions')
    .select('id, plan_id, status')
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .eq('status', 'active')
    .single()

  if (!sub) return NextResponse.json({ error: 'No active subscription' }, { status: 404 })

  // Check not redeemed today
  const today = new Date().toISOString().split('T')[0]
  const { count } = await admin
    .from('subscription_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_id', sub.id)
    .eq('redeemed_date', today)

  if (count && count > 0) return NextResponse.json({ error: 'Already redeemed today' }, { status: 400 })

  return NextResponse.json({ subscriptionId: sub.id, canRedeem: true })
}

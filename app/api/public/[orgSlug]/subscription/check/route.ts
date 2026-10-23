import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) {
    return NextResponse.json({ error: 'customerId required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // Get active subscription
  const { data: subscription } = await supabase
    .from('customer_subscriptions')
    .select('*, subscription_plans(daily_limit, name, price_try)')
    .eq('org_id', org.id)
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .single()

  if (!subscription) {
    return NextResponse.json({ hasSubscription: false })
  }

  const plan = subscription.subscription_plans as { daily_limit: number; name: string; price_try: number }
  const today = new Date().toISOString().split('T')[0]

  const { count } = await supabase
    .from('subscription_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('subscription_id', subscription.id)
    .eq('redeemed_date', today)

  const used = count ?? 0

  return NextResponse.json({
    hasSubscription: true,
    planName: plan.name,
    canRedeem: used < plan.daily_limit,
    used,
    dailyLimit: plan.daily_limit,
  })
}

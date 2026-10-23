import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
  locationId: z.string().uuid(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  try {
    const { orgSlug } = await params
    const body = await request.json()
    const { customerId, locationId } = schema.parse(body)

    const supabase = createAdminClient()

    // Verify org
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
      .select('*, subscription_plans(daily_limit, name)')
      .eq('org_id', org.id)
      .eq('customer_id', customerId)
      .eq('status', 'active')
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Aktif abonelik bulunamadı' }, { status: 404 })
    }

    const plan = subscription.subscription_plans as { daily_limit: number; name: string }
    const today = new Date().toISOString().split('T')[0]

    // Check today's redemptions
    const { count: todayRedemptions } = await supabase
      .from('subscription_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_id', subscription.id)
      .eq('redeemed_date', today)

    const used = todayRedemptions ?? 0

    if (used >= plan.daily_limit) {
      return NextResponse.json({
        error: `Bugünkü limitiniz doldu (${plan.daily_limit}/${plan.daily_limit})`,
        remaining: 0,
      }, { status: 400 })
    }

    // Record redemption (catch unique constraint violation from concurrent requests)
    const { error: redeemError } = await supabase
      .from('subscription_redemptions')
      .insert({
        org_id: org.id,
        subscription_id: subscription.id,
        customer_id: customerId,
        location_id: locationId,
        redeemed_date: today,
        redemption_number: used + 1,
      })

    if (redeemError) {
      // UNIQUE(subscription_id, redeemed_date, redemption_number) constraint fires
      // when two concurrent requests race past the count check
      const msg = redeemError.message?.toLowerCase() ?? ''
      if (msg.includes('unique') || msg.includes('duplicate')) {
        return NextResponse.json({
          error: 'Bugünlük hakkınızı zaten kullandınız',
          remaining: 0,
        }, { status: 409 })
      }
      return NextResponse.json({ error: redeemError.message }, { status: 500 })
    }

    // Also record as a visit
    const now = new Date()
    await supabase.from('visits').insert({
      org_id: org.id,
      location_id: locationId,
      customer_id: customerId,
      visit_type: 'subscription_redeem',
      visited_at: now.toISOString(),
      day_of_week: now.getDay(),
      hour_of_day: now.getHours(),
    })

    return NextResponse.json({
      success: true,
      planName: plan.name,
      remaining: plan.daily_limit - used - 1,
      used: used + 1,
      dailyLimit: plan.daily_limit,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

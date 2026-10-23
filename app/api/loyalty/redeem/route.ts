import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import crypto from 'crypto'

// Generate redemption code — called by customer when they want to claim reward
const generateSchema = z.object({
  customerId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const admin = createAdminClient()
    const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
    if (!userData?.org_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const orgId = userData.org_id

    const body = await request.json()
    const { customerId } = generateSchema.parse(body)

    // Check if customer has a completed card
    const { data: card } = await admin
      .from('loyalty_cards')
      .select('*, loyalty_programs(stamps_required)')
      .eq('org_id', orgId)
      .eq('customer_id', customerId)
      .single()

    if (!card || card.cards_completed < 1) {
      return NextResponse.json({ error: 'Tamamlanmış kart bulunamadı' }, { status: 400 })
    }

    // Check if there's already an unredeemed reward for this customer
    const { data: pendingRedemption } = await admin
      .from('redemptions')
      .select('id')
      .eq('customer_id', customerId)
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .single()

    if (pendingRedemption) {
      return NextResponse.json({ error: 'Zaten bekleyen bir ödülünüz var' }, { status: 400 })
    }

    // Get available reward
    const { data: reward } = await admin
      .from('rewards')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .limit(1)
      .single()

    if (!reward) {
      return NextResponse.json({ error: 'Aktif ödül bulunamadı' }, { status: 400 })
    }

    // Generate 6-char redemption code
    const code = crypto.randomBytes(3).toString('hex').toUpperCase()

    // Create pending redemption
    const { data: redemption, error } = await admin
      .from('redemptions')
      .insert({
        org_id: orgId,
        customer_id: customerId,
        reward_id: reward.id,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      code,
      redemptionId: redemption.id,
      rewardName: reward.name,
      rewardType: reward.type,
      rewardValue: reward.value,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Verify + complete redemption — called by barista
const verifySchema = z.object({
  redemptionId: z.string().uuid(),
})

export async function PUT(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const admin = createAdminClient()
    const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
    if (!userData?.org_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { redemptionId } = verifySchema.parse(body)

    const { data: redemption, error } = await admin
      .from('redemptions')
      .update({
        status: 'redeemed',
        redeemed_at: new Date().toISOString(),
        verified_by: user.id,
      })
      .eq('id', redemptionId)
      .eq('org_id', userData.org_id)
      .eq('status', 'pending')
      .select('*, rewards(name)')
      .single()

    if (error || !redemption) {
      return NextResponse.json({ error: 'Ödül bulunamadı veya zaten kullanılmış' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      rewardName: (redemption.rewards as { name: string })?.name,
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const { customerId } = await request.json()
  if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 })

  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })


  // Check card is full
  const { data: card } = await admin
    .from('loyalty_cards')
    .select('id, current_stamps, program_id')
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .single()

  if (!card) return NextResponse.json({ error: 'No loyalty card' }, { status: 404 })

  const { data: program } = await admin.from('loyalty_programs').select('stamps_required').eq('id', card.program_id).single()
  if (!program || card.current_stamps < program.stamps_required) {
    return NextResponse.json({ error: 'Card not full' }, { status: 400 })
  }

  // Get reward
  const { data: reward } = await admin.from('rewards').select('id, name').eq('org_id', org.id).eq('is_active', true).limit(1).single()
  if (!reward) return NextResponse.json({ error: 'No reward configured' }, { status: 404 })

  // Atomic insert-if-no-pending: avoids TOCTOU race where two concurrent
  // requests both pass a SELECT count check and both INSERT
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()
  const { data: redemption, error } = await admin.from('redemptions').insert({
    org_id: org.id,
    customer_id: customerId,
    reward_id: reward.id,
    status: 'pending',
    claim_method: 'manual',
    claimed_at: new Date().toISOString(),
    expires_at: expiresAt,
  }).select('id').single()

  if (error) {
    // Unique constraint violation = concurrent duplicate claim
    const msg = error.message?.toLowerCase() ?? ''
    if (msg.includes('unique') || msg.includes('duplicate')) {
      return NextResponse.json({ error: 'Zaten bekleyen bir ödül talebiniz var' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Post-insert guard: if no unique constraint exists, check if we accidentally
  // created a duplicate and clean it up
  const { count: pendingCount } = await admin.from('redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .eq('status', 'pending')

  if (pendingCount && pendingCount > 1) {
    // Another request snuck in — delete ours and return error
    await admin.from('redemptions').delete().eq('id', redemption.id)
    return NextResponse.json({ error: 'Zaten bekleyen bir ödül talebiniz var' }, { status: 409 })
  }

  return NextResponse.json({ redemptionId: redemption.id, rewardName: reward.name, expiresAt })
}

// lib/pos-matching.ts
import { createAdminClient } from '@/lib/supabase/admin'

export interface POSTransaction {
  locationId: string
  amount: number
  hasDiscount: boolean
  items?: { name: string; qty: number; price: number }[]
  posTransactionId: string
}

export async function matchTransactionToCustomer(orgId: string, tx: POSTransaction) {
  const admin = createAdminClient()
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

  const { data: sessions } = await admin
    .from('active_sessions')
    .select('customer_id')
    .eq('location_id', tx.locationId)
    .gte('last_active_at', fiveMinAgo)
    .order('last_active_at', { ascending: false })

  if (!sessions || sessions.length === 0) {
    return { matched: false as const, reason: 'no_active_session' as const }
  }

  if (sessions.length === 1) {
    return { matched: true as const, customerId: sessions[0].customer_id, ambiguous: false }
  }

  return { matched: true as const, customerId: sessions[0].customer_id, ambiguous: true }
}

export async function autoRedeemPending(orgId: string, customerId: string) {
  const admin = createAdminClient()
  const now = new Date().toISOString()

  // Check pending reward
  const { data: pending } = await admin
    .from('redemptions')
    .select('id')
    .eq('customer_id', customerId)
    .eq('status', 'pending')
    .gte('expires_at', now)
    .limit(1)
    .maybeSingle()

  if (pending) {
    await admin.from('redemptions').update({
      status: 'redeemed',
      confirmed_at: now,
      redeemed_at: now,
      claim_method: 'pos_auto',
    }).eq('id', pending.id)

    // Reset loyalty card
    const { data: card } = await admin
      .from('loyalty_cards')
      .select('id, cards_completed')
      .eq('customer_id', customerId)
      .eq('org_id', orgId)
      .single()

    if (card) {
      await admin.from('loyalty_cards').update({
        current_stamps: 0,
        cards_completed: (card.cards_completed || 0) + 1,
      }).eq('id', card.id)
    }

    return { redeemed: 'reward' as const, id: pending.id }
  }

  return null
}

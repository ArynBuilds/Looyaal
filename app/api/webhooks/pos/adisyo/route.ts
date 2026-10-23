import { createAdminClient } from '@/lib/supabase/admin'
import { matchTransactionToCustomer, autoRedeemPending } from '@/lib/pos-matching'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { timingSafeEqual } from 'crypto'

const webhookPayloadSchema = z.object({
  order_id: z.string().min(1, 'transaction_id is required'),
  location_api_key: z.string().min(1, 'location_api_key is required'),
  total_amount: z.number().positive('total_amount must be positive'),
  items: z.array(z.any()).optional(),
  payment_method: z.string().optional(),
  receipt_number: z.string().optional(),
  timestamp: z.string().optional(),
})

// Adisyo POS webhook receiver
// Receives order completion events from Adisyo POS system
// Matches to recent QR scan (within 5-minute window, same location)
export async function POST(request: Request) {
  try {
    // Verify webhook shared secret
    const webhookSecret = process.env.POS_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('POS_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }

    const signature = request.headers.get('x-webhook-secret')
    const signatureBuffer = Buffer.from(signature || '', 'utf8')
    const secretBuffer = Buffer.from(webhookSecret, 'utf8')
    if (signatureBuffer.length !== secretBuffer.length || !timingSafeEqual(signatureBuffer, secretBuffer)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Validate webhook payload
    const parsed = webhookPayloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const {
      order_id,
      location_api_key,
      total_amount,
      items,
      payment_method,
      timestamp,
    } = parsed.data

    // Find location by POS API key
    const { data: location } = await supabase
      .from('locations')
      .select('id, org_id')
      .eq('pos_api_key', location_api_key)
      .eq('pos_type', 'adisyo')
      .single()

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    // Find recent QR scan at this location (within 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: recentVisit } = await supabase
      .from('visits')
      .select('id, customer_id')
      .eq('location_id', location.id)
      .eq('visit_type', 'qr_scan')
      .is('pos_transaction_id', null)
      .gte('visited_at', fiveMinAgo)
      .order('visited_at', { ascending: false })
      .limit(1)
      .single()

    if (recentVisit) {
      // Match POS transaction to QR scan visit
      await supabase.from('visits').update({
        pos_transaction_id: order_id,
        amount: total_amount,
        items,
        payment_method,
        visit_type: 'pos_sync',
      }).eq('id', recentVisit.id)

      // Update customer total_spent
      await supabase.rpc('increment_customer_spent', {
        p_customer_id: recentVisit.customer_id,
        p_amount: total_amount,
      }).maybeSingle()
    } else {
      // No matching QR scan — silently skip (customer_id is NOT NULL)
    }

    // Auto-redeem pending rewards/subscriptions
    if (recentVisit) {
      await autoRedeemPending(location.org_id, recentVisit.customer_id)
    } else {
      // Try session-based matching
      const match = await matchTransactionToCustomer(location.org_id, {
        locationId: location.id,
        amount: total_amount,
        hasDiscount: false,
        posTransactionId: order_id,
      })
      if (match.matched) {
        await autoRedeemPending(location.org_id, match.customerId)
      }
    }

    return NextResponse.json({ success: true, matched: !!recentVisit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

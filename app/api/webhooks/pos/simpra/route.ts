import { createAdminClient } from '@/lib/supabase/admin'
import { matchTransactionToCustomer, autoRedeemPending } from '@/lib/pos-matching'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { timingSafeEqual } from 'crypto'

const webhookPayloadSchema = z.object({
  orderId: z.string().min(1, 'transaction_id is required'),
  apiKey: z.string().min(1, 'location_api_key is required'),
  totalAmount: z.number().positive('total_amount must be positive'),
  orderItems: z.array(z.any()).optional(),
  paymentType: z.string().optional(),
  receiptNumber: z.string().optional(),
  orderDate: z.string().optional(),
})

// Simpra POS webhook receiver
// Same matching logic as Adisyo — matches POS transactions to QR scans
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
      orderId,
      apiKey,
      totalAmount,
      orderItems,
      paymentType,
      orderDate,
    } = parsed.data

    // Find location by POS API key
    const { data: location } = await supabase
      .from('locations')
      .select('id, org_id')
      .eq('pos_api_key', apiKey)
      .eq('pos_type', 'simpra')
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
      // Convert Simpra items format to our format
      const items = orderItems?.map((item: { name: string; quantity: number; price: number }) => ({
        name: item.name,
        qty: item.quantity,
        price: item.price,
      }))

      await supabase.from('visits').update({
        pos_transaction_id: orderId,
        amount: totalAmount,
        items,
        payment_method: paymentType,
        visit_type: 'pos_sync',
      }).eq('id', recentVisit.id)
    }

    // Auto-redeem pending rewards/subscriptions
    if (recentVisit) {
      await autoRedeemPending(location.org_id, recentVisit.customer_id)
    } else {
      const match = await matchTransactionToCustomer(location.org_id, {
        locationId: location.id,
        amount: totalAmount,
        hasDiscount: false,
        posTransactionId: orderId,
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

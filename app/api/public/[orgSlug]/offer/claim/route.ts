import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createHmac, randomBytes } from 'crypto'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const QR_SECRET = process.env.QR_TOKEN_SECRET
  if (!QR_SECRET) return NextResponse.json({ error: 'Server error' }, { status: 500 })

  const { orgSlug } = await params
  const { customerId, offerId } = await request.json()

  if (!customerId || !offerId) {
    return NextResponse.json({ error: 'customerId and offerId required' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })


  // Atomic claim: only succeeds if status is still 'active'
  const { data: claimed } = await admin
    .from('customer_offers')
    .update({ status: 'claimed', claimed_at: new Date().toISOString() })
    .eq('id', offerId)
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .select('id, type, offer_type')

  if (!claimed || claimed.length === 0) {
    return NextResponse.json({ error: 'Teklif kullanılamadı' }, { status: 409 })
  }

  // Generate QR token
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()
  const token = randomBytes(16).toString('hex')
  const hmac = createHmac('sha256', QR_SECRET).update(`${customerId}:offer:${expiresAt}:${Date.now()}`).digest('hex').slice(0, 32)

  await admin.from('qr_tokens').insert({
    token,
    hmac,
    org_id: org.id,
    customer_id: customerId,
    type: 'offer',
    payload: { offerId },
    expires_at: expiresAt,
  })

  const qrPayload = Buffer.from(JSON.stringify({ t: token })).toString('base64')

  return NextResponse.json({ token, qrPayload, expiresAt })
}

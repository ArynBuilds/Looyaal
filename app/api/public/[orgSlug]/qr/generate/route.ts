import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const QR_SECRET = process.env.QR_TOKEN_SECRET
  if (!QR_SECRET) {
    console.error('QR_TOKEN_SECRET environment variable is required')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  const { orgSlug } = await params
  const { customerId, type, campaignId, redemptionId, subscriptionId } = await request.json()

  if (!customerId || !type) {
    return NextResponse.json({ error: 'customerId and type required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: org } = await admin.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  // Auth check: verify customer belongs to this org
  const { data: customer } = await admin.from('customers')
    .select('id')
    .eq('id', customerId)
    .eq('org_id', org.id)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Block re-mint for an already-redeemed campaign. The DB unique constraint
  // would catch it at barista/confirm time anyway, but failing here avoids
  // generating a QR that's guaranteed to fail at the counter.
  if (type === 'campaign' && campaignId) {
    const { count } = await admin
      .from('campaign_redemptions')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('customer_id', customerId)
    if (count && count > 0) {
      return NextResponse.json({ error: 'Bu kampanya zaten kullanıldı' }, { status: 409 })
    }
  }

  const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString()

  // Generate HMAC token
  const hmac = createHmac('sha256', QR_SECRET)
  hmac.update(`${customerId}:${type}:${expiresAt}:${Date.now()}`)
  const token = hmac.digest('hex').slice(0, 32)

  // Store token
  const { error } = await admin.from('qr_tokens').insert({
    org_id: org.id,
    customer_id: customerId,
    type,
    payload: { campaignId, redemptionId, subscriptionId },
    token,
    expires_at: expiresAt,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // QR payload (base64-encoded for scanning). orgSlug intentionally omitted —
  // the barista is already on /barista/<orgSlug> and the qr_tokens row carries
  // org_id, so the slug was dead weight that grew the module count.
  const qrPayload = Buffer.from(JSON.stringify({ t: token })).toString('base64')

  return NextResponse.json({ token, expiresAt, qrPayload })
}

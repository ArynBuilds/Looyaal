import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token } = await request.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const admin = createAdminClient()

  // Lookup token
  const { data: qr } = await admin
    .from('qr_tokens')
    .select('id, org_id, customer_id, type, payload, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!qr) return NextResponse.json({ error: 'Gecersiz QR kod' }, { status: 404 })
  if (qr.used_at) return NextResponse.json({ error: 'Bu QR kod zaten kullanildi' }, { status: 400 })
  if (new Date(qr.expires_at) < new Date()) return NextResponse.json({ error: 'QR kod suresi doldu' }, { status: 400 })

  // Verify barista belongs to same org and is active.
  const { data: userData } = await admin
    .from('users')
    .select('org_id, is_active')
    .eq('id', user.id)
    .single()
  if (!userData || userData.org_id !== qr.org_id || !userData.is_active) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }

  // Get customer info
  const { data: customer } = await admin
    .from('customers')
    .select('id, full_name, phone, total_visits')
    .eq('id', qr.customer_id)
    .single()

  // Get loyalty card
  const { data: card } = await admin
    .from('loyalty_cards')
    .select('current_stamps, program_id')
    .eq('customer_id', qr.customer_id)
    .eq('org_id', qr.org_id)
    .single()

  let stampsRequired = 10
  if (card?.program_id) {
    const { data: program } = await admin.from('loyalty_programs').select('stamps_required').eq('id', card.program_id).single()
    if (program) stampsRequired = program.stamps_required
  }

  // ── OFFER: fetch offer details for barista display ──
  if (qr.type === 'offer') {
    const payload = qr.payload as { offerId?: string }
    let offerDetails = null
    if (payload.offerId) {
      const { data: offer } = await admin
        .from('customer_offers')
        .select('id, type, title, description, offer_type, offer_value, free_item_name, expires_at')
        .eq('id', payload.offerId)
        .single()
      offerDetails = offer
    }
    return NextResponse.json({
      tokenId: qr.id, type: qr.type, payload: qr.payload,
      customer: {
        id: customer?.id,
        name: customer?.full_name || customer?.phone,
        visits: customer?.total_visits || 0,
      },
      stamps: card?.current_stamps ?? 0,
      stampsRequired,
      offerDetails,
    })
  }

  // ── CAMPAIGN: fetch campaign details for barista display ──
  if (qr.type === 'campaign') {
    const payload = qr.payload as { campaignId?: string }
    let campaignDetails = null
    if (payload.campaignId) {
      const { data: campaign } = await admin
        .from('campaigns')
        .select('id, name, offer_type, offer_value')
        .eq('id', payload.campaignId)
        .single()
      campaignDetails = campaign
    }
    return NextResponse.json({
      tokenId: qr.id, type: qr.type, payload: qr.payload,
      customer: {
        id: customer?.id,
        name: customer?.full_name || customer?.phone,
        visits: customer?.total_visits || 0,
      },
      stamps: card?.current_stamps ?? 0,
      stampsRequired,
      campaignDetails,
    })
  }

  return NextResponse.json({
    tokenId: qr.id,
    type: qr.type,
    payload: qr.payload,
    customer: {
      id: customer?.id,
      name: customer?.full_name || customer?.phone,
      visits: customer?.total_visits || 0,
    },
    stamps: card?.current_stamps || 0,
    stampsRequired,
  })
}

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { processVisit } from '@/lib/visit-processing'
import { sendPushNotification } from '@/lib/push'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token, drinkName, menuItemId } = await request.json()
  if (!token) return NextResponse.json({ error: 'Token required' }, { status: 400 })

  const admin = createAdminClient()

  // Lookup and validate token
  const { data: qr } = await admin
    .from('qr_tokens')
    .select('id, org_id, customer_id, type, payload, expires_at, used_at')
    .eq('token', token)
    .single()

  if (!qr) return NextResponse.json({ error: 'Geçersiz' }, { status: 404 })
  if (qr.used_at) return NextResponse.json({ error: 'Zaten kullanıldı' }, { status: 400 })
  if (new Date(qr.expires_at) < new Date()) return NextResponse.json({ error: 'Süresi doldu' }, { status: 400 })

  // Atomic CAS: only flip used_at if it is still NULL. If two confirms race
  // (two baristas, two tabs), exactly one wins and the loser gets a clean 400.
  const { data: claimed } = await admin
    .from('qr_tokens')
    .update({ used_at: new Date().toISOString(), used_by: user.id })
    .eq('id', qr.id)
    .is('used_at', null)
    .select('id')
  if (!claimed || claimed.length === 0) {
    return NextResponse.json({ error: 'Zaten kullanıldı' }, { status: 400 })
  }

  // Get barista's location + verify active.
  const { data: userData } = await admin
    .from('users')
    .select('org_id, assigned_locations, is_active')
    .eq('id', user.id)
    .single()
  if (!userData || !userData.is_active || userData.org_id !== qr.org_id) {
    return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
  }
  const locationId = userData.assigned_locations?.[0]
  if (!locationId) {
    return NextResponse.json({ error: 'Bu baristaya sube atanmamis' }, { status: 400 })
  }

  // ── STAMP ──
  if (qr.type === 'stamp') {
    const result = await processVisit(admin, {
      orgId: qr.org_id,
      locationId,
      customerId: qr.customer_id,
      visitType: 'manual',
      drinkName: drinkName || undefined,
      menuItemId: menuItemId || undefined,
      awardStamp: true,
      checkRateLimit: true,
    })

    if (result.rateLimited) {
      return NextResponse.json({ error: 'Bu müşteri az önce puan aldı — birkaç saniye sonra tekrar deneyin' }, { status: 429 })
    }

    // Review nudge (best-effort, after 3+ visits)
    try {
      const { data: customer } = await admin
        .from('customers')
        .select('full_name, total_visits, review_nudge_sent_at, push_subscription')
        .eq('id', qr.customer_id)
        .single()

      const { data: location } = await admin
        .from('locations')
        .select('name, google_place_id')
        .eq('id', locationId)
        .single()

      if (customer && location?.google_place_id && customer.push_subscription && (customer.total_visits || 0) >= 3) {
        const lastNudge = customer.review_nudge_sent_at ? new Date(customer.review_nudge_sent_at) : null
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        if (!lastNudge || lastNudge < thirtyDaysAgo) {
          const firstName = customer.full_name?.split(' ')[0] || ''
          const locName = location.name || ''
          await sendPushNotification(customer.push_subscription, {
            title: 'Deneyimini Google\'da paylaşır mısın?',
            body: firstName
              ? `${firstName}, kahven hakkında yazacağın birkaç kelime ${locName} için çok değerli.`
              : `Kahven hakkında yazacağın birkaç kelime ${locName} için çok değerli.`,
            url: `https://search.google.com/local/writereview?placeid=${location.google_place_id}`,
          })
          await admin.from('customers').update({ review_nudge_sent_at: new Date().toISOString() }).eq('id', qr.customer_id)
        }
      }
    } catch { /* silent — nudge is best-effort */ }

    return NextResponse.json({ ok: true, type: 'stamp', ...result })
  }

  // ── REWARD ──
  if (qr.type === 'reward') {
    const payload = qr.payload as { redemptionId?: string }
    if (payload.redemptionId) {
      await admin.from('redemptions').update({
        status: 'redeemed',
        confirmed_at: new Date().toISOString(),
        redeemed_at: new Date().toISOString(),
        verified_by: user.id,
        claim_method: 'barista_qr',
      }).eq('id', payload.redemptionId)
    }

    // Subtract stamps_required from the card (overflow carries to new card)
    // and increment cards_completed. Then processVisit awards the stamp for
    // this visit on top of the (possibly non-zero) remainder.
    const { data: cardBefore } = await admin
      .from('loyalty_cards')
      .select('id, current_stamps, cards_completed, program_id')
      .eq('customer_id', qr.customer_id)
      .eq('org_id', qr.org_id)
      .maybeSingle()

    if (cardBefore) {
      const { data: program } = await admin
        .from('loyalty_programs')
        .select('stamps_required')
        .eq('id', cardBefore.program_id)
        .single()
      const stampsRequired = program?.stamps_required || 10
      await admin.from('loyalty_cards').update({
        current_stamps: Math.max(0, cardBefore.current_stamps - stampsRequired),
        cards_completed: (cardBefore.cards_completed || 0) + 1,
      }).eq('id', cardBefore.id)
    }

    const result = await processVisit(admin, {
      orgId: qr.org_id,
      locationId,
      customerId: qr.customer_id,
      visitType: 'reward_redeem',
      drinkName: drinkName || undefined,
      awardStamp: true,
      checkRateLimit: false,
    })

    return NextResponse.json({ ok: true, type: 'reward', ...result, cardCompleted: true })
  }

  // ── CAMPAIGN ──
  if (qr.type === 'campaign') {
    const payload = qr.payload as { campaignId?: string }
    if (payload.campaignId) {
      // Single-use per (campaign, customer). The UNIQUE constraint on
      // campaign_redemptions(campaign_id, customer_id) is the source of truth;
      // a 23505 (unique_violation) means the customer already redeemed.
      const { error: insErr } = await admin.from('campaign_redemptions').insert({
        org_id: qr.org_id,
        campaign_id: payload.campaignId,
        customer_id: qr.customer_id,
        location_id: locationId,
        redeemed_at: new Date().toISOString(),
      })
      if (insErr) {
        if (insErr.code === '23505') {
          return NextResponse.json({ error: 'Bu müşteri bu kampanyayı zaten kullanmış' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Kampanya kaydedilemedi' }, { status: 500 })
      }
    }

    const result = await processVisit(admin, {
      orgId: qr.org_id,
      locationId,
      customerId: qr.customer_id,
      visitType: 'campaign_redeem',
      drinkName: drinkName || undefined,
      awardStamp: true,
      checkRateLimit: false,
    })

    return NextResponse.json({ ok: true, type: 'campaign', ...result })
  }

  // ── SUBSCRIPTION ──
  if (qr.type === 'subscription') {
    const payload = qr.payload as { subscriptionId?: string }
    if (payload.subscriptionId) {
      const today = new Date().toISOString().split('T')[0]
      await admin.from('subscription_redemptions').insert({
        org_id: qr.org_id,
        subscription_id: payload.subscriptionId,
        customer_id: qr.customer_id,
        location_id: locationId,
        redeemed_date: today,
        redemption_number: 1,
        verified_by: user.id,
      })
    }

    const result = await processVisit(admin, {
      orgId: qr.org_id,
      locationId,
      customerId: qr.customer_id,
      visitType: 'subscription_redeem',
      drinkName: drinkName || undefined,
      awardStamp: false,
      checkRateLimit: false,
    })

    return NextResponse.json({ ok: true, type: 'subscription', ...result })
  }

  // ── OFFER ──
  if (qr.type === 'offer') {
    const payload = qr.payload as { offerId?: string }

    const { data: offer } = await admin
      .from('customer_offers')
      .select('id, type, offer_type, offer_value, free_item_name, applies_to_item, title, expires_at')
      .eq('id', payload.offerId)
      .single()

    if (!offer) return NextResponse.json({ error: 'Teklif bulunamadı' }, { status: 404 })

    // Grace period: allow 30 min past expiry for barista confirm
    const graceExpiry = new Date(new Date(offer.expires_at).getTime() + 30 * 60 * 1000)
    if (graceExpiry < new Date()) {
      return NextResponse.json({ error: 'Teklifin süresi doldu' }, { status: 400 })
    }

    // processVisit FIRST (checks customer_offers for goal_gradient double stamp)
    const result = await processVisit(admin, {
      orgId: qr.org_id,
      locationId,
      customerId: qr.customer_id,
      visitType: offer.type === 'goal_gradient' ? 'manual' : 'campaign_redeem',
      drinkName: drinkName || undefined,
      awardStamp: true,
      checkRateLimit: false,
    })

    // THEN mark offer redeemed
    await admin.from('customer_offers').update({
      status: 'redeemed',
      redeemed_at: new Date().toISOString(),
      redeemed_by: user.id,
    }).eq('id', offer.id)

    return NextResponse.json({
      ok: true, type: 'offer', ...result,
      offerDetails: {
        title: offer.title,
        offer_type: offer.offer_type,
        offer_value: offer.offer_value,
        free_item_name: offer.free_item_name,
        applies_to_item: (offer as { applies_to_item: string | null }).applies_to_item,
      },
    })
  }

  return NextResponse.json({ ok: true, type: qr.type })
}

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendPushNotification } from '@/lib/push'
import { filterTargets, type TargetBucket } from '@/lib/targeting'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  campaignId: z.string().uuid(),
})

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    // Dual auth: cron bearer token OR authenticated user session.
    // Cron path is used by the campaign-scheduler to send scheduled campaigns.
    const cronHeader = request.headers.get('authorization')
    const isCron = cronHeader === `Bearer ${process.env.CRON_SECRET}`

    let userOrgId: string | null = null
    if (!isCron) {
      const supabaseAuth = await createClient()
      const { data: { user } } = await supabaseAuth.auth.getUser()
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const { data: userData } = await supabase.from('users').select('org_id, role').eq('id', user.id).single()
      if (!userData?.org_id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userOrgId = userData.org_id
    }

    const body = await request.json()
    const { campaignId } = schema.parse(body)

    // Get campaign — cron path looks up by id only; user path also enforces org scope
    let campaignQuery = supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
    if (!isCron && userOrgId) {
      campaignQuery = campaignQuery.eq('org_id', userOrgId)
    }
    const { data: campaign } = await campaignQuery.single()

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Get org slug for notification URL
    const { data: org } = await supabase
      .from('organizations')
      .select('slug')
      .eq('id', campaign.org_id)
      .single()
    const orgSlug = org?.slug || ''

    // Get target customers with push subscriptions + targeting data
    let query = supabase
      .from('customers')
      .select(`
        id, phone, full_name, push_subscription, push_opted_in,
        primary_location_id, last_visit_at, total_visits, churn_risk,
        loyalty_cards(current_stamps, loyalty_programs(stamps_required))
      `)
      .eq('org_id', campaign.org_id)
      .eq('push_opted_in', true)

    // Filter by segment
    if (campaign.target_segment && campaign.target_segment !== 'all') {
      query = query.eq('rfm_segment', campaign.target_segment)
    }

    // Filter by target locations (location-aware targeting)
    if (campaign.target_locations && campaign.target_locations.length > 0) {
      query = query.in('primary_location_id', campaign.target_locations)
    }

    const { data: rawCustomers } = await query

    if (!rawCustomers || rawCustomers.length === 0) {
      return NextResponse.json({ error: 'Hedef müşteri bulunamadı', sent: 0 })
    }

    // Get last campaign send dates for each customer
    const customerIds = rawCustomers.map((c) => c.id)
    const { data: lastSends } = await supabase
      .from('campaign_sends')
      .select('customer_id, sent_at')
      .in('customer_id', customerIds)
      .eq('status', 'sent')
      .order('sent_at', { ascending: false })

    const lastSendMap = new Map<string, string>()
    for (const s of lastSends ?? []) {
      if (!lastSendMap.has(s.customer_id)) {
        lastSendMap.set(s.customer_id, s.sent_at)
      }
    }

    // Prepare customer data for targeting engine
    const targetData = rawCustomers.map((c) => {
      const card = (c.loyalty_cards as unknown as Array<{
        current_stamps: number
        loyalty_programs: { stamps_required: number }
      }>)?.[0]

      // Estimate avg days between visits
      const firstVisitDays = c.last_visit_at
        ? Math.max(1, Math.floor((Date.now() - new Date(c.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)))
        : 999
      const avgGap = c.total_visits > 1 ? firstVisitDays / c.total_visits : null

      return {
        id: c.id,
        last_visit_at: c.last_visit_at,
        total_visits: c.total_visits,
        churn_risk: c.churn_risk,
        current_stamps: card?.current_stamps ?? 0,
        stamps_required: card?.loyalty_programs?.stamps_required ?? 10,
        avg_days_between_visits: avgGap,
        last_campaign_sent_at: lastSendMap.get(c.id) ?? null,
        primary_location_id: c.primary_location_id,
      }
    })

    // Manual campaigns (user clicked "Gönder") skip the Smart Targeting Engine.
    // The cafe owner explicitly chose these customers — respect their intent.
    // Smart Targeting is for AI-automated NBA decisions only.
    const targetsToSend = targetData.map((c) => ({
      customerId: c.id,
      bucket: 'default_send' as TargetBucket,
      action: 'send' as const,
      reason: 'Manuel kampanya — hedef segmentteki tüm müşteriler',
    }))
    const suppressed: typeof targetsToSend = []

    // Get location name for notification text
    let locationName = ''
    if (campaign.target_locations?.length === 1) {
      const { data: loc } = await supabase
        .from('locations')
        .select('name')
        .eq('id', campaign.target_locations[0])
        .single()
      locationName = loc?.name || ''
    }

    // Build customer map for push subscriptions
    const customerMap = new Map(rawCustomers.map((c) => [c.id, c]))

    let sent = 0
    let failed = 0
    const sendRecords: Array<{
      org_id: string
      campaign_id: string
      customer_id: string
      channel: string
      status: string
      sent_at: string | null
      failed_reason: string | null
    }> = []

    // Send to all targets
    for (const target of targetsToSend) {
      const customer = customerMap.get(target.customerId)
      if (!customer) continue

      const subscription = customer.push_subscription as unknown as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      } | null

      // No push subscription — record as sent (campaign targets them, just can't deliver push yet)
      if (!subscription || !subscription.endpoint) {
        sendRecords.push({
          org_id: campaign.org_id,
          campaign_id: campaign.id,
          customer_id: customer.id,
          channel: 'push',
          status: 'sent',
          sent_at: new Date().toISOString(),
          failed_reason: null,
        })
        sent++
        continue
      }

      let notificationBody = campaign.message_template || ''
      if (locationName) {
        notificationBody = notificationBody.replace('{location}', locationName)
      }

      const result = await sendPushNotification(subscription, {
        title: campaign.name,
        body: notificationBody,
        url: `/${orgSlug}`,
        tag: `campaign-${campaign.id}`,
      })

      sendRecords.push({
        org_id: campaign.org_id,
        campaign_id: campaign.id,
        customer_id: customer.id,
        channel: 'push',
        status: result.success ? 'sent' : 'failed',
        sent_at: result.success ? new Date().toISOString() : null,
        failed_reason: result.error || null,
      })

      if (result.success) sent++
      else {
        failed++
        if (result.error === 'subscription_expired') {
          await supabase
            .from('customers')
            .update({ push_subscription: null, push_opted_in: false })
            .eq('id', customer.id)
        }
      }
    }

    // Log suppressed customers (for analytics, not messaged)
    for (const target of suppressed) {
      sendRecords.push({
        org_id: campaign.org_id,
        campaign_id: campaign.id,
        customer_id: target.customerId,
        channel: 'push',
        status: 'suppressed',
        sent_at: null,
        failed_reason: target.reason,
      })
    }

    // Batch insert all records
    if (sendRecords.length > 0) {
      await supabase.from('campaign_sends').insert(sendRecords)
    }

    // Update campaign status
    await supabase.from('campaigns').update({
      status: 'active',
      started_at: new Date().toISOString(),
    }).eq('id', campaign.id)

    return NextResponse.json({
      sent,
      failed,
      suppressed: suppressed.length,
      total: rawCustomers.length,
      buckets: {
        sent: targetsToSend.map((t) => ({ id: t.customerId, bucket: t.bucket, reason: t.reason })),
        suppressed: suppressed.map((t) => ({ id: t.customerId, bucket: t.bucket, reason: t.reason })),
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

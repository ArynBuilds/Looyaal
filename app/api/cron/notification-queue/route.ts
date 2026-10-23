import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { sendPushNotification } from '@/lib/push'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const supabase = createAdminClient()
  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 3600000).toISOString()

  // Get queued notifications that are due
  const { data: queue } = await supabase
    .from('notification_queue')
    .select('*, customers(push_subscription, last_visit_at)')
    .eq('status', 'queued')
    .lte('scheduled_for', now.toISOString())
    .gte('scheduled_for', oneHourAgo) // Don't send stale ones
    .limit(100)

  if (!queue || queue.length === 0) {
    return NextResponse.json({ success: true, sent: 0 })
  }

  // Pre-fetch org settings for all orgs in the queue (avoids N+1)
  const orgIds = [...new Set(queue.map(n => n.org_id))]
  const { data: orgSettingsRows } = await supabase
    .from('organizations')
    .select('id, max_notifications_per_week, quiet_hours_start, quiet_hours_end')
    .in('id', orgIds)
  const orgSettingsMap = new Map(
    (orgSettingsRows || []).map(o => [o.id, {
      maxPerWeek: o.max_notifications_per_week || 4,
      quietStart: parseInt((o.quiet_hours_start || '09:00').split(':')[0]),
      quietEnd: parseInt((o.quiet_hours_end || '21:00').split(':')[0]),
    }])
  )

  let sent = 0
  let skipped = 0
  let failed = 0

  for (const notif of queue) {
    const customer = notif.customers as unknown as { push_subscription: unknown; last_visit_at: string | null }
    if (!customer?.push_subscription) {
      await supabase.from('notification_queue').update({ status: 'expired' }).eq('id', notif.id)
      skipped++
      continue
    }

    // Quiet hours enforcement — reschedule if outside allowed window
    const orgSettings = orgSettingsMap.get(notif.org_id) || { maxPerWeek: 4, quietStart: 9, quietEnd: 21 }
    const currentHour = now.getHours()
    if (currentHour < orgSettings.quietStart || currentHour >= orgSettings.quietEnd) {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(orgSettings.quietStart, 0, 0, 0)
      await supabase.from('notification_queue').update({ scheduled_for: tomorrow.toISOString() }).eq('id', notif.id)
      skipped++
      continue
    }

    // Same-day visit suppression
    if (customer.last_visit_at) {
      const lastVisit = new Date(customer.last_visit_at)
      if (lastVisit.toDateString() === now.toDateString()) {
        await supabase.from('notification_queue').update({ status: 'expired' }).eq('id', notif.id)
        skipped++
        continue
      }
    }

    // Per-customer daily cap: max 1 notification per day (hardcoded)
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const { count: todayCount } = await supabase
      .from('notification_queue')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', notif.customer_id)
      .eq('status', 'sent')
      .gte('sent_at', todayStart.toISOString())

    if ((todayCount || 0) >= 1) {
      await supabase.from('notification_queue').update({ status: 'expired' }).eq('id', notif.id)
      skipped++
      continue
    }

    // Frequency cap check (exclude dead_hour_weekly — separate budget).
    // CAP_EXEMPT_TYPES bypass the cap entirely because the cost of suppressing
    // them is higher than the marginal annoyance: birthday (yearly),
    // goal_gradient (2 stamps + overdue), near_reward_final (1 stamp from a
    // free coffee — the highest-converting push in the lifecycle). Past sends
    // of these types still count toward the budget of other actions.
    const CAP_EXEMPT_TYPES = new Set(['birthday', 'goal_gradient', 'near_reward_final'])
    if (!CAP_EXEMPT_TYPES.has(notif.notification_type)) {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()
      const { count } = await supabase
        .from('notification_queue')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', notif.customer_id)
        .eq('status', 'sent')
        .neq('notification_type', 'dead_hour_weekly')
        .gte('sent_at', sevenDaysAgo)

      if ((count || 0) >= orgSettings.maxPerWeek) {
        await supabase.from('notification_queue').update({ status: 'expired' }).eq('id', notif.id)
        skipped++
        continue
      }
    }

    // Send push — include notificationId + customerId for click tracking (TRACK step)
    const subscription = customer.push_subscription as { endpoint: string; keys: { p256dh: string; auth: string } }
    const result = await sendPushNotification(subscription, {
      title: notif.title,
      body: notif.body,
      url: notif.url || '/',
      notificationId: notif.id,
      customerId: notif.customer_id,
    } as { title: string; body: string; url?: string; notificationId?: string; customerId?: string })

    if (result.success) {
      await supabase.from('notification_queue').update({ status: 'sent', sent_at: now.toISOString() }).eq('id', notif.id)
      sent++
    } else {
      await supabase.from('notification_queue').update({ status: 'expired' }).eq('id', notif.id)
      if (result.error === 'subscription_expired') {
        await supabase.from('customers').update({ push_subscription: null, push_opted_in: false }).eq('id', notif.customer_id)
      }
      failed++
    }
  }

  // Expire old unsent notifications
  await supabase
    .from('notification_queue')
    .update({ status: 'expired' })
    .eq('status', 'queued')
    .lt('scheduled_for', new Date(now.getTime() - 2 * 3600000).toISOString())

  return NextResponse.json({ success: true, sent, skipped, failed })
}

export { POST as GET }

import { createAdminClient } from '@/lib/supabase/admin'
import { updateSendTimeScore } from '@/lib/intelligence'
import { NextResponse } from 'next/server'
import { z } from 'zod'

// Called by service worker when customer clicks a push notification
// This is the TRACK step in the pipeline: SEND → TRACK → LEARN

const schema = z.object({
  notificationId: z.string().uuid(),
  customerId: z.string().uuid(),
  clickedAt: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { notificationId, customerId, clickedAt } = schema.parse(body)

    const supabase = createAdminClient()

    // 1. TRACK: Record the click in notification_queue
    const { data: notif } = await supabase
      .from('notification_queue')
      .update({
        status: 'clicked',
        clicked_at: clickedAt,
      })
      .eq('id', notificationId)
      .eq('customer_id', customerId)
      .select('org_id, sent_at, discount_used')
      .single()

    if (!notif) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // 2. LEARN: Visit-based discount learning now runs in daily cron (4b. LEARN)
    // Click handler only records the click; visit attribution happens in daily-intelligence
    const clickTime = new Date(clickedAt)

    // 3. LEARN: Update send-time scoring (DEPRECATED — will be removed in Phase B)
    const sentAt = notif.sent_at ? new Date(notif.sent_at) : null
    if (sentAt) {
      await updateSendTimeScore(supabase, customerId, sentAt, clickTime)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { NextResponse } from 'next/server'

// Runs every 15 minutes — sends scheduled campaigns that are due
export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const admin = createAdminClient()
  const now = new Date().toISOString()

  // Find campaigns that are scheduled and due
  const { data: campaigns } = await admin
    .from('campaigns')
    .select('id, org_id, name')
    .eq('status', 'scheduled')
    .lte('scheduled_at', now)
    .limit(10)

  if (!campaigns || campaigns.length === 0) {
    return NextResponse.json({ processed: 0 })
  }

  let processed = 0

  for (const campaign of campaigns) {
    // Update status to active
    await admin.from('campaigns').update({
      status: 'active',
      started_at: now,
    }).eq('id', campaign.id)

    // Trigger the campaign send via internal API call
    try {
      const sendRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/campaigns/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({ campaignId: campaign.id }),
      })
      if (sendRes.ok) processed++
    } catch {
      // Mark as failed if send fails
      await admin.from('campaigns').update({ status: 'draft' }).eq('id', campaign.id)
    }
  }

  return NextResponse.json({ processed, total: campaigns.length })
}

export { POST as GET }

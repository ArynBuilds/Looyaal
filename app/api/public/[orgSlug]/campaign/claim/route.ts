import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
  campaignId: z.string().uuid(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { customerId, campaignId } = parsed.data

  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })


  // Validate campaign active
  const { data: campaign } = await admin
    .from('campaigns')
    .select('id, status, offer_valid_until')
    .eq('id', campaignId)
    .eq('org_id', org.id)
    .single()

  if (!campaign || campaign.status !== 'active') {
    return NextResponse.json({ error: 'Campaign not active' }, { status: 400 })
  }

  if (campaign.offer_valid_until && new Date(campaign.offer_valid_until) < new Date()) {
    return NextResponse.json({ error: 'Campaign expired' }, { status: 400 })
  }

  // Check not already redeemed
  const { count } = await admin
    .from('campaign_redemptions')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', campaignId)
    .eq('customer_id', customerId)

  if (count && count > 0) return NextResponse.json({ error: 'Already redeemed' }, { status: 400 })

  return NextResponse.json({ ok: true, campaignId })
}

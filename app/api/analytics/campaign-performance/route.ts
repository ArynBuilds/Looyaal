import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const maxResults = Math.min(parseInt(searchParams.get('limit') || '5'), 50)
  const locationId = searchParams.get('locationId')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    // 1. Fetch campaigns (optionally filtered by location)
    const campaignQuery = admin
      .from('campaigns')
      .select('id, name, type, status, created_at, target_locations')
      .eq('org_id', userData.org_id)
      .order('created_at', { ascending: false })
      .limit(10)
    const { data: allCampaigns } = await campaignQuery

    // Filter by location if specified (target_locations is UUID array, empty = all locations)
    const campaigns = locationId
      ? (allCampaigns || []).filter(c => !c.target_locations?.length || c.target_locations.includes(locationId))
      : allCampaigns

    if (!campaigns || campaigns.length === 0) return NextResponse.json([])

    const campaignIds = campaigns.map(c => c.id)

    // 2. Fetch all sends for these campaigns in one query
    const { data: allSends } = await admin
      .from('campaign_sends')
      .select('campaign_id, customer_id, status, sent_at')
      .in('campaign_id', campaignIds)

    // 3. Fetch visits for conversion check
    const sendCustomerIds = [...new Set((allSends || []).map(s => s.customer_id))]

    const conversions: Record<string, Set<string>> = {}

    if (sendCustomerIds.length > 0 && allSends && allSends.length > 0) {
      const oldestSend = allSends.reduce((min, s) => s.sent_at < min ? s.sent_at : min, allSends[0].sent_at)
      const { data: visits } = await admin
        .from('visits')
        .select('customer_id, visited_at')
        .eq('org_id', userData.org_id)
        .in('customer_id', sendCustomerIds)
        .gte('visited_at', oldestSend)

      // Match visits to campaigns (visit within 48h of send = conversion)
      const customerSendPairs = allSends.map(s => ({
        customer_id: s.customer_id,
        after: s.sent_at,
        before: new Date(new Date(s.sent_at).getTime() + 48 * 60 * 60 * 1000).toISOString(),
        campaign_id: s.campaign_id,
      }))

      for (const pair of customerSendPairs) {
        const visited = visits?.some(v =>
          v.customer_id === pair.customer_id &&
          v.visited_at >= pair.after &&
          v.visited_at <= pair.before
        )
        if (visited) {
          if (!conversions[pair.campaign_id]) conversions[pair.campaign_id] = new Set()
          conversions[pair.campaign_id].add(pair.customer_id)
        }
      }
    }

    // Build results
    const results = campaigns.map(c => {
      const sends = (allSends || []).filter(s => s.campaign_id === c.id)
      const uniqueCustomers = new Set(sends.map(s => s.customer_id))
      const delivered = sends.filter(s => s.status === 'delivered').length

      return {
        id: c.id,
        name: c.name,
        type: c.type,
        status: c.status,
        total_sent: uniqueCustomers.size,
        delivered,
        converted: conversions[c.id]?.size || 0,
      }
    })

    // Sort by conversion rate descending
    results.sort((a, b) => {
      const rateA = a.total_sent > 0 ? a.converted / a.total_sent : 0
      const rateB = b.total_sent > 0 ? b.converted / b.total_sent : 0
      return rateB - rateA
    })

    return NextResponse.json(results.slice(0, maxResults))
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

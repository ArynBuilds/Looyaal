import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
  const offset = parseInt(searchParams.get('offset') || '0')
  const locationId = searchParams.get('locationId')
  const since = searchParams.get('since')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  try {
    let visitsQuery = admin
      .from('visits')
      .select('id, visited_at, visit_type, amount, items, customer_id, customers(full_name, phone)')
      .eq('org_id', userData.org_id)
      .order('visited_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (locationId) visitsQuery = visitsQuery.eq('location_id', locationId)
    if (since) visitsQuery = visitsQuery.gte('visited_at', since)

    const { data: visits, error: visitsError } = await visitsQuery
    if (visitsError) return NextResponse.json({ error: visitsError.message }, { status: 500 })
    if (!visits || visits.length === 0) return NextResponse.json([])

    const customerIds = [...new Set(visits.map(v => v.customer_id))]
    const oldestVisit = visits[visits.length - 1].visited_at
    const lookbackDate = new Date(new Date(oldestVisit).getTime() - 48 * 60 * 60 * 1000).toISOString()

    const { data: sends } = await admin
      .from('campaign_sends')
      .select('customer_id, sent_at, campaign_id, campaigns(name, type)')
      .in('customer_id', customerIds)
      .in('status', ['sent', 'delivered'])
      .gte('sent_at', lookbackDate)
      .order('sent_at', { ascending: false })

    const result = visits.map(v => {
      const customer = v.customers as unknown as { full_name: string | null; phone: string } | null
      const visitTime = new Date(v.visited_at).getTime()
      const matchingSend = sends?.find(s =>
        s.customer_id === v.customer_id &&
        new Date(s.sent_at).getTime() >= visitTime - 48 * 60 * 60 * 1000 &&
        new Date(s.sent_at).getTime() <= visitTime
      )
      const campaign = matchingSend?.campaigns as unknown as { name: string; type: string } | null

      return {
        id: v.id,
        visited_at: v.visited_at,
        visit_type: v.visit_type,
        amount: v.amount,
        items: v.items,
        full_name: customer?.full_name || null,
        phone: customer?.phone || '',
        campaign_id: matchingSend?.campaign_id || null,
        campaign_name: campaign?.name || null,
        campaign_type: campaign?.type || null,
      }
    })

    // Mask phone for barista role
    if (userData.role === 'barista') {
      return NextResponse.json(result.map(a => ({
        ...a,
        phone: a.phone ?
          a.phone.slice(0, 4) + ' *** ** ' + a.phone.slice(-2) : null
      })))
    }

    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

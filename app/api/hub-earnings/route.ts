import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeEarningsBreakdown } from '@/lib/dashboard/earnings-attribution'

const querySchema = z.object({
  locationId: z.string().uuid().optional().nullable(),
  days: z.coerce.number().int().min(1).max(365).optional(),
})

export async function GET(request: Request) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const supabase = createAdminClient()
  const { data: userRow } = await supabase
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()
  if (!userRow?.org_id) return NextResponse.json({ error: 'no_org' }, { status: 400 })

  const url = new URL(request.url)
  const parsed = querySchema.safeParse({
    locationId: url.searchParams.get('locationId') || null,
    days: url.searchParams.get('days') || undefined,
  })
  if (!parsed.success) return NextResponse.json({ error: 'bad_input' }, { status: 400 })
  const { locationId } = parsed.data
  const days = parsed.data.days ?? 30

  // Rolling window: [now - days, now]. Avoids the "0 on Monday" problem an
  // ISO-week window creates, and matches the chart's day-range vocabulary.
  const periodEnd = new Date()
  const periodStart = new Date(periodEnd.getTime() - days * 86400000)

  // Earnings breakdown by source over the window
  const breakdown = await computeEarningsBreakdown(supabase, {
    orgId: userRow.org_id,
    locationId: locationId ?? null,
    periodStartIso: periodStart.toISOString(),
    periodEndIso: periodEnd.toISOString(),
  })

  // Total visits over the window
  let visitsQuery = supabase
    .from('visits')
    .select('id', { count: 'exact', head: true })
    .eq('org_id', userRow.org_id)
    .gte('visited_at', periodStart.toISOString())
    .lt('visited_at', periodEnd.toISOString())
  if (locationId) visitsQuery = visitsQuery.eq('location_id', locationId)
  const { count: totalVisits } = await visitsQuery

  return NextResponse.json({
    period_days: days,
    total_try: breakdown.total_try,
    total_visits: totalVisits ?? 0,
    avg_basket_try: breakdown.avg_basket_try,
    avg_basket_source: breakdown.avg_basket_source,
    segments: breakdown.segments,
  })
}

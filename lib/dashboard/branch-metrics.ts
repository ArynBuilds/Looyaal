import type { SupabaseClient } from '@supabase/supabase-js'

export interface BranchMetricRow {
  id: string
  name: string
  city: string | null
  district: string | null
  is_active: boolean
  todays_visits: number
  weekly_incremental_revenue_try: number
  active_customers: number
  last_scan_at: string | null
}

export async function fetchBranchMetrics(
  supabase: SupabaseClient,
  orgId: string,
): Promise<BranchMetricRow[]> {
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, city, district, is_active')
    .eq('org_id', orgId)
    .order('created_at')

  if (!locations || locations.length === 0) return []

  const todayIso = new Date()
  todayIso.setUTCHours(0, 0, 0, 0)
  const todayStartIso = todayIso.toISOString()

  const weekStart = startOfIsoWeekUtc(new Date())
  const weekEnd = new Date(weekStart)
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 7)

  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 86400000).toISOString()

  // Today's visits per location (single query, group in code)
  const { data: todayVisits } = await supabase
    .from('visits')
    .select('location_id')
    .eq('org_id', orgId)
    .gte('visited_at', todayStartIso)
  const todayMap = new Map<string, number>()
  for (const v of todayVisits ?? []) {
    todayMap.set(v.location_id as string, (todayMap.get(v.location_id as string) ?? 0) + 1)
  }

  // This-week visit counts per location (used to weight the org-level incremental)
  const { data: weekVisits } = await supabase
    .from('visits')
    .select('location_id, visited_at')
    .eq('org_id', orgId)
    .gte('visited_at', weekStart.toISOString())
    .lt('visited_at', weekEnd.toISOString())
  const weekMap = new Map<string, number>()
  let weekTotal = 0
  for (const v of weekVisits ?? []) {
    weekMap.set(v.location_id as string, (weekMap.get(v.location_id as string) ?? 0) + 1)
    weekTotal++
  }

  // Org-level incremental revenue this week (from shop_intelligence)
  const { data: intel } = await supabase
    .from('shop_intelligence')
    .select('incremental_revenue_this_week')
    .eq('org_id', orgId)
    .maybeSingle()
  const orgWeeklyIncremental = Number(intel?.incremental_revenue_this_week ?? 0)

  // Active customers per location (last visit in last 30d)
  const { data: activeCustomers } = await supabase
    .from('customers')
    .select('primary_location_id, last_visit_at')
    .eq('org_id', orgId)
    .gte('last_visit_at', thirtyDaysAgoIso)
  const activeMap = new Map<string, number>()
  for (const c of activeCustomers ?? []) {
    const lid = c.primary_location_id as string | null
    if (!lid) continue
    activeMap.set(lid, (activeMap.get(lid) ?? 0) + 1)
  }

  // Last scan per location
  const { data: lastScans } = await supabase
    .from('visits')
    .select('location_id, visited_at')
    .eq('org_id', orgId)
    .order('visited_at', { ascending: false })
    .limit(500)
  const lastScanMap = new Map<string, string>()
  for (const v of lastScans ?? []) {
    const lid = v.location_id as string
    if (!lastScanMap.has(lid)) lastScanMap.set(lid, v.visited_at as string)
  }

  return locations.map((loc) => {
    const lid = loc.id as string
    const weekCount = weekMap.get(lid) ?? 0
    const share = weekTotal > 0 ? weekCount / weekTotal : 0
    return {
      id: lid,
      name: loc.name as string,
      city: (loc.city as string | null) ?? null,
      district: (loc.district as string | null) ?? null,
      is_active: !!loc.is_active,
      todays_visits: todayMap.get(lid) ?? 0,
      weekly_incremental_revenue_try: Math.round(orgWeeklyIncremental * share * 100) / 100,
      active_customers: activeMap.get(lid) ?? 0,
      last_scan_at: lastScanMap.get(lid) ?? null,
    }
  })
}

function startOfIsoWeekUtc(d: Date): Date {
  const out = new Date(d)
  out.setUTCHours(0, 0, 0, 0)
  const dow = out.getUTCDay()
  const daysSinceMonday = (dow + 6) % 7
  out.setUTCDate(out.getUTCDate() - daysSinceMonday)
  return out
}

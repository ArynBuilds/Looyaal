import type { SupabaseClient } from '@supabase/supabase-js'

const HARD_DEFAULT_TRY = 50

interface AvgBasketInput {
  orgId: string
  locationId?: string | null
  sinceIso: string
}

export async function computeAvgBasket(
  supabase: SupabaseClient,
  { orgId, locationId, sinceIso }: AvgBasketInput,
): Promise<{ value: number; source: 'daily_stats' | 'customer_avg' | 'menu_avg' | 'default' }> {
  // 1. Preferred: daily_location_stats.avg_transaction
  {
    let q = supabase
      .from('daily_location_stats')
      .select('avg_transaction')
      .eq('org_id', orgId)
      .gte('stat_date', sinceIso.slice(0, 10))
      .not('avg_transaction', 'is', null)
    if (locationId) q = q.eq('location_id', locationId)
    const { data } = await q
    if (data && data.length > 0) {
      const nonZero = data.filter((d) => Number(d.avg_transaction) > 0)
      if (nonZero.length > 0) {
        const avg = nonZero.reduce((s, d) => s + Number(d.avg_transaction), 0) / nonZero.length
        return { value: round2(avg), source: 'daily_stats' }
      }
    }
  }

  // 2. customers.avg_spend (per-org average; not location-filtered because
  //    customers.primary_location_id is a single field, not a history)
  {
    const { data } = await supabase
      .from('customers')
      .select('avg_spend')
      .eq('org_id', orgId)
      .not('avg_spend', 'is', null)
    if (data && data.length > 0) {
      const nonZero = data.filter((c) => Number(c.avg_spend) > 0)
      if (nonZero.length > 0) {
        const avg = nonZero.reduce((s, c) => s + Number(c.avg_spend), 0) / nonZero.length
        return { value: round2(avg), source: 'customer_avg' }
      }
    }
  }

  // 3. menu_items.price average across active items
  {
    const { data } = await supabase
      .from('menu_items')
      .select('price')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .not('price', 'is', null)
    if (data && data.length > 0) {
      const nonZero = data.filter((m) => Number(m.price) > 0)
      if (nonZero.length > 0) {
        const avg = nonZero.reduce((s, m) => s + Number(m.price), 0) / nonZero.length
        return { value: round2(avg), source: 'menu_avg' }
      }
    }
  }

  // 4. Hard default
  return { value: HARD_DEFAULT_TRY, source: 'default' }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

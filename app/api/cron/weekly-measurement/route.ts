import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const supabase = createAdminClient()
  const { data: orgs } = await supabase.from('organizations').select('id').eq('onboarding_completed', true)
  if (!orgs) return NextResponse.json({ error: 'No orgs' }, { status: 404 })

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  let measured = 0

  for (const org of orgs) {
    // Treatment group: notifications that were actually sent (not holdback, not 'nothing')
    const { data: treatmentRows } = await supabase
      .from('notification_audit')
      .select('customer_id, outcome, tier, discount_used')
      .eq('org_id', org.id)
      .eq('was_holdback', false)
      .neq('action_chosen', 'nothing')
      .gte('decision_date', sevenDaysAgo)

    // Holdback group: customers selected but NOT sent
    const { data: holdbackRows } = await supabase
      .from('notification_audit')
      .select('customer_id, outcome')
      .eq('org_id', org.id)
      .eq('was_holdback', true)
      .gte('decision_date', sevenDaysAgo)

    const treatmentCount = treatmentRows?.length || 0
    const holdbackCount = holdbackRows?.length || 0

    if (treatmentCount === 0 || holdbackCount === 0) continue

    // Visit rates
    const treatmentVisits = treatmentRows?.filter(r => r.outcome === 'visited').length || 0
    const holdbackVisits = holdbackRows?.filter(r => r.outcome === 'visited').length || 0

    const treatmentRate = treatmentVisits / treatmentCount
    const holdbackRate = holdbackVisits / holdbackCount

    // Incremental lift
    const incrementalRate = Math.max(0, treatmentRate - holdbackRate)
    const incrementalVisits = Math.round(incrementalRate * treatmentCount)

    // Get avg transaction for revenue calculation
    const { data: avgData } = await supabase
      .from('customers')
      .select('avg_spend')
      .eq('org_id', org.id)
      .not('avg_spend', 'is', null)

    const avgSpend = avgData && avgData.length > 0
      ? avgData.reduce((s, c) => s + (c.avg_spend || 0), 0) / avgData.length
      : 50 // Default 50 TRY if no data

    const incrementalRevenue = Math.round(incrementalVisits * avgSpend * 100) / 100

    // Discount cost: sum of discounts used on treatment visits
    const discountCost = treatmentRows
      ?.filter(r => r.outcome === 'visited' && r.discount_used)
      .reduce((s, r) => s + (avgSpend * (r.discount_used! / 100)), 0) || 0

    const netRoi = Math.round((incrementalRevenue - discountCost) * 100) / 100

    // Best performing tier
    const tierVisits = new Map<number, number>()
    for (const r of treatmentRows || []) {
      if (r.outcome === 'visited' && r.tier) {
        tierVisits.set(r.tier, (tierVisits.get(r.tier) || 0) + 1)
      }
    }
    let bestTier: number | null = null
    let bestTierCount = 0
    for (const [tier, count] of tierVisits) {
      if (count > bestTierCount) { bestTier = tier; bestTierCount = count }
    }

    // Update shop_intelligence
    await supabase.from('shop_intelligence').upsert({
      org_id: org.id,
      incremental_visits_this_week: incrementalVisits,
      incremental_revenue_this_week: incrementalRevenue,
      discount_cost_this_week: Math.round(discountCost * 100) / 100,
      net_roi_this_week: netRoi,
      best_performing_tier: bestTier,
      last_computed_at: new Date().toISOString(),
    }, { onConflict: 'org_id' })

    measured++
  }

  return NextResponse.json({ success: true, measured })
}

export { POST as GET }

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Churn Risk Heuristic (Technical Spec Section 8.1 — Cold Start)
// Rule-based scoring for months 1-3 (before ML model is trained)
// - churn_risk = 0.9 if no visit in 21+ days (for daily visitors)
// - churn_risk = 0.7 if no visit in 14-21 days
// - Scale based on customer's average visit frequency

export async function POST() {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = createAdminClient()
    const { data: userData } = await supabase.from('users').select('org_id, role').eq('id', user.id).single()
    if (!userData?.org_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const orgId = userData.org_id

    // Get all customers with visit history
    const { data: customers } = await supabase
      .from('customers')
      .select('id, last_visit_at, first_visit_at, total_visits, created_at')
      .eq('org_id', orgId)
      .gt('total_visits', 0)

    if (!customers || customers.length === 0) {
      return NextResponse.json({ success: true, scored: 0 })
    }

    const now = new Date()
    let scored = 0

    for (const customer of customers) {
      if (!customer.last_visit_at) continue

      const lastVisit = new Date(customer.last_visit_at)
      const firstVisit = new Date(customer.first_visit_at || customer.created_at)
      const daysSinceLastVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
      const customerLifetimeDays = Math.max(1, Math.floor((now.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24)))

      // Calculate average visit frequency (days between visits)
      const avgDaysBetweenVisits = customer.total_visits > 1
        ? customerLifetimeDays / (customer.total_visits - 1)
        : customerLifetimeDays // If only 1 visit, use lifetime as gap

      // Calculate how overdue they are (ratio of actual gap vs expected gap)
      const overdueRatio = avgDaysBetweenVisits > 0
        ? daysSinceLastVisit / avgDaysBetweenVisits
        : daysSinceLastVisit

      // Score based on how overdue they are
      let churnRisk: number

      if (daysSinceLastVisit >= 120) {
        // Gone 4+ months — likely lost
        churnRisk = 0.99
      } else if (overdueRatio >= 5) {
        // 5x overdue from their normal cadence
        churnRisk = 0.95
      } else if (overdueRatio >= 3 || daysSinceLastVisit >= 21) {
        // 3x overdue or 21+ days
        churnRisk = 0.90
      } else if (overdueRatio >= 2 || daysSinceLastVisit >= 14) {
        // 2x overdue or 14+ days
        churnRisk = 0.70
      } else if (overdueRatio >= 1.5 || daysSinceLastVisit >= 7) {
        // 1.5x overdue or 7+ days
        churnRisk = 0.40
      } else if (overdueRatio >= 1.2) {
        // Slightly overdue — sweet spot for targeting
        churnRisk = 0.20
      } else {
        // On schedule — low risk
        churnRisk = 0.05
      }

      // Update customer
      await supabase
        .from('customers')
        .update({
          churn_risk: Math.round(churnRisk * 100) / 100,
          churn_risk_updated_at: now.toISOString(),
        })
        .eq('id', customer.id)

      scored++
    }

    return NextResponse.json({ success: true, scored })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) {
    return NextResponse.json({ error: 'customerId required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Verify customer belongs to this org
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: customer } = await supabase
    .from('customers')
    .select('current_streak, longest_streak, streak_last_visit_date, streak_grace_used')
    .eq('id', customerId)
    .eq('org_id', org.id)
    .single()

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

  // Check if grace period is available (not already used AND last visit was yesterday or today)
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const lastDate = customer.streak_last_visit_date
  const streakActive = lastDate === today || lastDate === yesterday
  const graceAvailable = streakActive && !customer.streak_grace_used

  const { count: completedChallenges } = await supabase
    .from('customer_challenges')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .eq('status', 'completed')

  return NextResponse.json({
    currentStreak: customer.current_streak || 0,
    longestStreak: customer.longest_streak || 0,
    streakActive,
    graceAvailable,
    completedChallenges: completedChallenges || 0,
  })
}

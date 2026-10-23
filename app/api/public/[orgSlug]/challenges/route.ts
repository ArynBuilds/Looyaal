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

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data: challenge } = await supabase
    .from('customer_challenges')
    .select('id, type, title, description, target_count, current_count, reward_type, reward_value, expires_at, status')
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!challenge) {
    return NextResponse.json({ challenge: null })
  }

  const daysRemaining = Math.max(0, Math.ceil((new Date(challenge.expires_at).getTime() - Date.now()) / 86400000))

  return NextResponse.json({
    challenge: {
      id: challenge.id,
      type: challenge.type,
      title: challenge.title,
      description: challenge.description,
      targetCount: challenge.target_count,
      currentCount: challenge.current_count,
      rewardType: challenge.reward_type,
      rewardValue: challenge.reward_value,
      daysRemaining,
      expiresAt: challenge.expires_at,
    },
  })
}

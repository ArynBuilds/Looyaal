import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) return NextResponse.json([])

  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json([])

  // Fetch sent/delivered notifications for this customer (active deals)
  const { data: deals } = await supabase
    .from('notification_queue')
    .select('id, title, body, offer_type, offer_value, valid_until')
    .eq('org_id', org.id)
    .eq('customer_id', customerId)
    .in('status', ['sent', 'delivered', 'clicked'])
    .order('created_at', { ascending: false })
    .limit(10)

  return NextResponse.json(deals ?? [])
}

import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET: Fetch customer's loyalty card without checking in
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

  if (!org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  // Verify customer exists
  const { data: customer } = await supabase
    .from('customers')
    .select('id, phone, full_name, total_visits, created_at')
    .eq('id', customerId)
    .eq('org_id', org.id)
    .single()

  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
  }

  // Get loyalty card
  const { data: card } = await supabase
    .from('loyalty_cards')
    .select('*, loyalty_programs(*)')
    .eq('org_id', org.id)
    .eq('customer_id', customerId)
    .single()

  return NextResponse.json({ customer, card })
}

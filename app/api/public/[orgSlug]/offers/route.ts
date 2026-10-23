import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const url = new URL(request.url)
  const customerId = url.searchParams.get('customerId')

  if (!customerId) return NextResponse.json([], { status: 200 })

  const admin = createAdminClient()

  const { data: org } = await admin.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) return NextResponse.json([], { status: 200 })

  const { data: offers } = await admin
    .from('customer_offers')
    .select('id, type, title, description, offer_type, offer_value, free_item_name, applies_to_item, expires_at, created_at')
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .eq('status', 'active')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return NextResponse.json(offers || [])
}

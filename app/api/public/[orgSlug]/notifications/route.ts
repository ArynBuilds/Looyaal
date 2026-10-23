import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET: Fetch personalized notifications for a customer (Sana Ozel)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')

  if (!customerId) return NextResponse.json([])

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json([])

  // Fetch customer for personalization
  const { data: customer } = await admin
    .from('customers')
    .select('full_name, top_items')
    .eq('id', customerId)
    .eq('org_id', org.id)
    .single()

  // Fetch queued/sent notifications that are still valid
  const { data } = await admin
    .from('notification_queue')
    .select('id, title, body, offer_type, offer_value, valid_until, campaign_id')
    .eq('org_id', org.id)
    .eq('customer_id', customerId)
    .in('status', ['queued', 'sent', 'delivered'])
    .gt('valid_until', new Date().toISOString())
    .order('scheduled_for', { ascending: false })
    .limit(5)

  const favoriteItem = Array.isArray(customer?.top_items) && customer.top_items.length > 0
    ? (customer.top_items[0] as { name?: string })?.name || ''
    : ''
  const customerName = customer?.full_name || ''

  // Map to campaign-compatible format with personalization
  const notifications = (data || []).map(n => ({
    id: n.id,
    name: personalize(n.title, favoriteItem, customerName),
    description: personalize(n.body, favoriteItem, customerName),
    discount_text: n.offer_value
      ? `${n.offer_type === 'discount_percent' ? '%' : ''}${n.offer_value}`
      : n.offer_type === 'free_item' ? 'Bedava'
      : '',
    valid_until: n.valid_until || undefined,
    campaignId: n.campaign_id || undefined,
  }))

  return NextResponse.json(notifications)
}

function personalize(text: string, favoriteItem: string, customerName: string): string {
  return text
    .replace(/\{favorite_item\}/g, favoriteItem || 'kahve')
    .replace(/\{customer_name\}/g, customerName || '')
    .trim()
}

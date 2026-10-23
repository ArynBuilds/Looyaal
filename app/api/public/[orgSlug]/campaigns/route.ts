import { createAdminClient } from '@/lib/supabase/admin'
import { buildDiscountText } from '@/lib/campaigns/discount-text'
import { NextResponse } from 'next/server'

// GET: Fetch all active campaigns for this org (public — no customer ID needed)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')
  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json([])

  // Fetch customer for personalization if customerId provided
  let favoriteItem = ''
  let customerName = ''
  if (customerId) {
    const { data: customer } = await admin
      .from('customers')
      .select('full_name, top_items')
      .eq('id', customerId)
      .eq('org_id', org.id)
      .single()

    if (customer) {
      favoriteItem = Array.isArray(customer.top_items) && customer.top_items.length > 0
        ? (customer.top_items[0] as { name?: string })?.name || ''
        : ''
      customerName = customer.full_name || ''
    }
  }

  // Fetch the customer's prior redemptions so already-used campaigns vanish
  // from the list. Single-use per (campaign, customer) is enforced at the DB
  // by a UNIQUE constraint; this query is the UI mirror of that rule.
  let redeemedIds: Set<string> = new Set()
  if (customerId) {
    const { data: redeemedRows } = await admin
      .from('campaign_redemptions')
      .select('campaign_id')
      .eq('customer_id', customerId)
      .eq('org_id', org.id)
    if (redeemedRows) {
      redeemedIds = new Set(
        redeemedRows
          .map((r) => (r as { campaign_id: string | null }).campaign_id)
          .filter((id): id is string => !!id)
      )
    }
  }

  const { data } = await admin
    .from('campaigns')
    .select('id, name, description, message_template, type, offer_type, offer_value, offer_valid_until')
    .eq('org_id', org.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(10)

  // Map to frontend format — personalize and strip type.
  // The campaign creation form has no separate description input — only "Kampanya
  // Mesajı" (message_template). Use it as the card description so manually
  // created campaigns aren't blank under the title. Fall back to description for
  // legacy / AI-generated campaigns that populated it directly.
  const campaigns = (data || [])
    .filter((c) => !redeemedIds.has(c.id))
    .map(c => ({
    id: c.id,
    name: personalize(c.name, favoriteItem, customerName),
    description: personalize(c.description || c.message_template || '', favoriteItem, customerName),
    discount_text: buildDiscountText(c.offer_type, c.offer_value),
    valid_until: c.offer_valid_until || undefined,
  }))

  return NextResponse.json(campaigns)
}

function personalize(text: string, favoriteItem: string, customerName: string): string {
  if (!favoriteItem && !customerName) return text
  return text
    .replace(/\{favorite_item\}/g, favoriteItem || 'kahve')
    .replace(/\{customer_name\}/g, customerName || '')
    .trim()
}

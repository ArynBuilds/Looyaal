import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { generatePersonalizedMessage } from '@/lib/intelligence'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const supabase = createAdminClient()
  const now = new Date()
  const month = now.getMonth() + 1
  const day = now.getDate()

  // Find customers with birthday today
  const { data: customers } = await supabase.rpc('find_birthday_customers', { p_month: month, p_day: day }).select('*')

  // Fallback: query directly if RPC doesn't exist
  if (!customers) {
    const { data: allCustomers } = await supabase
      .from('customers')
      .select('id, org_id, full_name, phone, birth_date, top_items, push_subscription')
      .not('birth_date', 'is', null)
      .not('push_subscription', 'is', null)

    const birthdayCustomers = (allCustomers || []).filter(c => {
      if (!c.birth_date) return false
      const bd = new Date(c.birth_date)
      return bd.getMonth() + 1 === month && bd.getDate() === day
    })

    let queued = 0
    // Cache master toggle per org to avoid N queries
    const masterByOrg = new Map<string, { is_enabled: boolean; default_offer_value: number | null }>()
    for (const c of birthdayCustomers) {
      let setting = masterByOrg.get(c.org_id) ?? null
      if (!setting) {
        const { data } = await supabase
          .from('auto_campaign_settings')
          .select('is_enabled, default_offer_value')
          .eq('org_id', c.org_id)
          .eq('type', 'master')
          .maybeSingle()
        setting = data ?? { is_enabled: false, default_offer_value: null }
        masterByOrg.set(c.org_id, setting)
      }

      if (!setting.is_enabled) continue

      const [{ data: loc }, { data: org }] = await Promise.all([
        supabase.from('locations').select('name').eq('org_id', c.org_id).limit(1).single(),
        supabase.from('organizations').select('slug').eq('id', c.org_id).single(),
      ])

      const orgSlug = org?.slug || ''

      const message = generatePersonalizedMessage(
        { full_name: c.full_name, top_items: c.top_items, optimal_discount: null },
        { type: 'birthday', defaultDiscount: setting.default_offer_value || 0 },
        { name: loc?.name || '' },
        null
      )

      const firstName = c.full_name?.split(' ')[0] || ''
      const birthdayTitle = firstName ? `İyi ki doğdun ${firstName}` : 'İyi ki doğdun!'

      await supabase.from('notification_queue').insert({
        org_id: c.org_id,
        customer_id: c.id,
        title: birthdayTitle,
        body: message,
        scheduled_for: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).toISOString(),
        offer_type: 'free_item',
        personalization_tier: c.top_items?.length > 0 ? 'tier2' : 'tier1',
      })

      // Create redeemable birthday offer
      const topItem = (c.top_items as { item: string }[] | null)?.[0]?.item || null
      const midnight = new Date(now)
      midnight.setHours(23, 59, 59, 999)

      const { data: birthdayOffer } = await supabase.from('customer_offers').insert({
        org_id: c.org_id,
        customer_id: c.id,
        type: 'birthday',
        title: 'Doğum günü hediyesi',
        description: topItem
          ? `Doğum gününe özel ${topItem} senden.`
          : 'Doğum gününe özel ikramımız seni bekliyor.',
        offer_type: 'free_item',
        free_item_name: topItem,
        status: 'active',
        expires_at: midnight.toISOString(),
      }).select('id').single()

      if (birthdayOffer) {
        // Update the notification_queue entry with deep-link URL
        await supabase.from('notification_queue')
          .update({ url: `/?tab=magaza&offer=${birthdayOffer.id}` })
          .eq('customer_id', c.id)
          .eq('org_id', c.org_id)
          .order('created_at', { ascending: false })
          .limit(1)
      }

      queued++
    }

    return NextResponse.json({ success: true, queued })
  }

  return NextResponse.json({ success: true })
}

export { POST as GET }

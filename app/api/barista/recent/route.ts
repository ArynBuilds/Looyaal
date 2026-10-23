import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin
    .from('users')
    .select('org_id, is_active')
    .eq('id', user.id)
    .single()
  if (!userData || !userData.is_active) return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })

  const { data: tokens } = await admin
    .from('qr_tokens')
    .select('type, payload, used_at, customer_id')
    .eq('org_id', userData.org_id)
    .not('used_at', 'is', null)
    .order('used_at', { ascending: false })
    .limit(10)

  if (!tokens) return NextResponse.json([])

  // Fetch customer names
  const customerIds = [...new Set(tokens.map(t => t.customer_id))]
  const { data: customers } = await admin
    .from('customers')
    .select('id, full_name, phone')
    .in('id', customerIds)

  const customerMap = new Map((customers || []).map(c => [c.id, c.full_name || c.phone]))

  const results = tokens.map(t => ({
    type: t.type,
    customerName: customerMap.get(t.customer_id) || 'Misafir',
    usedAt: t.used_at,
  }))

  return NextResponse.json(results)
}

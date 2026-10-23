import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await admin
    .from('menu_items')
    .select('id, name, description, price, image_url, category, is_featured')
    .eq('org_id', org.id)
    .eq('is_active', true)
    .order('sort_order')

  return NextResponse.json(data ?? [])
}

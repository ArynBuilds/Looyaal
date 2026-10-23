import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const url = new URL(request.url)
  const customerId = url.searchParams.get('customerId')
  const limit = parseInt(url.searchParams.get('limit') || '5')

  if (!customerId) return NextResponse.json([])

  const admin = createAdminClient()

  const { data: org } = await admin.from('organizations').select('id').eq('slug', orgSlug).single()
  if (!org) return NextResponse.json([])

  const { data: visits } = await admin
    .from('visits')
    .select('visited_at, locations(name)')
    .eq('customer_id', customerId)
    .eq('org_id', org.id)
    .order('visited_at', { ascending: false })
    .limit(limit)

  const mapped = (visits || []).map((v: Record<string, unknown>) => ({
    visited_at: v.visited_at as string,
    location_name: ((v.locations as { name: string } | { name: string }[] | null) && typeof (v.locations as { name: string }).name === 'string'
      ? (v.locations as { name: string }).name
      : Array.isArray(v.locations) && v.locations[0]?.name
        ? (v.locations[0] as { name: string }).name
        : ''),
  }))

  return NextResponse.json(mapped)
}

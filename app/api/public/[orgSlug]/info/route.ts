import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const supabase = createAdminClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, slug, logo_url, banner_url, primary_color, pwa_theme, city, address')
    .eq('slug', orgSlug)
    .single()

  if (error || !org) {
    return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
  }

  return NextResponse.json(org)
}

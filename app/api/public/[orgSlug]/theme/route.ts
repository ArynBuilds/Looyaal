import { createAdminClient } from '@/lib/supabase/admin'
import { generateTokens, DEFAULT_CONFIG, type PwaConfig } from '@/lib/pwa-tokens'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id, name, slug, logo_url, banner_url, primary_color, pwa_config')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Build config from pwa_config JSONB or fall back to defaults
  const config: PwaConfig = {
    ...DEFAULT_CONFIG,
    ...(org.pwa_config as Partial<PwaConfig> || {}),
    brand_color: org.primary_color || DEFAULT_CONFIG.brand_color,
    logo_url: org.logo_url,
    banner_url: org.banner_url || (org.pwa_config as Partial<PwaConfig>)?.banner_url || null,
  }

  const tokens = generateTokens(config)

  return NextResponse.json({
    id: org.id,
    name: org.name,
    slug: org.slug,
    logo_url: org.logo_url,
    banner_url: org.banner_url,
    primary_color: org.primary_color,
    config,
    tokens,
  })
}

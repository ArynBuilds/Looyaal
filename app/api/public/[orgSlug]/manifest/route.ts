import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('name, primary_color')
    .eq('slug', orgSlug)
    .single()

  // Always use the icon endpoint — it normalizes any-aspect-ratio logos to
  // square PNGs so iOS/Android home-screen tiles aren't stretched. Falls
  // back to a brand-colored square when no logo is uploaded. The endpoint
  // pads with 12% safe-zone, so the same source works for adaptive icons
  // (Android maskable) without cropping the brand mark.
  const icons = [
    { src: `/api/public/${orgSlug}/icon/192`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
    { src: `/api/public/${orgSlug}/icon/512`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
  ]

  const manifest = {
    name: org?.name || 'Looyaal',
    short_name: org?.name || 'Looyaal',
    description: 'Sadakat kartınız cebinizde',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: org?.primary_color || '#d97706',
    icons,
  }

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
    },
  })
}

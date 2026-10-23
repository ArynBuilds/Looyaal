import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import sharp from 'sharp'

const VALID_SIZES = new Set([192, 512])

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orgSlug: string; size: string }> }
) {
  const { orgSlug, size: sizeStr } = await params
  const size = parseInt(sizeStr, 10)
  if (!VALID_SIZES.has(size)) {
    return new NextResponse('Bad size', { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: org } = await supabase
    .from('organizations')
    .select('primary_color, pwa_config')
    .eq('slug', orgSlug)
    .single()

  const pwaConfig = (org?.pwa_config || {}) as { logo_url?: string | null }
  const logoUrl = pwaConfig.logo_url
  const bgColor = sanitizeHex(org?.primary_color) || '#d97706'

  // No logo → fall through to a brand-colored solid square. PWA installs
  // still get a recognizable icon instead of a broken one.
  let logoPng: Buffer | null = null
  if (logoUrl) {
    try {
      const res = await fetch(logoUrl, { cache: 'no-store' })
      if (res.ok) {
        logoPng = Buffer.from(await res.arrayBuffer())
      }
    } catch { /* fall through to solid bg */ }
  }

  // Generate a square `size`×`size` PNG: brand-colored bg, logo fit-contained
  // with 12% padding on each side (so the logo never touches the edge — gives
  // OS launchers room for adaptive-icon masks without cropping the brand mark).
  const padding = Math.round(size * 0.12)
  const inner = size - padding * 2

  let composite: Buffer
  if (logoPng) {
    const fittedLogo = await sharp(logoPng)
      .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    composite = await sharp({
      create: { width: size, height: size, channels: 4, background: bgColor },
    })
      .composite([{ input: fittedLogo, top: padding, left: padding }])
      .png()
      .toBuffer()
  } else {
    composite = await sharp({
      create: { width: size, height: size, channels: 4, background: bgColor },
    }).png().toBuffer()
  }

  return new NextResponse(composite as unknown as BodyInit, {
    headers: {
      'Content-Type': 'image/png',
      // Cache for 1h on CDN, 24h in browser. Owner re-upload triggers a new
      // pwa_config row so any change propagates within an hour for new installs.
      'Cache-Control': 'public, max-age=86400, s-maxage=3600',
    },
  })
}

function sanitizeHex(c: string | null | undefined): string | null {
  if (!c) return null
  const hex = c.trim()
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? hex : null
}

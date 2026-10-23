import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { extractBrand } from '@/lib/extractor/extract-brand'
import { fetchBinary } from '@/lib/extractor/safe-fetch'
import { NextResponse } from 'next/server'

const LOGO_MAX_BYTES = 2 * 1024 * 1024

function isValidExternalUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    // Only allow https
    if (url.protocol !== 'https:') return false
    // Fast reject of obvious local hosts; safeFetch also checks resolved IPs
    const hostname = url.hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return false
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) return false
    if (hostname === '169.254.169.254') return false
    if (hostname.endsWith('.internal') || hostname.endsWith('.local')) return false
    return true
  } catch {
    return false
  }
}

async function storeLogo(logoUrl: string, userId: string): Promise<string | null> {
  try {
    const { bytes, contentType } = await fetchBinary(logoUrl, { timeoutMs: 8000, maxBytes: LOGO_MAX_BYTES })
    const ext = logoUrl.split('.').pop()?.split('?')[0]?.toLowerCase() || 'png'
    const type = contentType.startsWith('image/') ? contentType.split(';')[0] : `image/${ext === 'svg' ? 'svg+xml' : ext}`
    if (!type.startsWith('image/') || bytes.byteLength === 0) return null

    const admin = createAdminClient()
    const path = `extracted/${userId}-${Date.now()}.${ext.replace(/[^a-z0-9]/g, '') || 'png'}`
    const { data: upload } = await admin.storage.from('org-assets').upload(path, bytes, { contentType: type })
    if (!upload) return null
    return admin.storage.from('org-assets').getPublicUrl(path).data.publicUrl
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await request.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  if (!isValidExternalUrl(url)) {
    return NextResponse.json({ error: 'Invalid URL. Only public HTTPS URLs are allowed.' }, { status: 400 })
  }

  try {
    const { config, raw } = await extractBrand(url)

    // Copy the logo into our own storage so it survives changes on the source site
    const storedLogoUrl = config.logo_url && isValidExternalUrl(config.logo_url)
      ? await storeLogo(config.logo_url, user.id)
      : null

    const finalConfig = {
      ...config,
      logo_url: storedLogoUrl || config.logo_url || null,
    }

    return NextResponse.json({
      brand: {
        name: config.name || null,
        primaryColor: config.brand_color || null,
        logoUrl: finalConfig.logo_url,
        colors: raw.colors || [],
      },
      config: finalConfig,
      confidence: config._confidence || {},
    })
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : 'Extraction failed',
    }, { status: 400 })
  }
}

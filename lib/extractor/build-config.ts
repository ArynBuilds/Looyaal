// Turns a raw extraction into the PWA config answers used by onboarding/editor.
// Ported from the former standalone extractor service.

import { normalizeColorToHex } from './color'
import { scoreShopStyle } from './score-style'
import type { BannerSource, ExtractedConfig, LogoSource, RawExtraction } from './types'

const LOGO_CONFIDENCE: Record<LogoSource, number> = {
  'apple-touch-icon': 0.9, 'large-favicon': 0.85, 'header-img': 0.8, 'svg-logo': 0.85, 'og-image': 0.5, favicon: 0.4,
}
const BANNER_CONFIDENCE: Record<BannerSource, number> = {
  'og-image': 0.7, 'twitter-image': 0.65, 'dom-largest': 0.55, 'css-background': 0.5,
}
const STAMP_FEEL = { premium: 'realistic', craft: 'realistic', cozy: 'playful', modern: 'minimal' } as const

const isNeutral = (hex: string) => hex === '#000000' || hex === '#ffffff'

function pickBrandColor(raw: RawExtraction, config: ExtractedConfig): void {
  if (raw.colors.length === 0) return
  const metaHex = normalizeColorToHex(raw.metaThemeColor)
  const varHexes = raw.cssVarColors.map(c => normalizeColorToHex(c)).filter((h): h is string => !!h)

  let best = 0
  let metaMatch = false
  let cssVarMatch = false
  for (let i = 0; i < raw.colors.length; i++) {
    const hex = normalizeColorToHex(raw.colors[i])
    if (hex && hex === metaHex) { best = i; metaMatch = true; break }
    if (hex && varHexes.includes(hex)) { best = i; cssVarMatch = true; break }
  }

  if (!metaMatch && !cssVarMatch && metaHex && !isNeutral(metaHex)) {
    config.brand_color = metaHex
    metaMatch = true
  } else if (!metaMatch && !cssVarMatch) {
    const validVar = varHexes.find(h => !isNeutral(h))
    if (validVar) { config.brand_color = validVar; cssVarMatch = true }
  }
  if (!config.brand_color) config.brand_color = normalizeColorToHex(raw.colors[best]) || '#d97706'

  let conf = 0.5
  if (raw.colors.length >= 3) conf += 0.1
  if (metaMatch) conf += 0.25
  if (cssVarMatch) conf += 0.2
  config._confidence.brand_color = Math.min(conf, 0.95)
}

export function buildConfig(raw: RawExtraction): ExtractedConfig {
  const config: ExtractedConfig = { _confidence: {} }
  const sig = raw.signals

  pickBrandColor(raw, config)

  if (raw.logoUrl) {
    config.logo_url = raw.logoUrl
    config._confidence.logo_url = raw.logoSource ? LOGO_CONFIDENCE[raw.logoSource] : 0.5
  }
  if (raw.heroImageUrl) {
    config.banner_url = raw.heroImageUrl
    config._confidence.banner_url = raw.bannerSource ? BANNER_CONFIDENCE[raw.bannerSource] : 0.5
  }

  const lang = raw.language.toLowerCase()
  config.language = lang.startsWith('tr') ? 'tr' : lang.startsWith('ar') ? 'ar' : 'en'
  config._confidence.language = 0.9

  config.has_product_photos = raw.hasProductPhotos
  config._confidence.has_product_photos = 0.7

  if (raw.title) config.name = raw.title.split(/[|\-–—]/)[0].trim()

  const style = scoreShopStyle(sig)
  config.shop_style = style.style
  config._confidence.shop_style = style.confidence
  config._scores = style.scores

  config.font_personality = sig.serifRatio > 0.3 ? 'traditional' : sig.avgFontWeight > 600 ? 'bold' : 'clean'
  config._confidence.font_personality = 0.8

  config.shape = sig.avgRadius > 20 ? 'round' : 'smooth'
  config._confidence.shape = 0.8

  config.density = sig.avgSpacing > 20 ? 'balanced' : 'packed'
  config._confidence.density = 0.7

  config.layout = raw.isSinglePage ? 'single-page' : 'tabs'
  config._confidence.layout = 0.65

  config.stamp_feel = STAMP_FEEL[style.style]
  config._confidence.stamp_feel = style.confidence * 0.9

  const lp = sig.layoutPatterns
  config._layout_hints = {
    dominant: sig.dominantLayout || 'unknown',
    stacked: lp.stackedFullWidth,
    grid: lp.cardGrid,
    overlay: lp.textOverlay,
    thumbnails: lp.thumbnailRows,
    hero: lp.heroImage,
    mosaic: lp.mosaicMixed,
    textOnly: lp.textOnly,
    denseList: lp.denseList,
  }
  return config
}

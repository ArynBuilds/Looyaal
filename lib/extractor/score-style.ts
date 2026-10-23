// Multi-signal weighted scoring of the shop style (continuous 0-1 inputs).
// Ported unchanged from the former standalone extractor service.

import type { ExtractionSignals, ShopStyle } from './types'

export interface StyleResult {
  style: ShopStyle
  confidence: number
  scores: Record<ShopStyle, number>
}

export function scoreShopStyle(sig: ExtractionSignals): StyleResult {
  const lp = sig.layoutPatterns
  const s = {
    darkness: sig.isDarkBg ? 1.0 : sig.bgLuminance < 0.3 ? 0.6 : sig.bgLuminance < 0.5 ? 0.3 : 0,
    shadowDepth: Math.min(sig.avgShadowDepth / 20, 1.0),
    shadowCount: Math.min(sig.totalShadowCount / 30, 1.0),
    serifStrength: sig.serifRatio,
    monoStrength: sig.hasMonospace ? 1.0 : sig.hasThinFonts ? 0.5 : 0,
    fontWeight: Math.min(sig.avgFontWeight / 900, 1.0),
    colorWarmth: sig.warmRatio,
    colorSaturation: Math.min(sig.avgSaturation / 0.8, 1.0),
    radiusSize: Math.min(sig.avgRadius / 30, 1.0),
    gradientDensity: Math.min(sig.gradientCount / 10, 1.0),
    whitespaceRatio: Math.min(sig.avgSpacing / 40, 1.0),
    colorVariety: Math.min(sig.uniqueBrandColors / 5, 1.0),
    layoutStacked: Math.min(lp.stackedFullWidth / 5, 1.0),
    layoutCardGrid: Math.min(lp.cardGrid / 8, 1.0),
    layoutOverlay: Math.min(lp.textOverlay / 5, 1.0),
    layoutThumbnails: Math.min(lp.thumbnailRows / 5, 1.0),
    layoutHero: Math.min(lp.heroImage / 2, 1.0),
    layoutMosaic: Math.min(lp.mosaicMixed / 5, 1.0),
    layoutTextOnly: Math.min(lp.textOnly / 4, 1.0),
    layoutDenseList: Math.min(lp.denseList / 4, 1.0),
  }

  const scores: Record<ShopStyle, number> = { premium: 0, craft: 0, cozy: 0, modern: 0 }

  scores.premium += s.darkness * 3.0
  scores.modern += s.darkness * 1.5
  scores.craft += s.darkness * 0.5

  scores.premium += s.shadowDepth * 3.0
  scores.craft += s.shadowDepth * 1.0
  scores.cozy += s.shadowDepth * 0.5

  scores.premium += s.shadowCount * 1.5
  scores.modern += (1.0 - s.shadowCount) * 2.5

  scores.craft += s.serifStrength * 4.0
  scores.premium += s.serifStrength * 1.0
  scores.cozy += s.serifStrength * 0.5

  scores.modern += s.monoStrength * 3.0

  scores.premium += s.fontWeight * 1.5
  scores.craft += s.fontWeight * 0.5
  scores.modern += (1.0 - s.fontWeight) * 2.0

  scores.craft += s.colorWarmth * 3.5
  scores.cozy += s.colorWarmth * 3.0
  scores.premium += (1.0 - s.colorWarmth) * 1.0
  scores.modern += (1.0 - s.colorWarmth) * 1.5

  scores.cozy += s.colorSaturation * 2.0
  scores.craft += s.colorSaturation * 1.5
  scores.modern += (1.0 - s.colorSaturation) * 2.0

  scores.cozy += s.radiusSize * 2.0
  scores.craft += s.radiusSize * 1.0
  scores.premium += (1.0 - s.radiusSize) * 1.0
  scores.modern += (1.0 - s.radiusSize) * 1.5

  scores.premium += s.gradientDensity * 2.5
  scores.cozy += s.gradientDensity * 1.0

  scores.modern += s.whitespaceRatio * 2.0
  scores.premium += s.whitespaceRatio * 1.0
  scores.cozy += (1.0 - s.whitespaceRatio) * 1.0
  scores.craft += (1.0 - s.whitespaceRatio) * 0.5

  scores.cozy += s.colorVariety * 1.5
  scores.modern += (1.0 - s.colorVariety) * 1.0

  // Layout patterns
  scores.premium += s.layoutStacked * 2.5
  scores.craft += s.layoutStacked * 1.0
  scores.modern += s.layoutCardGrid * 2.5
  scores.cozy += s.layoutCardGrid * 1.0
  scores.premium += s.layoutOverlay * 3.0
  scores.craft += s.layoutThumbnails * 2.0
  scores.modern += s.layoutThumbnails * 1.0
  scores.premium += s.layoutHero * 2.0
  scores.craft += s.layoutHero * 1.0
  scores.cozy += s.layoutMosaic * 2.5
  scores.modern += s.layoutTextOnly * 2.0
  scores.modern += s.layoutDenseList * 1.5
  scores.craft += s.layoutDenseList * 0.5

  for (const k of Object.keys(scores) as ShopStyle[]) scores[k] = Math.round(scores[k] * 100) / 100

  const sorted = (Object.entries(scores) as Array<[ShopStyle, number]>).sort((a, b) => b[1] - a[1])
  const [winner, runnerUp] = sorted
  const total = sorted.reduce((a, [, v]) => a + v, 0)
  const margin = winner[1] - runnerUp[1]
  const confidence = total > 0 ? Math.min(winner[1] / total + (margin > 3 ? 0.2 : 0), 0.95) : 0.5

  return { style: winner[0], confidence, scores }
}

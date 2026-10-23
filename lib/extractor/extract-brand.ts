// Brand extractor: fetches a cafe's website (HTML + up to a few stylesheets),
// derives brand signals with cheerio + static CSS analysis, and builds the
// PWA config answers. Runs in-process; no headless browser required.

import * as cheerio from 'cheerio'
import { buildConfig } from './build-config'
import { analyzeCss, bgLuminance, colorMood, parseCss, parseDeclarations, topBrandColors, type CssRule } from './css-signals'
import {
  detectBanner, detectLanguage, detectLayoutPatterns, detectLogo, detectProductPhotos, detectSinglePage,
} from './dom-signals'
import { fetchText } from './safe-fetch'
import type { ExtractedConfig, LayoutPatterns, RawExtraction } from './types'

const PAGE_TIMEOUT_MS = 12_000
const PAGE_MAX_BYTES = 3 * 1024 * 1024
const CSS_TIMEOUT_MS = 6_000
const CSS_MAX_BYTES = 1.5 * 1024 * 1024
const MAX_STYLESHEETS = 6

const SERIF = ['playfair', 'georgia', 'times', 'serif', 'merriweather', 'lora', 'garamond', 'baskerville']
const MONO = ['mono', 'fira code', 'jetbrains', 'consolas', 'courier', 'monospace']

async function collectStylesheets($: cheerio.CheerioAPI, base: string): Promise<string[]> {
  const hrefs = $('link[rel~="stylesheet"]').toArray()
    .map(el => el.attribs.href)
    .filter((h): h is string => !!h && !h.includes('fonts.googleapis.com'))
    .map(h => { try { return new URL(h, base).href } catch { return null } })
    .filter((h): h is string => !!h)
    .slice(0, MAX_STYLESHEETS)
  const results = await Promise.allSettled(
    hrefs.map(h => fetchText(h, { timeoutMs: CSS_TIMEOUT_MS, maxBytes: CSS_MAX_BYTES })),
  )
  return results.flatMap(r => (r.status === 'fulfilled' ? [r.value.text] : []))
}

function inlineStyleRules($: cheerio.CheerioAPI): CssRule[] {
  return $('[style]').toArray().slice(0, 500).map(el => ({
    selector: el.tagName.toLowerCase(),
    decls: parseDeclarations(el.attribs.style || ''),
  }))
}

const avg = (xs: number[], fallback: number) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : fallback)

function dominantLayout(lp: LayoutPatterns): { dominant: string; score: number } {
  const [name, score] = Object.entries(lp).sort((a, b) => b[1] - a[1])[0]
  return { dominant: score > 0 ? name : 'unknown', score }
}

export async function extractBrand(inputUrl: string): Promise<{ raw: RawExtraction; config: ExtractedConfig }> {
  const url = inputUrl.startsWith('http') ? inputUrl : `https://${inputUrl}`
  const { text: html, finalUrl } = await fetchText(url, { timeoutMs: PAGE_TIMEOUT_MS, maxBytes: PAGE_MAX_BYTES })
  const $ = cheerio.load(html)

  const styleTags = $('style').toArray().map(el => $(el).text())
  const linked = await collectStylesheets($, finalUrl)
  const rules = [...[...styleTags, ...linked].flatMap(parseCss), ...inlineStyleRules($)]
  const css = analyzeCss(rules)

  // Body background: CSS rule on html/body, inline body style, else white.
  const bodyStyle = parseDeclarations($('body').attr('style') || '')
    .find(([p]) => p === 'background' || p === 'background-color')?.[1]
  const bodyBg = css.bodyBg ?? bodyStyle ?? 'rgb(255, 255, 255)'
  const lum = bgLuminance(bodyBg)

  // Fonts
  const fontEntries = [...css.fontUsage.entries()].sort((a, b) => b[1] - a[1])
  const fontTotal = fontEntries.reduce((a, [, n]) => a + n, 0)
  const serifUsage = fontEntries.filter(([f]) => SERIF.some(k => f.toLowerCase().includes(k))).reduce((a, [, n]) => a + n, 0)
  const topFonts = fontEntries.slice(0, 3).map(([f]) => f)

  // Declared weights are biased toward bold; blend with the implicit 400 body text.
  const weights = [...css.fontWeights, ...Array<number>(Math.max(css.fontWeights.length, 10)).fill(400)]

  const radii = [...css.radii].sort((a, b) => a - b)
  const medianRadius = radii.length ? radii[Math.floor(radii.length / 2)] : 0
  const { warmRatio, avgSaturation } = colorMood(css.colorWeights)
  const layoutPatterns = detectLayoutPatterns($)
  const { dominant, score } = dominantLayout(layoutPatterns)
  const logo = detectLogo($, finalUrl)
  const banner = detectBanner($, finalUrl)
  const avgSpacing = avg(css.paddings, 16)
  const avgShadowDepth = avg(css.shadowBlurs, 0)

  const raw: RawExtraction = {
    colors: topBrandColors(css.colorWeights),
    fonts: topFonts,
    borderRadius: [avg(css.radii, 0)],
    shadows: [css.shadowBlurs.length],
    spacing: [avgSpacing],
    backgrounds: [bodyBg],
    language: detectLanguage($),
    hasProductPhotos: detectProductPhotos($),
    isSinglePage: detectSinglePage($),
    logoUrl: logo.url,
    logoSource: logo.source,
    heroImageUrl: banner.url,
    bannerSource: banner.source,
    title: $('title').first().text().trim() || $('meta[property="og:site_name"]').attr('content') || '',
    metaThemeColor: ($('meta[name="theme-color"]').attr('content') || $('meta[name="msapplication-navbutton-color"]').attr('content') || '').trim() || null,
    cssVarColors: css.cssVarColors,
    signals: {
      isDarkBg: lum < 0.4,
      bgLuminance: lum,
      avgShadowDepth,
      totalShadowCount: css.shadowBlurs.length,
      serifRatio: fontTotal > 0 ? serifUsage / fontTotal : 0,
      hasMonospace: topFonts.some(f => MONO.some(k => f.toLowerCase().includes(k))),
      hasThinFonts: css.fontWeights.some(w => w <= 300),
      avgFontWeight: avg(weights, 400),
      warmRatio,
      avgSaturation,
      avgRadius: medianRadius,
      medianRadius,
      avgRadiusMean: avg(css.radii, 0),
      highRadius: medianRadius > 40,
      lowRadius: medianRadius < 12,
      gradientCount: css.gradientCount,
      avgSpacing,
      // Always 0 in the original service (computed before colors were set);
      // kept so the calibrated style scoring behaves the same.
      uniqueBrandColors: 0,
      layoutPatterns,
      dominantLayout: dominant,
      layoutScore: score,
    },
  }

  return { raw, config: buildConfig(raw) }
}

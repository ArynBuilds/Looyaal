// HTML (cheerio) analysis: logo, banner, language, layout hints.
// Layout signals are heuristics from markup (classes, width/height attributes)
// because static HTML has no rendered geometry.

import type { CheerioAPI } from 'cheerio'
import type { BannerSource, LayoutPatterns, LogoSource } from './types'

const FOOD_KEYWORDS = ['latte', 'coffee', 'kahve', 'cappuccino', 'americano', 'espresso', 'mocha', 'menu',
  'product', 'drink', 'food', 'icecek', 'tatli', 'brew', 'roast', 'bean', 'cup', 'cafe', 'pastry', 'cake']

function resolve(href: string | undefined, base: string): string | null {
  if (!href) return null
  try {
    const url = new URL(href.trim(), base)
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null
  } catch {
    return null
  }
}

const imgSrc = (el: { attribs?: Record<string, string> }) =>
  el.attribs?.src || el.attribs?.['data-src'] || el.attribs?.['data-lazy-src'] || ''

export function detectLanguage($: CheerioAPI): string {
  const lang = $('html').attr('lang') || ''
  if (lang) return lang
  const text = $('body').text().slice(0, 2000)
  const tr = (text.match(/[şçğıöüŞÇĞİÖÜ]/g) || []).length
  const ar = (text.match(/[؀-ۿ]/g) || []).length
  return tr > 5 ? 'tr' : ar > 10 ? 'ar' : 'en'
}

export function detectLogo($: CheerioAPI, base: string): { url: string | null; source: LogoSource | null } {
  const apple = resolve($('link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]').first().attr('href'), base)
  if (apple) return { url: apple, source: 'apple-touch-icon' }

  const large = $('link[rel="icon"], link[rel="shortcut icon"]').toArray()
    .map(el => ({ href: el.attribs.href, size: parseInt(el.attribs.sizes || '0', 10) || 0 }))
    .filter(i => i.size >= 128)
    .sort((a, b) => b.size - a.size)[0]
  const largeUrl = resolve(large?.href, base)
  if (largeUrl) return { url: largeUrl, source: 'large-favicon' }

  const header = $('header, nav, [role="banner"]').first()
  if (header.length) {
    const logoImg = header.find('img').toArray().find(img => {
      const hay = `${imgSrc(img)} ${img.attribs.alt || ''} ${img.attribs.class || ''} ${img.attribs.id || ''}`.toLowerCase()
      return hay.includes('logo')
    })
    const logoUrl = logoImg ? resolve(imgSrc(logoImg), base) : null
    if (logoUrl) return { url: logoUrl, source: 'header-img' }

    const svg = header.find('img[src$=".svg"], object[data$=".svg"]').first()
    const svgUrl = resolve(svg.attr('src') || svg.attr('data'), base)
    if (svgUrl) return { url: svgUrl, source: 'svg-logo' }
  }

  const og = resolve($('meta[property="og:image"]').attr('content'), base)
  if (og) return { url: og, source: 'og-image' }

  const favicon = resolve($('link[rel*="icon"]').first().attr('href'), base)
  if (favicon) return { url: favicon, source: 'favicon' }
  return { url: null, source: null }
}

export function detectBanner($: CheerioAPI, base: string): { url: string | null; source: BannerSource | null } {
  const og = resolve($('meta[property="og:image"]').attr('content'), base)
  if (og) return { url: og, source: 'og-image' }
  const tw = resolve($('meta[name="twitter:image"]').attr('content'), base)
  if (tw) return { url: tw, source: 'twitter-image' }

  let best: string | null = null
  let bestArea = 0
  $('img').slice(0, 30).each((_, img) => {
    const w = parseInt(img.attribs.width || '0', 10)
    const h = parseInt(img.attribs.height || '0', 10) || w / 2
    const url = resolve(imgSrc(img), base)
    if (url && w > 200 && w * h > bestArea) { bestArea = w * h; best = url }
  })
  if (best) return { url: best, source: 'dom-largest' }

  let cssBg: string | null = null
  $('header, section, div').slice(0, 60).each((_, el) => {
    const m = (el.attribs.style || '').match(/background(?:-image)?:[^;]*url\(["']?([^"')]+)/i)
    const url = m ? resolve(m[1], base) : null
    if (url) { cssBg = url; return false }
  })
  if (cssBg) return { url: cssBg, source: 'css-background' }
  return { url: null, source: null }
}

export function detectSinglePage($: CheerioAPI): boolean {
  const links = $('nav a, header a').toArray()
  const hash = links.filter(a => (a.attribs.href || '').startsWith('#'))
  return links.length > 0 && hash.length > links.length * 0.5
}

export function detectProductPhotos($: CheerioAPI): boolean {
  let count = 0
  $('img').each((_, img) => {
    const s = imgSrc(img).toLowerCase()
    const a = (img.attribs.alt || '').toLowerCase()
    const p = $(img).parent().text().toLowerCase().slice(0, 200)
    if (FOOD_KEYWORDS.some(k => s.includes(k) || a.includes(k) || p.includes(k))) count++
  })
  $('[style*="url("]').each((_, el) => {
    const style = (el.attribs.style || '').toLowerCase()
    const text = $(el).text().toLowerCase().slice(0, 200)
    if (FOOD_KEYWORDS.some(k => style.includes(k) || text.includes(k))) count++
  })
  return count >= 2
}

export function detectLayoutPatterns($: CheerioAPI): LayoutPatterns {
  const p: LayoutPatterns = {
    stackedFullWidth: 0, cardGrid: 0, thumbnailRows: 0, textOverlay: 0,
    heroImage: 0, mosaicMixed: 0, textOnly: 0, denseList: 0,
  }
  const widths: number[] = []
  const visuals = $('img').toArray().concat($('[style*="url("]').toArray())

  for (const el of visuals) {
    const $el = $(el)
    const cls = `${el.attribs.class || ''} ${$el.parent().attr('class') || ''} ${$el.parent().parent().attr('class') || ''}`.toLowerCase()
    const w = parseInt(el.attribs.width || '0', 10)
    const h = parseInt(el.attribs.height || '0', 10)
    if (w > 0 && w < 30) continue
    if (w > 0) widths.push(w)

    if (w >= 1000 || /full-?width|w-full|cover|fullscreen/.test(cls)) p.stackedFullWidth++
    if (/grid|cards?\b|col-|columns|gallery/.test(cls)) p.cardGrid++
    if ((w > 0 && w < 400 && h > 0 && h < 200) || /thumb|avatar|icon-img/.test(cls)) p.thumbnailRows++
    if (/hero|banner|slider|carousel|jumbotron/.test(cls)) p.heroImage++
    const hasOverlayText = $el.siblings().toArray().some(s => /overlay|caption|absolute/.test((s.attribs.class || '').toLowerCase()) && $(s).text().trim().length > 2)
    if (hasOverlayText || /overlay/.test(cls)) p.textOverlay++
  }
  p.heroImage = Math.min(p.heroImage + $('[class*="hero"], [class*="banner"], [class*="slider"]').slice(0, 2).length, 4)

  if (widths.length > 3) {
    const avg = widths.reduce((a, b) => a + b, 0) / widths.length
    const std = Math.sqrt(widths.reduce((a, w) => a + (w - avg) ** 2, 0) / widths.length)
    if (std / avg > 0.4) p.mosaicMixed = Math.round((std / avg) * 5)
  }

  $('section, article, main > div').each((_, sec) => {
    const $sec = $(sec)
    if ($sec.text().trim().length < 80) return
    if ($sec.find('img').length === 0) p.textOnly++
    if ($sec.children().length > 8) p.denseList++
  })
  return p
}

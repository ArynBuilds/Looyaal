// Static CSS analysis: approximates the computed-style sampling the old
// headless-browser extractor did, using declarations from <style>, linked
// stylesheets and inline style attributes.

import { luminance, parseColor, toHsl, toRgbString } from './color'

export interface CssRule {
  selector: string
  decls: Array<[string, string]>
}

export interface CssSignals {
  colorWeights: Map<string, number>   // "rgb(r, g, b)" -> weight
  fontUsage: Map<string, number>
  fontWeights: number[]
  radii: number[]
  shadowBlurs: number[]
  paddings: number[]
  gradientCount: number
  bodyBg: string | null
  cssVarColors: string[]
}

const BRAND_VARS = new Set(['--primary', '--brand', '--accent', '--main-color', '--theme-color',
  '--color-primary', '--color-brand', '--color-accent', '--primary-color', '--brand-color'])

const COLOR_TOKEN = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi

export function parseCss(css: string): CssRule[] {
  const cleaned = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@font-face\s*\{[^}]*\}/gi, '')
  const rules: CssRule[] = []
  const re = /([^{}]+)\{([^{}]*)\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(cleaned)) !== null) {
    const selector = m[1].trim().toLowerCase()
    if (selector.startsWith('@') || /^(from|to|\d+%)/.test(selector)) continue // keyframe steps
    rules.push({ selector, decls: parseDeclarations(m[2]) })
  }
  return rules
}

export function parseDeclarations(block: string): Array<[string, string]> {
  const out: Array<[string, string]> = []
  for (const part of block.split(';')) {
    const idx = part.indexOf(':')
    if (idx <= 0) continue
    const prop = part.slice(0, idx).trim().toLowerCase()
    const value = part.slice(idx + 1).replace(/!important/i, '').trim()
    if (prop && value) out.push([prop, value])
  }
  return out
}

function selectorWeight(selector: string): number {
  if (/(^|[\s,>+~])h1\b/.test(selector)) return 3.0
  if (/(^|[\s,>+~])h2\b/.test(selector)) return 2.5
  if (/(^|[\s,>+~])h3\b/.test(selector) || /button|\.btn/.test(selector)) return 2.0
  if (/header|nav|navbar/.test(selector)) return 1.5
  if (/(^|[\s,>+~])a\b|link/.test(selector)) return 1.3
  if (/section|hero|banner/.test(selector)) return 1.2
  return 1.0
}

function toPx(value: string): number | null {
  const m = value.trim().match(/^(-?[\d.]+)(px|rem|em)?/)
  if (!m) return null
  const n = parseFloat(m[1])
  if (Number.isNaN(n)) return null
  return m[2] === 'rem' || m[2] === 'em' ? n * 16 : n
}

const isRootSelector = (s: string) => /(^|,)\s*(html|body|:root)\s*($|,)/.test(s)

export function analyzeCss(rules: CssRule[]): CssSignals {
  const sig: CssSignals = {
    colorWeights: new Map(), fontUsage: new Map(), fontWeights: [], radii: [],
    shadowBlurs: [], paddings: [], gradientCount: 0, bodyBg: null, cssVarColors: [],
  }
  const addColor = (raw: string, weight: number) => {
    const rgb = parseColor(raw)
    if (!rgb) return
    const key = toRgbString(rgb)
    sig.colorWeights.set(key, (sig.colorWeights.get(key) || 0) + weight)
  }

  for (const { selector, decls } of rules) {
    const w = selectorWeight(selector)
    const root = isRootSelector(selector)
    for (const [prop, value] of decls) {
      if (BRAND_VARS.has(prop) && root) sig.cssVarColors.push(value)
      if (prop === 'color') {
        for (const tok of value.match(COLOR_TOKEN) || [value]) addColor(tok, w)
      } else if (prop === 'background' || prop === 'background-color') {
        if (value.includes('gradient')) sig.gradientCount++
        const tokens = value.match(COLOR_TOKEN) || [value.split(/\s+/)[0]]
        for (const tok of tokens) addColor(tok, w * (root ? 3 : 1.5))
        if (root && !sig.bodyBg) {
          const first = tokens.map(t => parseColor(t)).find(Boolean)
          if (first) sig.bodyBg = toRgbString(first)
        }
      } else if (prop === 'background-image' && value.includes('gradient')) {
        sig.gradientCount++
      } else if (prop === 'font-family') {
        const family = value.split(',')[0].replace(/['"]/g, '').trim()
        if (family && !family.startsWith('var(') && family !== 'inherit') {
          sig.fontUsage.set(family, (sig.fontUsage.get(family) || 0) + (root ? 5 : 1))
        }
      } else if (prop === 'font-weight') {
        const n = value === 'bold' ? 700 : value === 'normal' ? 400 : parseInt(value, 10)
        if (n >= 100 && n <= 900) sig.fontWeights.push(n)
      } else if (prop === 'border-radius') {
        if (value.includes('%')) continue
        const px = toPx(value)
        if (px !== null && px > 0) sig.radii.push(Math.min(px, 100))
      } else if (prop === 'box-shadow' && value !== 'none') {
        const m = value.match(/(-?\d+)(?:px)?\s+(-?\d+)(?:px)?\s+(\d+)px/)
        if (m) sig.shadowBlurs.push(parseInt(m[3], 10))
      } else if (prop === 'padding' || prop === 'padding-top' || prop === 'padding-bottom') {
        const px = toPx(value.split(/\s+/)[0])
        if (px !== null && px > 0) sig.paddings.push(px)
      }
    }
  }
  return sig
}

/** Top brand colors: saturated, mid-lightness, by weight. */
export function topBrandColors(weights: Map<string, number>, limit = 5): string[] {
  return [...weights.entries()]
    .filter(([c]) => {
      const rgb = parseColor(c)
      if (!rgb) return false
      const { s, l } = toHsl(rgb)
      return l >= 0.15 && l <= 0.9 && s >= 0.15
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([c]) => c)
}

/** Warm-vs-cool ratio and average saturation of the colorful colors. */
export function colorMood(weights: Map<string, number>): { warmRatio: number; avgSaturation: number } {
  let warm = 0, colorful = 0, totalSat = 0, satCount = 0
  for (const c of weights.keys()) {
    const rgb = parseColor(c)
    if (!rgb) continue
    const { h, s, l } = toHsl(rgb)
    if (s > 0.15 && l > 0.1 && l < 0.9) {
      totalSat += s
      satCount++
      colorful++
      if (h <= 70 || h >= 320) warm++
    }
  }
  return {
    warmRatio: colorful > 0 ? warm / colorful : 0.5,
    avgSaturation: satCount > 0 ? totalSat / satCount : 0.3,
  }
}

export function bgLuminance(bg: string | null): number {
  const rgb = bg ? parseColor(bg) : null
  return rgb ? luminance(rgb) : 1.0
}

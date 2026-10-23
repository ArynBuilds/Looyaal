// Small color helpers shared by the extractor.

export interface RGB { r: number; g: number; b: number }

// Other named colors are mostly framework/utility noise, so they are ignored.
const NAMED: Record<string, RGB> = {
  black: { r: 0, g: 0, b: 0 }, white: { r: 255, g: 255, b: 255 },
}

/** Parse #rgb, #rrggbb, #rrggbbaa, rgb()/rgba() (comma or space syntax) and black/white. */
export function parseColor(input: string): RGB | null {
  const c = input.trim().toLowerCase()
  if (c.startsWith('#')) {
    let hex = c.slice(1)
    if (hex.length === 3 || hex.length === 4) hex = hex.slice(0, 3).split('').map(h => h + h).join('')
    if (hex.length === 8) hex = hex.slice(0, 6)
    if (!/^[0-9a-f]{6}$/.test(hex)) return null
    return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }
  }
  const m = c.match(/^rgba?\(\s*(\d{1,3})[\s,]+(\d{1,3})[\s,]+(\d{1,3})\s*(?:[,/]\s*([\d.]+%?))?\s*\)$/)
  if (m) {
    if (m[4] !== undefined && parseFloat(m[4]) === 0) return null // fully transparent
    return { r: Math.min(+m[1], 255), g: Math.min(+m[2], 255), b: Math.min(+m[3], 255) }
  }
  return NAMED[c] ?? null
}

export function toRgbString({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`
}

export function toHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
}

/** HSL with s and l in 0..1 and h in degrees. */
export function toHsl({ r, g, b }: RGB): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (d > 0) {
    if (max === rn) h = ((gn - bn) / d) % 6
    else if (max === gn) h = (bn - rn) / d + 2
    else h = (rn - gn) / d + 4
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }
  return { h, s, l }
}

export function luminance({ r, g, b }: RGB): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** Normalize any supported CSS color to lowercase 6-digit hex. */
export function normalizeColorToHex(color: string | null | undefined): string | null {
  if (!color) return null
  const rgb = parseColor(color)
  return rgb ? toHex(rgb) : null
}

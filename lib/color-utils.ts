// lib/color-utils.ts

export interface HSL {
  h: number  // 0-360
  s: number  // 0-100
  l: number  // 0-100
}

export interface ColorPalette {
  primary: string
  primaryLight: string
  primaryDark: string
  // Background style levels
  bgNeutralDark: string
  bgNeutralLight: string
  bgTintedDark: string
  bgTintedLight: string
  bgDeepDark: string
  bgDeepLight: string
  bgVibrantDark: string
  bgVibrantLight: string
  // Legacy (used as mid/surface offsets)
  bgDark: string
  bgDarkMid: string
  bgDarkSurface: string
  bgLight: string
  bgLightMid: string
  bgLightSurface: string
  surface: string
  surfaceLight: string
  cardBg: string
  cardBgStrong: string
  border: string
  borderStrong: string
  glow: string
  glowStrong: string
  shadow: string
  textOnDark: string
  heroDark: string
  heroMid: string
  stampFill: string
  stampBorder: string
  progressTrack: string
  subtleText: string
  h: number
  s: number
  l: number
}

export function hexToHSL(hex: string): HSL {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100
  l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

export function generatePalette(hex: string): ColorPalette {
  const { h, s, l } = hexToHSL(hex)
  return {
    primary: `hsl(${h},${s}%,${l}%)`,
    primaryLight: `hsl(${h},${s}%,${Math.min(l + 15, 90)}%)`,
    primaryDark: `hsl(${h},${s}%,${Math.max(l - 15, 10)}%)`,
    // Background levels per style (neutral / tinted / deep / vibrant)
    bgNeutralDark: `hsl(${h},3%,6%)`,
    bgNeutralLight: `hsl(${h},5%,97%)`,
    bgTintedDark: `hsl(${h},${Math.min(Math.max(s - 35, 5), 10)}%,7%)`,
    bgTintedLight: `hsl(${h},${Math.min(Math.max(s - 30, 8), 15)}%,96%)`,
    bgDeepDark: `hsl(${h},${Math.min(Math.max(s - 20, 15), 30)}%,10%)`,
    bgDeepLight: `hsl(${h},${Math.min(Math.max(s - 15, 15), 30)}%,93%)`,
    bgVibrantDark: `hsl(${h},${Math.min(Math.max(s - 10, 30), 50)}%,13%)`,
    bgVibrantLight: `hsl(${h},${Math.min(Math.max(s - 10, 25), 40)}%,91%)`,
    // Mid/surface derived (offset from bg)
    bgDark: `hsl(${h},${Math.min(Math.max(s - 35, 3), 8)}%,6%)`,
    bgDarkMid: `hsl(${h},${Math.min(Math.max(s - 35, 3), 7)}%,10%)`,
    bgDarkSurface: `hsl(${h},${Math.min(Math.max(s - 35, 2), 6)}%,13%)`,
    bgLight: `hsl(${h},${Math.min(Math.max(s - 30, 5), 12)}%,97%)`,
    bgLightMid: `hsl(${h},${Math.min(Math.max(s - 30, 4), 10)}%,94%)`,
    bgLightSurface: `hsl(${h},${Math.min(Math.max(s - 35, 3), 8)}%,100%)`,
    surface: `hsl(${h},${Math.max(s - 30, 5)}%,8%)`,
    surfaceLight: `hsl(${h},${Math.max(s - 30, 5)}%,96%)`,
    cardBg: `hsla(${h},${s}%,${l}%,0.06)`,
    cardBgStrong: `hsla(${h},${s}%,${l}%,0.12)`,
    border: `hsla(${h},${s}%,${l}%,0.15)`,
    borderStrong: `hsla(${h},${s}%,${l}%,0.35)`,
    glow: `hsla(${h},${s}%,${l}%,0.06)`,
    glowStrong: `hsla(${h},${s}%,${l}%,0.12)`,
    shadow: `hsla(${h},${s}%,${Math.max(l - 20, 5)}%,0.2)`,
    textOnDark: `hsl(${h},${Math.min(s + 10, 100)}%,${Math.min(l + 25, 85)}%)`,
    heroDark: `hsl(${h},${Math.max(s - 20, 10)}%,${Math.max(l - 30, 3)}%)`,
    heroMid: `hsl(${h},${Math.max(s - 25, 5)}%,${Math.max(l - 35, 2)}%)`,
    stampFill: `hsla(${h},${s}%,${l}%,0.08)`,
    stampBorder: `hsla(${h},${s}%,${l}%,0.27)`,
    progressTrack: `hsla(${h},${s}%,${l}%,0.08)`,
    subtleText: `hsla(${h},${s}%,${l}%,0.5)`,
    h, s, l,
  }
}

export function luminance(hex: string): number {
  const rgb = [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].map((v) => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = luminance(hex1)
  const l2 = luminance(hex2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

export function validateColor(hex: string, isDark: boolean): string {
  // Use approximate brand-tinted bg for contrast check (hue doesn't affect luminance much at L=6%)
  const bg = isDark ? '#101010' : '#f8f8f7'
  const ratio = contrastRatio(hex, bg)
  if (ratio < 3) {
    const { h, s, l } = hexToHSL(hex)
    const newL = isDark ? Math.max(l, 45) : Math.min(l, 40)
    return hslToHex(h, s, newL)
  }
  return hex
}

export type BgStyle = 'neutral' | 'tinted' | 'deep' | 'vibrant'

export function getBgForStyle(palette: ColorPalette, style: BgStyle, isDark: boolean): { bg: string; bgMid: string; bgSurface: string } {
  const { h, s } = palette
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max)

  if (style === 'neutral') {
    return isDark
      ? { bg: palette.bgNeutralDark, bgMid: `hsl(${h},3%,9%)`, bgSurface: `hsl(${h},2%,12%)` }
      : { bg: palette.bgNeutralLight, bgMid: `hsl(${h},4%,94%)`, bgSurface: `hsl(${h},3%,100%)` }
  }
  if (style === 'tinted') {
    const ds = clamp(s - 35, 5, 12)
    return isDark
      ? { bg: palette.bgTintedDark, bgMid: `hsl(${h},${ds}%,11%)`, bgSurface: `hsl(${h},${ds - 2}%,14%)` }
      : { bg: palette.bgTintedLight, bgMid: `hsl(${h},${ds}%,93%)`, bgSurface: `hsl(${h},${ds - 2}%,100%)` }
  }
  if (style === 'vibrant') {
    const ds = clamp(s - 10, 30, 50)
    return isDark
      ? { bg: palette.bgVibrantDark, bgMid: `hsl(${h},${ds - 5}%,17%)`, bgSurface: `hsl(${h},${ds - 10}%,20%)` }
      : { bg: palette.bgVibrantLight, bgMid: `hsl(${h},${ds - 5}%,88%)`, bgSurface: `hsl(${h},${ds - 10}%,95%)` }
  }
  // deep (default)
  const ds = clamp(s - 20, 15, 30)
  return isDark
    ? { bg: palette.bgDeepDark, bgMid: `hsl(${h},${ds - 3}%,14%)`, bgSurface: `hsl(${h},${ds - 6}%,17%)` }
    : { bg: palette.bgDeepLight, bgMid: `hsl(${h},${ds - 3}%,90%)`, bgSurface: `hsl(${h},${ds - 6}%,96%)` }
}

export type ColorTemperature = 'warm' | 'cool' | 'earth'

export function detectColorTemperature(hex: string): ColorTemperature {
  const { h } = hexToHSL(hex)
  if ((h >= 0 && h <= 60) || h >= 330) return 'warm'
  if (h >= 210 && h <= 300) return 'cool'
  return 'earth'
}

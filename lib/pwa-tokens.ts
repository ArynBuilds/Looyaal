// lib/pwa-tokens.ts — Token system for PWA v2
// Takes questionnaire answers → generates ~35 CSS variables

import { hexToHSL, hslToHex } from './color-utils'

// === Config interface (matches questionnaire answers) ===

export interface PwaConfig {
  shop_style: 'premium' | 'craft' | 'cozy' | 'modern'
  color_mode: 'dark' | 'light'  // auto-detected from phone system setting
  shape: 'round' | 'smooth'
  brand_color: string
  logo_url: string | null
  banner_url: string | null
  stamp_feel: 'realistic' | 'minimal' | 'playful'
  has_product_photos: boolean
  font_personality: 'traditional' | 'clean' | 'bold'
  density: 'balanced' | 'packed'
  language: 'tr' | 'en' | 'ar'
  layout: 'tabs' | 'single-page'

  // Layout hints from extraction (optional)
  _layout_hints?: {
    dominant: string
    stacked: number
    grid: number
    overlay: number
    thumbnails: number
    hero: number
    mosaic: number
    textOnly: number
    denseList: number
  }

  // Variant selections (set by mapper or editor)
  variant_stamp?: string
  variant_activity?: string
  variant_header?: string
  variant_menu?: string
  variant_campaign?: string
  variant_sana_ozel?: string
  variant_profile?: string
  variant_nav?: string
  variant_challenge?: string
}

export const DEFAULT_CONFIG: PwaConfig = {
  shop_style: 'premium',
  color_mode: 'dark',
  shape: 'round',
  brand_color: '#d97706',
  logo_url: null,
  banner_url: null,
  stamp_feel: 'minimal',
  has_product_photos: false,
  font_personality: 'clean',
  density: 'balanced',
  language: 'tr',
  layout: 'tabs',
}

// === Token generation ===

export function generateTokens(config: PwaConfig): Record<string, string> {
  const isDark = config.color_mode === 'dark'
  const { h, s, l } = hexToHSL(config.brand_color)

  // Brand palette derived from single hex
  const brandLight = hslToHex(h, Math.min(s + 10, 100), Math.min(l + 15, 85))
  const brandDark = hslToHex(h, s, Math.max(l - 15, 15))
  const brandMuted = hslToHex(h, Math.max(s - 30, 10), isDark ? 20 : 90)
  const brandGlow = isDark
    ? `hsla(${h}, ${s}%, ${l}%, 0.15)`
    : `hsla(${h}, ${s}%, ${l}%, 0.08)`
  const brandGlowStrong = isDark
    ? `hsla(${h}, ${s}%, ${l}%, 0.3)`
    : `hsla(${h}, ${s}%, ${l}%, 0.15)`

  // === COLORS ===
  const colors = isDark ? {
    '--color-bg': `hsl(${h}, ${Math.min(s, 8)}%, 10%)`,
    '--color-bg-mid': `hsl(${h}, ${Math.min(s, 6)}%, 12%)`,
    '--color-bg-surface': `hsl(${h}, ${Math.min(s, 5)}%, 15%)`,
    '--color-card': `hsl(${h}, ${Math.min(s, 5)}%, 14%)`,
    '--color-card-hover': `hsl(${h}, ${Math.min(s, 5)}%, 16%)`,
    '--color-card-border': `hsl(${h}, ${Math.min(s, 5)}%, 20%)`,
    '--color-text': '#FAFAFA',
    '--color-text-secondary': '#999999',
    '--color-text-muted': '#888888',
    '--color-text-faint': '#666666',
    '--color-divider': `hsl(${h}, ${Math.min(s, 5)}%, 18%)`,
    '--color-shadow': 'rgba(0,0,0,0.4)',
    '--color-nav-bg': `hsla(${h}, ${Math.min(s, 8)}%, 10%, 0.85)`,
    '--color-nav-border': `hsl(${h}, ${Math.min(s, 5)}%, 18%)`,
    '--color-stamp-empty': `hsl(${h}, ${Math.min(s, 5)}%, 20%)`,
    '--color-stamp-border': `hsl(${h}, ${Math.min(s, 5)}%, 20%)`,
  } : {
    '--color-bg': `hsl(${h}, ${Math.min(s, 8)}%, 94%)`,
    '--color-bg-mid': `hsl(${h}, ${Math.min(s, 6)}%, 92%)`,
    '--color-bg-surface': `hsl(${h}, ${Math.min(s, 5)}%, 98%)`,
    '--color-card': '#ffffff',
    '--color-card-hover': '#ffffff',
    '--color-card-border': 'rgba(0,0,0,0.1)',
    '--color-text': '#111827',
    '--color-text-secondary': '#4b5563',
    '--color-text-muted': '#6b7280',
    '--color-text-faint': '#9ca3af',
    '--color-divider': '#e5e7eb',
    '--color-shadow': 'rgba(0,0,0,0.1)',
    '--color-nav-bg': 'rgba(255,255,255,0.95)',
    '--color-nav-border': '#d1d5db',
    '--color-stamp-empty': '#e5e7eb',
    '--color-stamp-border': '#d1d5db',
  }

  // === SPACING (density) ===
  // In cqw for proportional scaling (390px base → 1cqw = 3.9px)
  const spacingScales = {
    spacious: { xs: 1, sm: 2.1, md: 3.1, lg: 4.1, xl: 6.2, '2xl': 8.2, '3xl': 12.3 }, // maps to balanced
    balanced: { xs: 1, sm: 2.1, md: 3.1, lg: 4.1, xl: 6.2, '2xl': 8.2, '3xl': 12.3 },
    packed: { xs: 0.8, sm: 1.5, md: 2.1, lg: 3.1, xl: 4.1, '2xl': 6.2, '3xl': 9.2 },
  }
  const sp = spacingScales[config.density]

  // === RADIUS (shape) ===
  // Radius in cqw — no sharp option, minimum 8px equivalent
  const radiusScales = {
    round: { sm: 2.6, md: 4.1, lg: 6.2, card: 5.1, button: 3.6, stamp: '50%', input: 3.1 },
    smooth: { sm: 1.5, md: 2.6, lg: 4.1, card: 3.1, button: 2.1, stamp: '30%', input: 2.1 },
  }
  const rd = radiusScales[config.shape]

  // === TYPOGRAPHY (font_personality) ===
  // Sizes in cqw (container query width) for proportional scaling
  // Base: 390px phone → 1cqw = 3.9px → 14px ≈ 3.6cqw
  const fontScales = {
    traditional: {
      heading: '"Playfair Display", serif',
      body: 'Inter, sans-serif',
      weightHeading: '700',
      weightBody: '400',
      sizeHero: '7.2cqw',
      sizeH1: '5.6cqw',
      sizeH2: '4.1cqw',
      sizeBody: '3.6cqw',
      sizeLabel: '3.1cqw',
      sizeTiny: '2.8cqw',
      tracking: '0em',
      trackingLabel: '0.05em',
    },
    clean: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      weightHeading: '600',
      weightBody: '400',
      sizeHero: '6.2cqw',
      sizeH1: '5.1cqw',
      sizeH2: '3.8cqw',
      sizeBody: '3.6cqw',
      sizeLabel: '3.1cqw',
      sizeTiny: '2.8cqw',
      tracking: '-0.01em',
      trackingLabel: '0.04em',
    },
    bold: {
      heading: 'Inter, sans-serif',
      body: 'Inter, sans-serif',
      weightHeading: '900',
      weightBody: '400',
      sizeHero: '9.2cqw',
      sizeH1: '6.2cqw',
      sizeH2: '4.4cqw',
      sizeBody: '3.6cqw',
      sizeLabel: '3.1cqw',
      sizeTiny: '2.8cqw',
      tracking: '-0.03em',
      trackingLabel: '0.08em',
    },
  }
  const ft = fontScales[config.font_personality]

  // === EFFECTS (shop_style) ===
  const effectScales = {
    premium: {
      cardShadow: isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
      navBlur: 'blur(20px)',
      transition: '250ms ease',
      transitionFast: '150ms ease',
    },
    craft: {
      cardShadow: isDark ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 10px rgba(0,0,0,0.06)',
      navBlur: 'blur(12px)',
      transition: '300ms ease',
      transitionFast: '180ms ease',
    },
    cozy: {
      cardShadow: isDark ? `0 2px 16px ${brandGlow}` : `0 2px 12px ${brandGlow}`,
      navBlur: 'blur(16px)',
      transition: '350ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      transitionFast: '200ms ease',
    },
    modern: {
      cardShadow: 'none',
      navBlur: 'blur(24px)',
      transition: '150ms ease',
      transitionFast: '100ms ease',
    },
  }
  const fx = effectScales[config.shop_style]

  return {
    // Brand
    '--color-brand': config.brand_color,
    '--color-brand-light': brandLight,
    '--color-brand-dark': brandDark,
    '--color-brand-muted': brandMuted,
    '--color-brand-glow': brandGlow,
    '--color-brand-glow-strong': brandGlowStrong,
    '--color-danger': '#ef4444',
    '--color-success': '#22c55e',

    // Mode colors
    ...colors,

    // Spacing (cqw — scales with container width)
    '--space-xs': `${sp.xs}cqw`,
    '--space-sm': `${sp.sm}cqw`,
    '--space-md': `${sp.md}cqw`,
    '--space-lg': `${sp.lg}cqw`,
    '--space-xl': `${sp.xl}cqw`,
    '--space-2xl': `${sp['2xl']}cqw`,
    '--space-3xl': `${sp['3xl']}cqw`,

    // Radius (cqw — scales with container width)
    '--radius-sm': `${rd.sm}cqw`,
    '--radius-md': `${rd.md}cqw`,
    '--radius-lg': `${rd.lg}cqw`,
    '--radius-card': `${rd.card}cqw`,
    '--radius-button': `${rd.button}cqw`,
    '--radius-stamp': rd.stamp,
    '--radius-input': `${rd.input}cqw`,
    '--radius-full': '9999px', // pill shape — fixed value, never scales (radius > height/2 is what makes a true pill)

    // Typography
    '--font-heading': ft.heading,
    '--font-body': ft.body,
    '--font-weight-heading': ft.weightHeading,
    '--font-weight-body': ft.weightBody,
    '--font-size-hero': ft.sizeHero,
    '--font-size-h1': ft.sizeH1,
    '--font-size-h2': ft.sizeH2,
    '--font-size-body': ft.sizeBody,
    '--font-size-label': ft.sizeLabel,
    '--font-size-tiny': ft.sizeTiny,
    '--letter-spacing': ft.tracking,
    '--letter-spacing-label': ft.trackingLabel,

    // Effects
    '--shadow-card': fx.cardShadow,
    '--nav-blur': fx.navBlur,
    '--transition': fx.transition,
    '--transition-fast': fx.transitionFast,

    // Common element sizes (cqw — proportional)
    '--size-icon-sm': '4.1cqw',    // ~16px on 390px
    '--size-icon-md': '5.6cqw',    // ~22px on 390px
    '--size-icon-lg': '7.2cqw',    // ~28px on 390px
    '--size-avatar-sm': '10.3cqw', // ~40px on 390px
    '--size-avatar-md': '13.3cqw', // ~52px on 390px
    '--size-avatar-lg': '18cqw',   // ~70px on 390px
    '--size-stamp': '7.2cqw',      // ~28px on 390px
    '--size-nav-height': '14.4cqw', // ~56px on 390px

    // Aspect ratios per component (width:height)
    ...(config.density === 'packed' ? {
      '--ar-header-photo': '2.2 / 1',
      '--ar-header-text': '3 / 1',
      '--ar-stamp-card': 'auto',
      '--ar-campaign-card': '3.5 / 1',
      '--ar-campaign-featured': '2.5 / 1',
      '--ar-menu-image': '2.5 / 1',
      '--ar-profile-avatar-card': 'auto',
      '--ar-stat-card': '1.8 / 1',
    } : {
      '--ar-header-photo': '1.8 / 1',
      '--ar-header-text': '2.5 / 1',
      '--ar-stamp-card': 'auto',
      '--ar-campaign-card': '3 / 1',
      '--ar-campaign-featured': '2 / 1',
      '--ar-menu-image': '2 / 1',
      '--ar-profile-avatar-card': 'auto',
      '--ar-stat-card': '1.5 / 1',
    }),
  }
}

// === Utility: get all config option values (for preview controls) ===

export const CONFIG_OPTIONS = {
  shop_style: ['premium', 'craft', 'cozy', 'modern'] as const,
  color_mode: ['dark', 'light'] as const,
  shape: ['round', 'smooth'] as const,
  stamp_feel: ['realistic', 'minimal', 'playful'] as const,
  font_personality: ['traditional', 'clean', 'bold'] as const,
  density: ['balanced', 'packed'] as const,
  language: ['tr', 'en', 'ar'] as const,
}

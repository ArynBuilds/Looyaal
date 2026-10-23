'use client'
// LOCKED — Minimal theme provider shim for onboarding screens.
// Onboarding files import useTheme() from here. This fetches basic org info
// (name, logo, color) needed for onboarding branding. Independent of PWA v2 tokens.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export interface ThemeConfig {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  isDark: boolean
  radius: string
  border_width: string
  stamp_shape: string
  bar_style: string
  mood: string
  structure: string
  nav_type: string
  type_scale: string
  focal_point: string
  name_case: string
  palette: {
    primary: string
    primaryLight: string
    primaryDark: string
    cardBg: string
    border: string
    borderStrong: string
    glow: string
    glowStrong: string
    stampFill: string
    stampBorder: string
    progressTrack: string
    subtleText: string
    shadow: string
    textOnDark: string
    [key: string]: string | number
  }
  [key: string]: unknown
}

const ThemeContext = createContext<ThemeConfig | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}

export function ThemeProvider({ orgSlug, children }: { orgSlug: string; children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig | null>(null)

  useEffect(() => {
    fetch(`/api/public/${orgSlug}/theme`)
      .then(r => r.json())
      .then(data => {
        if (data.error) return
        const brandColor = data.primary_color || data.config?.brand_color || '#d97706'
        setTheme({
          id: data.id || '',
          name: data.name || '',
          slug: data.slug || orgSlug,
          logo_url: data.logo_url || null,
          primary_color: brandColor,
          isDark: data.config?.color_mode !== 'light',
          radius: '16px',
          border_width: '1',
          stamp_shape: data.config?.stamp_feel === 'playful' ? 'rounded-full' : 'rounded-lg',
          bar_style: 'gradient',
          mood: data.config?.shop_style || 'premium',
          structure: 'card-stack',
          nav_type: 'bottom-bar',
          type_scale: data.config?.font_personality || 'clean',
          focal_point: 'progress-ring',
          name_case: 'none',
          palette: {
            primary: brandColor,
            primaryLight: data.tokens?.['--color-brand-light'] || '#fbbf24',
            primaryDark: data.tokens?.['--color-brand-dark'] || '#92400e',
            cardBg: data.tokens?.['--color-card'] || 'rgba(255,255,255,0.06)',
            border: data.tokens?.['--color-card-border'] || 'rgba(255,255,255,0.08)',
            borderStrong: data.tokens?.['--color-card-border'] || 'rgba(255,255,255,0.12)',
            glow: data.tokens?.['--color-brand-glow'] || 'rgba(217,119,6,0.15)',
            glowStrong: data.tokens?.['--color-brand-glow-strong'] || 'rgba(217,119,6,0.3)',
            stampFill: data.tokens?.['--color-stamp-empty'] || 'rgba(255,255,255,0.06)',
            stampBorder: data.tokens?.['--color-stamp-border'] || 'rgba(255,255,255,0.08)',
            progressTrack: data.tokens?.['--color-stamp-empty'] || 'rgba(255,255,255,0.06)',
            subtleText: data.tokens?.['--color-text-muted'] || 'rgba(255,255,255,0.35)',
            shadow: data.tokens?.['--color-shadow'] || 'rgba(0,0,0,0.4)',
            textOnDark: '#ffffff',
          },
        })
      })
  }, [orgSlug])

  if (!theme) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#0f0f0f' }}>
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

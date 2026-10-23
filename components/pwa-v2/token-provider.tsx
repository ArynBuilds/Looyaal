'use client'

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { generateTokens, type PwaConfig, DEFAULT_CONFIG } from '@/lib/pwa-tokens'

interface TokenContextValue {
  config: PwaConfig
  tokens: Record<string, string>
  isDark: boolean
}

const TokenContext = createContext<TokenContextValue | null>(null)

export function useTokens() {
  const ctx = useContext(TokenContext)
  if (!ctx) throw new Error('useTokens must be inside TokenProvider')
  return ctx
}

export function useConfig() {
  return useTokens().config
}

export function useIsDark() {
  return useTokens().isDark
}

interface TokenProviderProps {
  config: PwaConfig
  children: ReactNode
}

// Detect system dark/light preference
function useSystemColorMode(): 'dark' | 'light' {
  const [mode, setMode] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    setMode(mq.matches ? 'dark' : 'light')

    const handler = (e: MediaQueryListEvent) => setMode(e.matches ? 'dark' : 'light')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  return mode
}

export function TokenProvider({ config: inputConfig, children }: TokenProviderProps) {
  const systemMode = useSystemColorMode()

  // Override color_mode with system preference
  const config = useMemo(() => ({
    ...inputConfig,
    color_mode: systemMode,
  }), [inputConfig, systemMode])

  const tokens = useMemo(() => generateTokens(config), [config])
  const isDark = config.color_mode === 'dark'

  // Apply tokens as CSS vars to document root + body bg for safe areas
  useEffect(() => {
    const root = document.documentElement
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value)
    }
    // Set body + html background to match app — prevents white flash in safe areas + overscroll
    const bg = tokens['--color-bg'] || '#09090b'
    document.body.style.background = bg
    root.style.background = bg
    // Set theme-color meta for status bar
    let meta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    meta.content = bg

    return () => {
      for (const key of Object.keys(tokens)) {
        root.style.removeProperty(key)
      }
      document.body.style.background = ''
      root.style.background = ''
    }
  }, [tokens])

  return (
    <TokenContext.Provider value={{ config, tokens, isDark }}>
      {children}
    </TokenContext.Provider>
  )
}

// Inline provider for previews — applies tokens to a scoped div instead of document root
// Does NOT detect system color mode — uses config as-is (for preview control)
export function ScopedTokenProvider({ config, children, className, style }: TokenProviderProps & { className?: string; style?: React.CSSProperties }) {
  const tokens = useMemo(() => generateTokens(config), [config])
  const isDark = config.color_mode === 'dark'

  const cssVarStyle = useMemo(() => {
    const vars: Record<string, string> = {}
    for (const [key, value] of Object.entries(tokens)) {
      vars[key] = value
    }
    return { ...vars, ...style }
  }, [tokens, style])

  return (
    <TokenContext.Provider value={{ config, tokens, isDark }}>
      <div className={className} style={{ containerType: 'inline-size', ...cssVarStyle }}>
        {children}
      </div>
    </TokenContext.Provider>
  )
}

export { DEFAULT_CONFIG }

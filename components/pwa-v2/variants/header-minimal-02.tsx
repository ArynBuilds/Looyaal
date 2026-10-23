'use client'

// Header Minimal 02 — Name left-aligned with brand dot indicator, ultra-clean

import type { HeaderProps } from './header-types'

export function HeaderMinimal02({ shopName, city }: HeaderProps) {
  return (
    <div style={{
      padding: `calc(var(--space-2xl) + env(safe-area-inset-top, 0px)) var(--space-xl) var(--space-lg)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: 'var(--color-brand)',
        }} />
        <p style={{
          fontSize: 'var(--font-size-tiny)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
        }}>{city}</p>
      </div>
      <p style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 'var(--font-weight-heading)',
        fontSize: 'var(--font-size-hero)',
        color: 'var(--color-text)',
        letterSpacing: 'var(--letter-spacing)',
        lineHeight: 1.1,
      }}>{shopName}</p>
    </div>
  )
}

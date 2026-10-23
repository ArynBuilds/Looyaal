'use client'

// Header Logo 01 — Logo + name + city in a row, clean and compact

import type { HeaderProps } from './header-types'

export function HeaderLogo01({ shopName, logoUrl, city }: HeaderProps) {
  return (
    <div style={{
      padding: `calc(var(--space-2xl) + env(safe-area-inset-top, 0px)) var(--space-xl) var(--space-2xl)`,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)',
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 'var(--radius-card)',
        background: logoUrl ? 'transparent' : 'var(--color-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {logoUrl ? (
          <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /></svg>
        )}
      </div>
      <div>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'var(--font-size-h1)',
          color: 'var(--color-text)',
          letterSpacing: 'var(--letter-spacing)',
        }}>{shopName}</p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 2 }}>{city}</p>
      </div>
    </div>
  )
}

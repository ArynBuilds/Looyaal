'use client'

// Header Logo 02 — Large centered logo, name below, generous whitespace

import type { HeaderProps } from './header-types'

export function HeaderLogo02({ shopName, logoUrl, city }: HeaderProps) {
  return (
    <div style={{
      padding: `calc(var(--space-3xl) + env(safe-area-inset-top, 0px)) var(--space-xl) var(--space-xl)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 'var(--radius-card)',
        background: logoUrl ? 'transparent' : 'var(--color-brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        marginBottom: 'var(--space-lg)',
      }}>
        {logoUrl ? (
          <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /></svg>
        )}
      </div>
      <p style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 'var(--font-weight-heading)',
        fontSize: 'var(--font-size-hero)',
        color: 'var(--color-text)',
        letterSpacing: 'var(--letter-spacing)',
      }}>{shopName}</p>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>{city}</p>
    </div>
  )
}

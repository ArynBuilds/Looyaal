'use client'

// Header Logo 03 — Logo in brand-colored pill, name beside it, subtle brand underline

import type { HeaderProps } from './header-types'

export function HeaderLogo03({ shopName, logoUrl, city }: HeaderProps) {
  return (
    <div style={{ padding: `calc(var(--space-2xl) + env(safe-area-inset-top, 0px)) var(--space-xl) var(--space-lg)` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-stamp)',
          background: logoUrl ? 'transparent' : `linear-gradient(135deg, var(--color-brand), var(--color-brand-light))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          boxShadow: '0 2px 10px var(--color-brand-glow-strong)',
        }}>
          {logoUrl ? (
            <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /></svg>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-h2)',
            color: 'var(--color-text)',
            letterSpacing: 'var(--letter-spacing)',
          }}>{shopName}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 2 }}>{city}</p>
        </div>
      </div>
      {/* Brand accent underline */}
      <div style={{
        marginTop: 'var(--space-lg)',
        height: 2,
        background: `linear-gradient(90deg, var(--color-brand), transparent)`,
        borderRadius: 1,
      }} />
    </div>
  )
}

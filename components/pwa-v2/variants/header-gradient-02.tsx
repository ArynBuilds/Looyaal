'use client'

// Header Gradient 02 — Card-style header with brand gradient border top, logo left

import type { HeaderProps } from './header-types'

export function HeaderGradient02({ shopName, logoUrl, city }: HeaderProps) {
  return (
    <div style={{ padding: `calc(var(--space-lg) + env(safe-area-inset-top, 0px)) var(--space-xl) var(--space-lg)` }}>
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Brand gradient strip at top */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light), var(--color-brand))`,
        }} />

        {/* Content */}
        <div style={{
          padding: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-sm)',
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
          {/* Open indicator */}
          <div style={{
            padding: `var(--space-xs) var(--space-sm)`,
            borderRadius: 'var(--radius-button)',
            background: 'var(--color-brand-glow)',
            border: '1px solid var(--color-brand)',
          }}>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', fontWeight: 600 }}>Acik</p>
          </div>
        </div>
      </div>
    </div>
  )
}

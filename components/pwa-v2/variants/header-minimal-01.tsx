'use client'

// Header Minimal 01 — If no logo: monogram initial. If logo: logo as visual anchor.

import type { HeaderProps } from './header-types'

export function HeaderMinimal01({ shopName, logoUrl, city }: HeaderProps) {
  const initial = shopName.charAt(0).toUpperCase()

  return (
    <div style={{
      padding: `calc(var(--space-3xl) + env(safe-area-inset-top, 0px)) var(--space-xl) var(--space-xl)`,
      display: 'flex',
      alignItems: 'flex-end',
      gap: 'var(--space-md)',
    }}>
      {/* Visual anchor: logo or monogram */}
      {logoUrl ? (
        <img src={logoUrl} alt="" style={{
          width: 56,
          height: 56,
          borderRadius: 'var(--radius-sm)',
          objectFit: 'cover',
          opacity: 0.9,
        }} />
      ) : (
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'calc(var(--font-size-hero) * 2.5)',
          color: 'var(--color-brand)',
          lineHeight: 0.85,
          letterSpacing: 'var(--letter-spacing)',
          opacity: 0.9,
        }}>{initial}</p>
      )}

      {/* Name + city */}
      <div style={{ paddingBottom: 'var(--space-xs)' }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'var(--font-size-h1)',
          color: 'var(--color-text)',
          letterSpacing: 'var(--letter-spacing)',
          lineHeight: 1.1,
        }}>{shopName}</p>
        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-faint)',
          marginTop: 'var(--space-xs)',
        }}>{city}</p>
      </div>
    </div>
  )
}

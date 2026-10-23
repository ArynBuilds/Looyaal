'use client'

// Header Gradient 01 — Full brand gradient background, white text centered

import type { HeaderProps } from './header-types'

export function HeaderGradient01({ shopName, logoUrl, city }: HeaderProps) {
  return (
    <div style={{
      aspectRatio: 'var(--ar-header-photo)',
      background: `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand), var(--color-brand-light))`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-2xl)',
      textAlign: 'center',
    }}>
      {logoUrl && (
        <img src={logoUrl} alt="" style={{
          width: 52,
          height: 52,
          borderRadius: 'var(--radius-card)',
          objectFit: 'cover',
          marginBottom: 'var(--space-md)',
        }} />
      )}
      <p style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 'var(--font-weight-heading)',
        fontSize: 'var(--font-size-hero)',
        color: 'white',
        letterSpacing: 'var(--letter-spacing)',
        textShadow: '0 2px 8px rgba(0,0,0,0.2)',
      }}>{shopName}</p>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'rgba(255,255,255,0.6)',
        marginTop: 'var(--space-xs)',
      }}>{city}</p>
    </div>
  )
}

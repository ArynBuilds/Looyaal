'use client'

// Header Photo 02 — Banner with centered text overlay, logo above name

import type { HeaderProps } from './header-types'

export function HeaderPhoto02({ shopName, logoUrl, bannerUrl, city }: HeaderProps) {
  return (
    <div style={{
      position: 'relative',
      aspectRatio: 'var(--ar-header-photo)',
      background: bannerUrl
        ? `url(${bannerUrl}) center/cover no-repeat`
        : 'var(--color-brand)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
      }} />

      {/* Centered content */}
      <div style={{ position: 'relative', textAlign: 'center', padding: 'var(--space-xl)' }}>
        {logoUrl && (
          <img src={logoUrl} alt="" style={{
            width: 56,
            height: 56,
            borderRadius: 'var(--radius-card)',
            objectFit: 'cover',
            margin: '0 auto',
            marginBottom: 'var(--space-md)',
          }} />
        )}
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'var(--font-size-hero)',
          color: 'white',
          letterSpacing: 'var(--letter-spacing)',
        }}>{shopName}</p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.5)', marginTop: 'var(--space-xs)' }}>{city}</p>
      </div>
    </div>
  )
}

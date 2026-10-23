'use client'

// Header Photo 01 — Full-bleed banner with gradient overlay, logo + name at bottom

import type { HeaderProps } from './header-types'

export function HeaderPhoto01({ shopName, logoUrl, bannerUrl, city }: HeaderProps) {
  return (
    <div style={{
      position: 'relative',
      aspectRatio: 'var(--ar-header-photo)',
      background: bannerUrl
        ? `url(${bannerUrl}) center/cover no-repeat`
        : 'var(--color-brand)',
      display: 'flex',
      alignItems: 'flex-end',
    }}>
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        padding: 'var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-md)',
        width: '100%',
      }}>
        {logoUrl && (
          <img src={logoUrl} alt="" style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
          }} />
        )}
        <div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-h1)',
            color: 'white',
            letterSpacing: 'var(--letter-spacing)',
          }}>{shopName}</p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{city}</p>
        </div>
      </div>
    </div>
  )
}

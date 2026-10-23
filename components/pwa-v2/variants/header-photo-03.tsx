'use client'

// Header Photo 03 — Split: left text on solid bg, right half is photo

import type { HeaderProps } from './header-types'

export function HeaderPhoto03({ shopName, logoUrl, bannerUrl, city }: HeaderProps) {
  return (
    <div style={{
      display: 'flex',
      aspectRatio: 'var(--ar-header-photo)',
      overflow: 'hidden',
      borderRadius: `0 0 var(--radius-card) var(--radius-card)`,
    }}>
      {/* Left: text */}
      <div style={{
        flex: 1,
        background: 'var(--color-bg-surface)',
        padding: 'var(--space-xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        {logoUrl && (
          <img src={logoUrl} alt="" style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            marginBottom: 'var(--space-md)',
          }} />
        )}
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'var(--font-size-h1)',
          color: 'var(--color-text)',
          letterSpacing: 'var(--letter-spacing)',
          lineHeight: 1.2,
        }}>{shopName}</p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>{city}</p>
      </div>

      {/* Right: photo */}
      <div style={{
        width: '45%',
        background: bannerUrl
          ? `url(${bannerUrl}) center/cover no-repeat`
          : `linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))`,
      }} />
    </div>
  )
}

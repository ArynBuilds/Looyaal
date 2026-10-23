'use client'

// Header Vertical — Brand-colored bar on the left with the shop name rotated 90°. Editorial / magazine feel.

import type { HeaderProps } from './header-types'

export function HeaderVertical({ shopName, logoUrl, city }: HeaderProps) {
  return (
    <div style={{ display: 'flex', height: '34cqw', borderBottom: '1px solid var(--color-card-border)' }}>
      <div style={{ width: '14cqw', background: 'var(--color-brand)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '8cqw', letterSpacing: '0.4em', color: 'white', writingMode: 'vertical-rl', textOrientation: 'mixed', textTransform: 'uppercase', margin: 0, transform: 'rotate(180deg)' }}>{shopName}</p>
      </div>
      <div style={{ flex: 1, padding: 'var(--space-lg) var(--space-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-text-muted)', fontWeight: 700, margin: 0 }}>Issue 24</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-brand)', fontWeight: 700, margin: 0 }}>● Open</p>
        </div>
        <div>
          {logoUrl && <img src={logoUrl} alt="" style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover', marginBottom: 'var(--space-sm)' }} />}
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', color: 'var(--color-text)', fontWeight: 700, letterSpacing: '-0.02em', margin: 0, lineHeight: 1.05 }}>The neighborhood spot</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{city}</p>
        </div>
      </div>
    </div>
  )
}

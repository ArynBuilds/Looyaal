'use client'

// Header Stamp Crown — Loyalty status (filled/empty seals) shown above the shop name like a row of insignia.
// Hardcoded 6/10 stamps for the header preview — the real stamp count lives in the Kartım tab card.

import type { HeaderProps } from './header-types'

export function HeaderStampCrown({ shopName, logoUrl, city }: HeaderProps) {
  const stamps = 6
  const total = 10
  return (
    <div style={{ padding: 'var(--space-2xl) var(--space-xl) var(--space-lg)', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 'var(--space-md)' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ width: '4cqw', height: '4cqw', borderRadius: '50%', background: i < stamps ? 'radial-gradient(circle at 35% 35%, var(--color-brand-light), var(--color-brand) 70%, var(--color-brand-dark))' : 'transparent', border: i < stamps ? 'none' : '1px solid var(--color-stamp-border)', boxShadow: i < stamps ? '0 1px 2px rgba(0,0,0,0.15)' : 'none' }} />
        ))}
      </div>
      {logoUrl && <img src={logoUrl} alt="" style={{ width: 54, height: 54, borderRadius: '50%', objectFit: 'cover', margin: '0 auto var(--space-sm)', border: '3px solid var(--color-brand)' }} />}
      <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--font-size-hero)', color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>{shopName}</p>
      <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, marginTop: 6 }}>
        {city} · {stamps} of {total} earned
      </p>
    </div>
  )
}

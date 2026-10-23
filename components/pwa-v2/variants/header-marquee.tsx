'use client'

// Header Marquee — Editorial scrolling ribbon with shop name + city + status, repeated infinitely.

import type { HeaderProps } from './header-types'

export function HeaderMarquee({ shopName, logoUrl, city }: HeaderProps) {
  const text = `${shopName.toUpperCase()}  ✦  ${city.toUpperCase()}  ✦  OPEN NOW  ✦  EST. 2024  ✦  `
  return (
    <div>
      <div style={{ background: 'var(--color-text)', color: 'var(--color-bg)', padding: 'var(--space-sm) 0', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', gap: '2em', whiteSpace: 'nowrap', animation: 'marquee-scroll 18s linear infinite', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--font-size-body)', letterSpacing: '0.1em' }}>
          {Array.from({ length: 6 }).map((_, i) => (<span key={i} style={{ color: 'var(--color-bg)' }}>{text}</span>))}
        </div>
      </div>
      <div style={{ padding: 'var(--space-lg) var(--space-xl)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          {logoUrl ? <img src={logoUrl} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }} /> : null}
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--font-size-h2)', color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>{shopName}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-brand)', animation: 'marquee-pulse 1.4s ease-in-out infinite' }} />
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0 }}>Live</p>
        </div>
      </div>
      <style>{`@keyframes marquee-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} } @keyframes marquee-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }`}</style>
    </div>
  )
}

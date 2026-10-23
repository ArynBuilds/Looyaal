'use client'

// Header Liquid — SVG wave that morphs continuously, with the logo emerging at the boundary.

import type { HeaderProps } from './header-types'

export function HeaderLiquid({ shopName, logoUrl, city }: HeaderProps) {
  return (
    <div style={{ position: 'relative', height: '46cqw', overflow: 'hidden', background: 'var(--color-bg)' }}>
      <svg viewBox="0 0 400 200" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <linearGradient id="liquid-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-brand)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--color-brand)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path fill="url(#liquid-grad)">
          <animate attributeName="d" dur="9s" repeatCount="indefinite"
            values="M0,0 L400,0 L400,140 Q300,180 200,150 Q100,120 0,160 Z;
                    M0,0 L400,0 L400,150 Q320,120 200,170 Q90,200 0,140 Z;
                    M0,0 L400,0 L400,140 Q300,180 200,150 Q100,120 0,160 Z" />
        </path>
        <path fill="var(--color-brand-light)" opacity="0.5">
          <animate attributeName="d" dur="11s" repeatCount="indefinite"
            values="M0,0 L400,0 L400,100 Q280,140 180,110 Q80,80 0,120 Z;
                    M0,0 L400,0 L400,120 Q300,90 180,140 Q70,170 0,100 Z;
                    M0,0 L400,0 L400,100 Q280,140 180,110 Q80,80 0,120 Z" />
        </path>
      </svg>
      <div style={{ position: 'absolute', bottom: 'var(--space-md)', left: 0, right: 0, padding: '0 var(--space-xl)', display: 'flex', alignItems: 'flex-end', gap: 'var(--space-md)' }}>
        {logoUrl && <img src={logoUrl} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--color-bg)', boxShadow: '0 6px 16px rgba(0,0,0,0.2)', position: 'relative', top: '4cqw' }} />}
        <div style={{ paddingBottom: 4 }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 'var(--font-size-h1)', color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0 }}>{shopName}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 2 }}>{city}</p>
        </div>
      </div>
    </div>
  )
}

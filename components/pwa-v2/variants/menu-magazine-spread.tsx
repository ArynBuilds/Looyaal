'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

// Menu Magazine Spread — editorial 2-column rows. Photo + copy alternate
// sides per item. Featured items get a small "Şefin Seçimi" badge.

export function MenuMagazineSpread({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)', padding: '0 var(--space-xs)' }}>Sayı 24</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {shown.map((item, i) => {
          const photoLeft = i % 2 === 0
          const photo = (
            <div style={{ flex: 1, aspectRatio: '4 / 5', borderRadius: 'var(--radius-card)', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))` }} />
          )
          const copy = (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-xs)' }}>
              {item.category && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.22em', fontWeight: 700, margin: 0 }}>{item.category}</p>}
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: 0, lineHeight: 1.05 }}>{item.name}</p>
              {item.is_featured && (
                <span style={{ display: 'inline-flex', alignSelf: 'flex-start', padding: '3px 8px', borderRadius: 'var(--radius-sm)', background: 'var(--color-brand-glow)', color: 'var(--color-brand)', fontSize: 'var(--font-size-tiny)', fontWeight: 700, letterSpacing: '0.05em', marginTop: 4 }}>Şefin Seçimi</span>
              )}
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text-secondary)', margin: 'var(--space-xs) 0 0' }}>{item.price} {currency}</p>
            </div>
          )
          return (
            <div key={item.id} style={{ display: 'flex', gap: 'var(--space-md)' }}>
              {photoLeft ? <>{photo}{copy}</> : <>{copy}{photo}</>}
            </div>
          )
        })}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

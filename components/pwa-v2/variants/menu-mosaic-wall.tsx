'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

// Menu Mosaic Wall — asymmetric Pinterest-style grid. Featured items take a
// larger tile; rest fill 1×1. Names overlay the bottom of each tile with a
// dark gradient for legibility.

export function MenuMosaicWall({ items, currency = 'TL', previewCount = 6 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)', padding: '0 var(--space-xs)' }}>Galeri</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridAutoRows: '24cqw', gap: 'var(--space-xs)' }}>
        {shown.map((item, i) => {
          const isFeatured = item.is_featured || i === 0
          const span = isFeatured ? { gridColumn: 'span 2', gridRow: 'span 2' } : { gridColumn: 'span 1', gridRow: 'span 1' }
          return (
            <div key={item.id} style={{ ...span, position: 'relative', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))`, border: '1px solid var(--color-card-border)' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 50%)' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-sm) var(--space-md)' }}>
                <p style={{ fontSize: isFeatured ? 'var(--font-size-body)' : 'var(--font-size-label)', fontWeight: 700, color: 'white', lineHeight: 1.15, margin: 0, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>{item.name}</p>
                <p style={{ fontSize: 'var(--font-size-tiny)', color: 'rgba(255,255,255,0.85)', fontWeight: 600, margin: '2px 0 0' }}>{item.price} {currency}</p>
              </div>
            </div>
          )
        })}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuPhotoCards({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)', padding: '0 var(--space-xs)' }}>Menu</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        {shown.map(item => (
          <div key={item.id} style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--color-card)', border: '1px solid var(--color-card-border)' }}>
            <div style={{ aspectRatio: 'var(--ar-menu-image)', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!item.photoUrl && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1" opacity="0.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /></svg>}
            </div>
            <div style={{ padding: 'var(--space-sm) var(--space-md)' }}>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)', lineHeight: 1.2 }}>{item.name}</p>
              <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600, marginTop: 'var(--space-xs)' }}>{item.price} {currency}</p>
            </div>
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

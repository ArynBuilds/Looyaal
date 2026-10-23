'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuIconRows({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-md)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, padding: `var(--space-xs) var(--space-sm)`, marginBottom: 'var(--space-sm)' }}>Populer Urunler</p>
      {shown.map(item => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: `var(--space-md) var(--space-sm)`, borderRadius: 'var(--radius-sm)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-stamp)', background: 'var(--color-brand-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {item.photoUrl ? (
              <img src={item.photoUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-stamp)', objectFit: 'cover' }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /></svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
            {item.category && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)', marginTop: 1 }}>{item.category}</p>}
          </div>
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-brand)', fontWeight: 600, flexShrink: 0 }}>{item.price} {currency}</p>
        </div>
      ))}
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuCompactList({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
      <div style={{ padding: `var(--space-md) var(--space-lg)`, borderBottom: '1px solid var(--color-divider)' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600 }}>Menu</p>
      </div>
      {shown.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `var(--space-md) var(--space-lg)`, borderBottom: i < shown.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-brand)', fontWeight: 600, flexShrink: 0, marginLeft: 'var(--space-md)' }}>{item.price} {currency}</p>
        </div>
      ))}
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

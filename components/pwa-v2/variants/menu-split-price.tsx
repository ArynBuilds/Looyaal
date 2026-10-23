'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuSplitPrice({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Menu</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {shown.map(item => (
          <div key={item.id} style={{ display: 'flex', borderRadius: 'var(--radius-card)', overflow: 'hidden', border: '1px solid var(--color-card-border)' }}>
            <div style={{ flex: 1, padding: `var(--space-md) var(--space-lg)`, background: 'var(--color-card)', display: 'flex', alignItems: 'center' }}>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
            </div>
            <div style={{ padding: `var(--space-md) var(--space-lg)`, background: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 72 }}>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'white' }}>{item.price} {currency}</p>
            </div>
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

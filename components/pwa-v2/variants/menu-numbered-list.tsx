'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuNumberedList({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)' }}>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing)', marginBottom: 'var(--space-lg)' }}>Menu</p>
      {shown.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', padding: `var(--space-md) 0`, borderBottom: i < shown.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-brand)', opacity: 0.4, width: 28, textAlign: 'center', flexShrink: 0 }}>{String(i + 1).padStart(2, '0')}</p>
          <p style={{ flex: 1, fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', fontWeight: 600, flexShrink: 0 }}>{item.price} {currency}</p>
        </div>
      ))}
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuMinimalRows({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', marginBottom: 'var(--space-sm)' }}>Menu</p>
      {shown.map((item, i) => (
        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: `var(--space-sm) 0`, borderBottom: i < shown.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>{item.name}</p>
          <div style={{ flex: 1, borderBottom: '1px dotted var(--color-text-faint)', margin: '0 var(--space-sm)', marginBottom: 3 }} />
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', fontWeight: 500, flexShrink: 0 }}>{item.price} {currency}</p>
        </div>
      ))}
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

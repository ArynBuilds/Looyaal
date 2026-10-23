'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuCategorySections({ items, currency = 'TL', previewCount = 5 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  // Group shown items by category
  const grouped: Record<string, typeof items> = {}
  for (const item of shown) {
    const cat = item.category || 'Diger'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
      {Object.entries(grouped).map(([category, catItems], ci) => (
        <div key={category}>
          <div style={{ padding: `var(--space-md) var(--space-lg)`, background: ci === 0 ? 'transparent' : 'var(--color-divider)' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing)' }}>{category}</p>
          </div>
          {catItems.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `var(--space-sm) var(--space-lg)`, borderBottom: i < catItems.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text)', fontWeight: 500 }}>{item.name}</p>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-brand)', fontWeight: 600, flexShrink: 0 }}>{item.price} {currency}</p>
            </div>
          ))}
        </div>
      ))}
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

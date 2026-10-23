'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuPillTags({ items, currency = 'TL', previewCount = 6 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Menu</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        {shown.map(item => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: `var(--space-sm) var(--space-md)`, borderRadius: 'var(--radius-button)', background: 'var(--color-bg-surface)', border: '1px solid var(--color-card-border)' }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600, background: 'var(--color-brand-glow)', borderRadius: 'var(--radius-sm)', padding: `2px var(--space-xs)` }}>{item.price}</p>
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

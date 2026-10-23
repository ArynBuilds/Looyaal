'use client'

import { useState, useMemo } from 'react'
import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

// Menu Day Drift — segmented chips on top filter the shelf below.
// Uses category as the chip dimension. Defaults to first category. When
// per-item time-of-day metadata exists later, the chips can switch to
// "sabah / öğle / akşam" automatically.

export function MenuDayDrift({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const categories = useMemo(() => {
    const set = new Set<string>()
    for (const i of items) if (i.category) set.add(i.category)
    return Array.from(set)
  }, [items])

  const [active, setActive] = useState<string | null>(categories[0] || null)
  const filtered = active ? items.filter(i => i.category === active) : items
  const expand = useMenuExpand(filtered.length, previewCount)
  const shown = filtered.slice(0, expand.visibleCount)

  if (categories.length === 0) {
    // No categories yet — fall back to flat list with title only.
    return <FlatFallback items={items} currency={currency} previewCount={previewCount} />
  }

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)', padding: '0 var(--space-xs)' }}>Menü</p>
      <div style={{ display: 'flex', gap: 'var(--space-xs)', overflowX: 'auto', paddingBottom: 'var(--space-sm)', marginBottom: 'var(--space-md)', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid ' + (active === cat ? 'var(--color-brand)' : 'var(--color-card-border)'),
              background: active === cat ? 'var(--color-brand)' : 'transparent',
              color: active === cat ? 'white' : 'var(--color-text-secondary)',
              fontSize: 'var(--font-size-label)',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'var(--transition-fast)',
            }}
          >
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        {shown.map(item => (
          <div key={item.id} style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--color-card)', border: '1px solid var(--color-card-border)' }}>
            <div style={{ aspectRatio: 'var(--ar-menu-image)', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))` }} />
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

function FlatFallback({ items, currency, previewCount }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount || 4)
  const shown = items.slice(0, expand.visibleCount)
  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)', padding: '0 var(--space-xs)' }}>Menü</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        {shown.map(item => (
          <div key={item.id} style={{ borderRadius: 'var(--radius-card)', padding: 'var(--space-sm) var(--space-md)', background: 'var(--color-card)', border: '1px solid var(--color-card-border)' }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600, marginTop: 'var(--space-xs)' }}>{item.price} {currency}</p>
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

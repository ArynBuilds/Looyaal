'use client'

// Menu Photo Mosaic — Alternating 1-wide and 2-column photo layout

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuPhotoMosaic({ items, currency = 'TL', previewCount = 5 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  // Build rows: alternating [1 wide] [2 cols] [1 wide] [2 cols]
  const rows: { items: typeof shown; wide: boolean }[] = []
  let idx = 0
  let isWide = true
  while (idx < shown.length) {
    if (isWide) {
      rows.push({ items: [shown[idx]], wide: true })
      idx++
    } else {
      const pair = shown.slice(idx, idx + 2)
      rows.push({ items: pair, wide: false })
      idx += pair.length
    }
    isWide = !isWide
  }

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Menu</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {row.items.map(item => (
              <div key={item.id} style={{
                flex: 1,
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                position: 'relative',
                aspectRatio: row.wide ? '2.5 / 1' : '1.2 / 1',
                background: item.photoUrl
                  ? `url(${item.photoUrl}) center/cover no-repeat`
                  : `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`,
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 'var(--space-sm) var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p style={{ fontSize: row.wide ? 'var(--font-size-body)' : 'var(--font-size-label)', fontWeight: 600, color: 'white' }}>{item.name}</p>
                  <p style={{ fontSize: 'var(--font-size-label)', fontWeight: 700, color: 'white', flexShrink: 0 }}>{item.price} {currency}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

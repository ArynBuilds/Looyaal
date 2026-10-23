'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuStackedImages({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  // Build rows — each row has an aspect ratio, items stretch to fill
  const rows: { count: number; ar: string; startIdx: number }[] = []
  let idx = 0
  const patterns = [
    { count: 2, ar: '3.2 / 1' },
    { count: 1, ar: '2.8 / 1' },
    { count: 3, ar: '4.5 / 1' },
    { count: 1, ar: '3.5 / 1' },
    { count: 2, ar: '2.8 / 1' },
    { count: 3, ar: '5 / 1' },
    { count: 2, ar: '3.8 / 1' },
    { count: 1, ar: '2.5 / 1' },
    { count: 3, ar: '4.2 / 1' },
  ]
  let patIdx = 0
  while (idx < shown.length) {
    const pat = patterns[patIdx % patterns.length]
    const count = Math.min(pat.count, shown.length - idx)
    rows.push({ count, ar: pat.ar, startIdx: idx })
    idx += count
    patIdx++
  }

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Menu</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 3, aspectRatio: row.ar }}>
            {shown.slice(row.startIdx, row.startIdx + row.count).map((item, ii) => (
              <div key={item.id} style={{
                flex: row.count === 2 && ii === 0 ? 1.6 : 1,
                borderRadius: 'var(--radius-sm)',
                overflow: 'hidden',
                position: 'relative',
                background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(${135 + parseInt(item.id) * 25}deg, var(--color-brand-dark), var(--color-brand), var(--color-brand-muted))`,
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: `var(--space-sm) var(--space-md)`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: row.count === 1 ? 'var(--font-size-h2)' : 'var(--font-size-body)', fontWeight: 'var(--font-weight-heading)', color: 'white', letterSpacing: 'var(--letter-spacing)' }}>{item.name}</p>
                  <p style={{ fontSize: row.count === 1 ? 'var(--font-size-body)' : 'var(--font-size-label)', fontWeight: 700, color: 'white', flexShrink: 0, marginLeft: 'var(--space-sm)' }}>{item.price} {currency}</p>
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

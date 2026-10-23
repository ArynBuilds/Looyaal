'use client'

import { useMemo } from 'react'
import type { MenuProps } from './menu-types'

// Menu Carousel Trays — horizontal swipe rails per category. Each rail is its
// own scroll container. Falls back to a single "Tüm Menü" rail if no
// categories are set on items.

export function MenuCarouselTrays({ items, currency = 'TL' }: MenuProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof items>()
    for (const i of items) {
      const key = i.category || 'Menü'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(i)
    }
    return Array.from(map.entries())
  }, [items])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {grouped.map(([category, list]) => (
        <div key={category}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 var(--space-sm)', padding: '0 var(--space-xs)', letterSpacing: '-0.01em' }}>{category}</p>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', overflowX: 'auto', paddingBottom: 'var(--space-sm)', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
            {list.map(item => (
              <div key={item.id} style={{ flexShrink: 0, width: '36cqw', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', scrollSnapAlign: 'start' }}>
                <div style={{ aspectRatio: '1', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))` }} />
                <div style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                  <p style={{ fontSize: 'var(--font-size-label)', fontWeight: 600, color: 'var(--color-text)', margin: 0, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                  <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', fontWeight: 700, margin: '2px 0 0' }}>{item.price} {currency}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

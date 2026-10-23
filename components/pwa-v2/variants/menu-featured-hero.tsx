'use client'

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuFeaturedHero({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  if (items.length === 0) return null
  const hero = items[0]
  const rest = items.slice(1, expand.visibleCount)

  return (
    <div>
      {/* Hero item */}
      <div style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', marginBottom: 'var(--space-md)' }}>
        <div style={{ aspectRatio: 'var(--ar-menu-image)', background: hero.photoUrl ? `url(${hero.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))`, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 'var(--space-sm)', left: 'var(--space-sm)', background: 'var(--color-brand)', borderRadius: 'var(--radius-button)', padding: `var(--space-xs) var(--space-sm)` }}>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'white', fontWeight: 600 }}>Populer</p>
          </div>
        </div>
        <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-heading)', color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing)' }}>{hero.name}</p>
          <p style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-brand)', fontWeight: 700 }}>{hero.price} {currency}</p>
        </div>
      </div>
      {/* Rest as compact list */}
      {rest.length > 0 && (
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          {rest.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `var(--space-md) var(--space-lg)`, borderBottom: i < rest.length - 1 ? '1px solid var(--color-divider)' : 'none' }}>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-brand)', fontWeight: 600 }}>{item.price} {currency}</p>
            </div>
          ))}
        </div>
      )}
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

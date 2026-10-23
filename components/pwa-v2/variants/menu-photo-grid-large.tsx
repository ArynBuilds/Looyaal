'use client'

// Menu Photo Grid Large — Single column, large photo cards with overlay text

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuPhotoGridLarge({ items, currency = 'TL', previewCount = 3 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Menu</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {shown.map(item => (
          <div key={item.id} style={{
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '2.2 / 1',
            background: item.photoUrl
              ? `url(${item.photoUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`,
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent)' }} />
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: 'var(--space-lg)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            }}>
              <div>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-heading)', color: 'white', letterSpacing: 'var(--letter-spacing)' }}>{item.name}</p>
                {item.category && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{item.category}</p>}
              </div>
              <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'white', flexShrink: 0 }}>{item.price} {currency}</p>
            </div>
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

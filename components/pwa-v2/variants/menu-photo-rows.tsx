'use client'

// Menu Photo Rows — Horizontal rows with small photo on left, text on right

import type { MenuProps } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

export function MenuPhotoRows({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount)

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
      <div style={{ padding: `var(--space-md) var(--space-lg)`, borderBottom: '1px solid var(--color-divider)' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600 }}>Menu</p>
      </div>
      {shown.map((item, i) => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
          padding: 'var(--space-md) var(--space-lg)',
          borderBottom: i < shown.length - 1 ? '1px solid var(--color-divider)' : 'none',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 'var(--radius-sm)', flexShrink: 0, overflow: 'hidden',
            background: item.photoUrl
              ? `url(${item.photoUrl}) center/cover no-repeat`
              : `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {!item.photoUrl && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1" opacity="0.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /></svg>}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 500, color: 'var(--color-text)' }}>{item.name}</p>
            {item.category && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)', marginTop: 2 }}>{item.category}</p>}
          </div>
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-brand)', fontWeight: 600, flexShrink: 0 }}>{item.price} {currency}</p>
        </div>
      ))}
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

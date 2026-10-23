'use client'

import type { MenuProps, MenuItem } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

// Menu Story Stream — vertical editorial feed. Photo, name, optional category
// kicker, price aside. Designed to slot in a 2-line story/origin once the
// schema gets a `story` field — until then the row reads as a clean photo list.

interface StoryItem extends MenuItem { story?: string }

export function MenuStoryStream({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount) as StoryItem[]

  return (
    <div>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, marginBottom: 'var(--space-md)', padding: '0 var(--space-xs)' }}>Hikayeler</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {shown.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-start' }}>
            <div style={{ width: '20cqw', aspectRatio: '1', flexShrink: 0, borderRadius: 'var(--radius-card)', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))` }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {item.category && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700, margin: 0 }}>{item.category}</p>}
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.15 }}>{item.name}</p>
              {item.story && (
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: '6px 0 0', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.story}</p>
              )}
            </div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', color: 'var(--color-text)', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>{item.price} {currency}</p>
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

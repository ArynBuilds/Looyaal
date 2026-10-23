'use client'

import type { MenuProps, MenuItem } from './menu-types'
import { useMenuExpand, SeeAllButton } from './menu-expand-wrapper'

// Menu Conversation — chat-bubble menu. Customer prompt at top, each item
// "replies" with its own pitch in a bubble. Falls back to name+price-only
// bubbles when the per-item `pitch` field is empty.

interface PitchItem extends MenuItem { pitch?: string }

export function MenuConversation({ items, currency = 'TL', previewCount = 4 }: MenuProps) {
  const expand = useMenuExpand(items.length, previewCount)
  const shown = items.slice(0, expand.visibleCount) as PitchItem[]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <div style={{ background: 'var(--color-brand)', color: 'white', padding: '8px 14px', borderRadius: '14px 14px 4px 14px', maxWidth: '70%' }}>
          <p style={{ fontSize: 'var(--font-size-body)', margin: 0, lineHeight: 1.3 }}>Bugün ne öneriyorsun?</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {shown.map(item => (
          <div key={item.id} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
            <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand), var(--color-brand-light))` }} />
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', padding: '8px 14px', borderRadius: '4px 14px 14px 14px', maxWidth: '80%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 'var(--space-md)' }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{item.name}</p>
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>{item.price} {currency}</p>
              </div>
              {item.pitch && <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: '4px 0 0', lineHeight: 1.4 }}>{item.pitch}</p>}
            </div>
          </div>
        ))}
      </div>
      {expand.needsExpand && <SeeAllButton isExpanded={expand.isExpanded} totalItems={expand.totalItems} onToggle={expand.toggle} />}
    </div>
  )
}

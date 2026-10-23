'use client'

// Menu Collapsible — Accordion categories, tap to expand/collapse, for large menus (30+ items)

import { useState } from 'react'
import type { MenuProps } from './menu-types'

export function MenuCollapsible({ items, currency = 'TL' }: MenuProps) {
  // Group by category
  const grouped: Record<string, typeof items> = {}
  for (const item of items) {
    const cat = item.category || 'Diger'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(item)
  }
  const categories = Object.entries(grouped)

  // Only first category open by default
  const [openCats, setOpenCats] = useState<Set<string>>(new Set([categories[0]?.[0] || '']))

  const toggle = (cat: string) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(cat)) {
        next.delete(cat)
      } else {
        next.add(cat)
      }
      return next
    })
  }

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
    }}>
      {categories.map(([category, catItems], ci) => {
        const isOpen = openCats.has(category)
        return (
          <div key={category}>
            {/* Category header — tappable */}
            <button
              onClick={() => toggle(category)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: `var(--space-md) var(--space-lg)`,
                background: 'transparent',
                border: 'none',
                borderBottom: ci < categories.length - 1 || isOpen ? '1px solid var(--color-divider)' : 'none',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-heading)',
                  color: 'var(--color-text)',
                  letterSpacing: 'var(--letter-spacing)',
                }}>{category}</p>
                <span style={{
                  fontSize: 'var(--font-size-tiny)',
                  color: 'var(--color-text-faint)',
                  background: 'var(--color-bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1px var(--space-xs)',
                }}>{catItems.length}</span>
              </div>
              {/* Chevron */}
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="var(--color-text-muted)" strokeWidth="1.5"
                style={{
                  transition: 'var(--transition-fast)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {/* Items — collapsed/expanded */}
            {isOpen && (
              <div>
                {catItems.map((item, i) => (
                  <div key={item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: `var(--space-sm) var(--space-lg) var(--space-sm) var(--space-2xl)`,
                    borderBottom: i < catItems.length - 1 ? '1px solid var(--color-divider)' : 'none',
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: 'var(--font-size-body)',
                        fontWeight: 500,
                        color: 'var(--color-text)',
                      }}>{item.name}</p>
                    </div>
                    <p style={{
                      fontSize: 'var(--font-size-body)',
                      color: 'var(--color-brand)',
                      fontWeight: 600,
                      flexShrink: 0,
                      marginLeft: 'var(--space-md)',
                    }}>{item.price} {currency}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

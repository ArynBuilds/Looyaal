'use client'

// Nav Tab Pills — Pill-shaped tabs, active one has brand bg + white text

import { NAV_TABS, type NavProps } from './nav-types'

export function NavTabPills({ activeTab, onTabChange, tabs }: NavProps) {
  const items = tabs ?? NAV_TABS
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      padding: 'var(--space-sm) var(--space-md) calc(var(--space-md) + env(safe-area-inset-bottom, 0px))',
      background: 'var(--color-nav-bg)',
      backdropFilter: 'var(--nav-blur)',
      WebkitBackdropFilter: 'var(--nav-blur)',
      borderTop: '1px solid var(--color-nav-border)',
    }}>
      <div style={{
        display: 'flex',
        gap: 'var(--space-xs)',
        padding: 'var(--space-xs)',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-card-border)',
      }}>
        {items.map(tab => {
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-xs)',
              padding: 'var(--space-sm) var(--space-md)',
              borderRadius: 'var(--radius-button)',
              background: active ? 'var(--color-brand)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={active ? 'white' : 'var(--color-text-muted)'}
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: tab.icon }} />
              <p style={{
                fontSize: 'var(--font-size-label)',
                color: active ? 'white' : 'var(--color-text-muted)',
                fontWeight: active ? 600 : 400,
              }}>{tab.label}</p>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

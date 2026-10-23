'use client'

// Nav Minimal Dots — Just 3 dots at bottom, active one stretches into pill

import { NAV_TABS, type NavProps } from './nav-types'

export function NavMinimalDots({ activeTab, onTabChange, tabs }: NavProps) {
  const items = tabs ?? NAV_TABS
  return (
    <nav style={{
      position: 'fixed',
      bottom: 'calc(var(--space-xl) + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-md)',
      padding: 'var(--space-sm)',
    }}>
      {items.map(tab => {
        const active = activeTab === tab.id
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            width: active ? 32 : 10,
            height: 10,
            borderRadius: 'var(--radius-lg)',
            background: active ? 'var(--color-brand)' : 'var(--color-text-faint)',
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition)',
            boxShadow: active ? '0 2px 8px var(--color-brand-glow-strong)' : 'none',
          }} />
        )
      })}
    </nav>
  )
}

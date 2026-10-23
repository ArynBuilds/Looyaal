'use client'

// Nav Floating Island — Floating pill with icons, active dot indicator

import { NAV_TABS, type NavProps } from './nav-types'

export function NavFloatingIsland({ activeTab, onTabChange, tabs }: NavProps) {
  const items = tabs ?? NAV_TABS
  return (
    <nav style={{
      position: 'fixed',
      bottom: 'calc(var(--space-lg) + env(safe-area-inset-bottom, 0px))',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-xl)',
      padding: 'var(--space-md) var(--space-2xl)',
      borderRadius: 'var(--radius-lg)',
      background: 'var(--color-nav-bg)',
      backdropFilter: 'var(--nav-blur)',
      WebkitBackdropFilter: 'var(--nav-blur)',
      boxShadow: '0 4px 24px var(--color-shadow)',
      border: '1px solid var(--color-nav-border)',
    }}>
      {items.map(tab => {
        const active = activeTab === tab.id
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            textAlign: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            padding: 'var(--space-xs)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke={active ? 'var(--color-brand)' : 'var(--color-text-muted)'}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: tab.icon }} />
            {active && (
              <div style={{
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: 'var(--color-brand)',
                margin: '3px auto 0',
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}

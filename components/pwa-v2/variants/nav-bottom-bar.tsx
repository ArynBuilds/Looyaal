'use client'

// Nav Bottom Bar — Classic 3-tab bottom bar with icons + labels

import { NAV_TABS, type NavProps } from './nav-types'

export function NavBottomBar({ activeTab, onTabChange, tabs }: NavProps) {
  const items = tabs ?? NAV_TABS
  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: 'var(--color-nav-bg)',
      borderTop: '1px solid var(--color-nav-border)',
      backdropFilter: 'var(--nav-blur)',
      WebkitBackdropFilter: 'var(--nav-blur)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 var(--space-lg)',
    }}>
      {items.map(tab => {
        const active = activeTab === tab.id
        return (
          <button key={tab.id} onClick={() => onTabChange(tab.id)} style={{
            textAlign: 'center',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 'var(--space-sm)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke={active ? 'var(--color-brand)' : 'var(--color-text-muted)'}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ margin: '0 auto', display: 'block' }}
              dangerouslySetInnerHTML={{ __html: tab.icon }} />
            <p style={{
              fontSize: 'var(--font-size-tiny)',
              color: active ? 'var(--color-brand)' : 'var(--color-text-muted)',
              marginTop: 2,
              fontWeight: active ? 600 : 400,
            }}>{tab.label}</p>
          </button>
        )
      })}
    </nav>
  )
}

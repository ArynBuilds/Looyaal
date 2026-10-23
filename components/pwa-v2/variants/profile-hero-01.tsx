'use client'

// Profile Hero 01 — Brand gradient hero header with avatar centered, stats below

import type { ProfileProps } from './profile-types'
import { SettingsList } from './profile-card-01'

export function ProfileHero01({ name, phone, totalVisits, totalStamps, totalRewards, onLogout, onNotificationSettings, onDeleteAccount }: ProfileProps) {
  const initials = name ? name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() : 'M'

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      {/* Hero header */}
      <div style={{
        background: `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`,
        padding: `var(--space-3xl) var(--space-xl) var(--space-xl)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          border: '3px solid rgba(255,255,255,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-md)',
        }}>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 'var(--font-size-h1)' }}>{initials}</span>
        </div>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'var(--font-size-h1)',
          color: 'white',
          letterSpacing: 'var(--letter-spacing)',
        }}>{name || 'Misafir'}</p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.6)', marginTop: 'var(--space-xs)' }}>{phone}</p>
      </div>

      {/* Stats row */}
      <div style={{
        margin: `var(--space-md) var(--space-xl) 0`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 'var(--space-sm)',
      }}>
        {[{ v: totalVisits, l: 'Ziyaret' }, { v: totalStamps, l: 'Damga' }, { v: totalRewards, l: 'Ödül' }].map(s => (
          <div key={s.l} style={{
            textAlign: 'center',
            padding: 'var(--space-md)',
            background: 'var(--color-card)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)' }}>{s.v}</p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div style={{ padding: `var(--space-xl) var(--space-xl)` }}>
        <SettingsList onLogout={onLogout} onNotificationSettings={onNotificationSettings} onDeleteAccount={onDeleteAccount} />
      </div>
    </div>
  )
}

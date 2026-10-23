'use client'

// Profile Minimal 01 — Compact: small avatar inline, stats as text row, clean settings

import type { ProfileProps } from './profile-types'
import { SettingsList } from './profile-card-01'

export function ProfileMinimal01({ name, phone, totalVisits, totalStamps, totalRewards, onLogout, onNotificationSettings, onDeleteAccount }: ProfileProps) {
  const initials = name ? name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() : 'M'

  return (
    <div style={{ padding: 'var(--space-xl)', height: '100%', overflowY: 'auto' }}>
      {/* Compact header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--color-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 'var(--font-size-body)' }}>{initials}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text)',
          }}>{name || 'Misafir'}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)' }}>{phone}</p>
        </div>
        {/* Inline stats */}
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          {[{ v: totalVisits, l: 'Z' }, { v: totalStamps, l: 'D' }, { v: totalRewards, l: 'O' }].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text)' }}>{s.v}</p>
              <p style={{ fontSize: 7, color: 'var(--color-text-faint)' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-divider)', marginBottom: 'var(--space-lg)' }} />

      {/* Settings */}
      <SettingsList onLogout={onLogout} onNotificationSettings={onNotificationSettings} onDeleteAccount={onDeleteAccount} />
    </div>
  )
}

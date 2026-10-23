'use client'

// Profile Split 01 — Left column: avatar + name. Right column: stats stacked. Settings below.

import type { ProfileProps } from './profile-types'
import { SettingsList } from './profile-card-01'

export function ProfileSplit01({ name, phone, totalVisits, totalStamps, totalRewards, onLogout, onNotificationSettings, onDeleteAccount }: ProfileProps) {
  const initials = name ? name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() : 'M'

  return (
    <div style={{ padding: 'var(--space-xl)', height: '100%', overflowY: 'auto' }}>
      {/* Split header */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-xl)',
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-xl)',
        boxShadow: 'var(--shadow-card)',
      }}>
        {/* Left: avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-light))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px var(--color-brand-glow-strong)',
            marginBottom: 'var(--space-md)',
          }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 'var(--font-size-h2)' }}>{initials}</span>
          </div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text)',
            textAlign: 'center',
          }}>{name || 'Misafir'}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 2 }}>{phone}</p>
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, background: 'var(--color-divider)' }} />

        {/* Right: stats stacked */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-md)' }}>
          {[{ v: totalVisits, l: 'Ziyaret' }, { v: totalStamps, l: 'Damga' }, { v: totalRewards, l: 'Ödül' }].map(s => (
            <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>{s.l}</p>
              <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)' }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <SettingsList onLogout={onLogout} onNotificationSettings={onNotificationSettings} onDeleteAccount={onDeleteAccount} />
    </div>
  )
}

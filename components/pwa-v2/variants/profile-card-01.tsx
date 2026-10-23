'use client'

// Profile Card 01 — Large avatar card on top, stats row, settings list below

import type { ProfileProps } from './profile-types'

export function ProfileCard01({ name, phone, totalVisits, totalStamps, totalRewards, longestStreak, completedChallenges, onLogout, onNotificationSettings, onDeleteAccount }: ProfileProps) {
  const initials = name ? name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase() : 'M'

  return (
    <div style={{ padding: 'var(--space-xl)', height: '100%', overflowY: 'auto' }}>
      {/* Avatar card */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-xl)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-lg)',
        marginBottom: 'var(--space-md)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          background: 'var(--color-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 'var(--font-size-h2)' }}>{initials}</span>
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-h2)',
            color: 'var(--color-text)',
            letterSpacing: 'var(--letter-spacing)',
          }}>{name || 'Misafir'}</p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 2 }}>{phone}</p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        {[{ v: totalVisits, l: 'Ziyaret' }, { v: totalStamps, l: 'Damga' }, { v: totalRewards, l: 'Ödül' }].map(s => (
          <div key={s.l} style={{
            textAlign: 'center',
            padding: 'var(--space-md)',
            background: 'var(--color-card)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-card)',
          }}>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)' }}>{s.v}</p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.l}</p>
          </div>
        ))}
      </div>
      {(longestStreak || completedChallenges) ? (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', marginBottom: 'var(--space-lg)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)' }}>
          {longestStreak ? <span>En uzun seri: {longestStreak} gün</span> : null}
          {completedChallenges ? <span>Tamamlanan görev: {completedChallenges}</span> : null}
        </div>
      ) : <div style={{ marginBottom: 'var(--space-lg)' }} />}

      {/* Settings */}
      <SettingsList onLogout={onLogout} onNotificationSettings={onNotificationSettings} onDeleteAccount={onDeleteAccount} />
    </div>
  )
}

// Shared settings list used by all profile variants
export function SettingsList({ onLogout, onNotificationSettings, onDeleteAccount }: {
  onLogout: () => void
  onNotificationSettings?: () => void
  onDeleteAccount?: () => void
}) {
  const rows = [
    { label: 'Bildirim Ayarları', danger: false, action: onNotificationSettings },
    { label: 'Hesabımı Sil', danger: true, action: onDeleteAccount },
    { label: 'Çıkış Yap', danger: true, action: onLogout },
  ]

  return (
    <>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
        marginBottom: 'var(--space-sm)',
      }}>Ayarlar</p>
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}>
        {rows.map((r, i) => (
          <button key={r.label} onClick={r.action} style={{
            width: '100%',
            padding: `var(--space-md) var(--space-lg)`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: i < rows.length - 1 ? '1px solid var(--color-divider)' : 'none',
            background: 'transparent',
            border: 'none',
            cursor: r.action ? 'pointer' : 'default',
          }}>
            <p style={{
              fontSize: 'var(--font-size-body)',
              color: r.danger ? 'var(--color-danger)' : 'var(--color-text-secondary)',
            }}>{r.label}</p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-faint)" strokeWidth="1.5"><path d="m9 18 6-6-6-6" /></svg>
          </button>
        ))}
      </div>
    </>
  )
}

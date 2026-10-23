'use client'

// Activity Compact 01 — All info in a single card: stats row + visit list, no streak banner

import type { ActivityProps } from './activity-types'

export function ActivityCompact01({ totalVisits, totalRewards, lastVisits, memberSince }: ActivityProps) {
  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
    }}>
      {/* Stats row at top */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--color-divider)',
      }}>
        {[{ v: totalVisits, l: 'Ziyaret' }, { v: totalRewards, l: 'Ödül' }, { v: memberSince, l: 'Üye' }].map((s, i) => (
          <div key={s.l} style={{
            flex: 1,
            textAlign: 'center',
            padding: 'var(--space-md)',
            borderRight: i < 2 ? '1px solid var(--color-divider)' : 'none',
          }}>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)' }}>{s.v}</p>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Visit list */}
      {lastVisits.map((v, i) => (
        <div key={i} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: `var(--space-sm) var(--space-lg)`,
          borderBottom: i < lastVisits.length - 1 ? '1px solid var(--color-divider)' : 'none',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: i === 0 ? 'var(--color-brand)' : 'var(--color-stamp-empty)',
            }} />
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>{v.date}</p>
          </div>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-faint)' }}>{v.location}</p>
        </div>
      ))}
    </div>
  )
}

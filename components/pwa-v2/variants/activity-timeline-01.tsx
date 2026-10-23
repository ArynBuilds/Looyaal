'use client'

// Activity Timeline 01 — Streak banner + vertical timeline with dots + lifetime stats

import type { ActivityProps } from './activity-types'

export function ActivityTimeline01({ streak, totalVisits, totalRewards, lastVisits, memberSince }: ActivityProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Streak banner */}
      {streak > 0 && (
        <div style={{
          background: 'var(--color-brand-glow)',
          border: '1px solid var(--color-brand)',
          borderRadius: 'var(--radius-card)',
          padding: `var(--space-md) var(--space-lg)`,
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: 'white', fontSize: 'var(--font-size-body)', fontWeight: 800 }}>{streak}</span>
          </div>
          <div>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 600, color: 'var(--color-text)' }}>Bu hafta {streak} ziyaret!</p>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)' }}>Harika gidiyorsun</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-lg)',
      }}>
        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
          fontWeight: 600,
          marginBottom: 'var(--space-md)',
        }}>Son Aktiviteler</p>

        {lastVisits.map((v, i) => (
          <div key={i} style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: i < lastVisits.length - 1 ? 'var(--space-md)' : 0 }}>
            {/* Dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 12 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i === 0 ? 'var(--color-brand)' : 'var(--color-text-faint)',
                flexShrink: 0,
              }} />
              {i < lastVisits.length - 1 && (
                <div style={{ width: 1, flex: 1, background: 'var(--color-divider)', marginTop: 4 }} />
              )}
            </div>
            {/* Visit info */}
            <div style={{ flex: 1, paddingBottom: i < lastVisits.length - 1 ? 'var(--space-sm)' : 0 }}>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>{v.date}</p>
              <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)' }}>{v.location}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lifetime stats */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        {[{ v: totalVisits, l: 'Toplam Ziyaret' }, { v: totalRewards, l: 'Kazanılan Ödül' }].map(s => (
          <div key={s.l} style={{
            flex: 1,
            background: 'var(--color-card)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-md)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)' }}>{s.v}</p>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Member since */}
      <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)', textAlign: 'center' }}>
        {memberSince} tarihinden beri üye
      </p>
    </div>
  )
}

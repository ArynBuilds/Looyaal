'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Passport — Looks like a passport page with date-stamped entries


export function StampPassport({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  // Generate mock dates for filled stamps
  const today = new Date()
  const mockDates = Array.from({ length: current }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (current - 1 - i) * 3)
    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}`
  })

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Passport header band */}
      <div style={{
        padding: `var(--space-md) var(--space-lg)`,
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-divider)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="18" rx="2" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--font-size-label)',
            fontWeight: 'var(--font-weight-heading)',
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>Sadakat Pasaportu</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 700 }}>{current}/{total}</p>
        </div>
      </div>

      {/* Stamp entries */}
      <div style={{ padding: 'var(--space-md) var(--space-lg)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
              ...(i < current ? {
                background: 'var(--color-brand-glow)',
                border: '1px solid var(--color-brand)',
              } : {
                border: '1px dashed var(--color-stamp-border)',
                background: 'var(--color-stamp-empty)',
              }),
            }}>
              {i < current ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  <p style={{ fontSize: 7, color: 'var(--color-brand)', marginTop: 1, fontWeight: 500 }}>{mockDates[i]}</p>
                </>
              ) : (
                <span style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)' }}>{i + 1}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: `var(--space-md) var(--space-lg)`,
        borderTop: '1px dashed var(--color-divider)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>
          {remaining > 0 ? `${remaining} damga kaldı` : 'Tamamlandı!'}
        </p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          Ödül: {rewardName}
        </p>
      </div>
    </div>
  )
}

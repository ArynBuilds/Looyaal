'use client'

import type { ChallengeProps } from './challenge-types'

// Challenge — Habit Tracker. Vertical checkbox list — one row per visit
// needed. Done rows feel like crossed-off todo items. Tactile satisfaction.

export function ChallengeHabitTracker({ title, description, targetCount, currentCount, daysRemaining, rewardValue, isEmpty }: ChallengeProps) {
  if (isEmpty) {
    return (
      <div style={{ background: 'var(--color-card)', border: '1px dashed var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', margin: 0 }}>Şu an aktif görev yok</p>
      </div>
    )
  }

  const rows = Array.from({ length: targetCount }, (_, i) => i < currentCount)
  const pct = targetCount > 0 ? Math.min(100, (currentCount / targetCount) * 100) : 0

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>Görev</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.15 }}>{title}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {rows.map((done, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div style={{ width: 22, height: 22, borderRadius: 'var(--radius-sm)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 200ms', ...(done ? { background: 'var(--color-brand)' } : { background: 'transparent', border: '1.5px dashed var(--color-stamp-border)' }) }}>
              {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
            </div>
            <p style={{ fontSize: 'var(--font-size-body)', color: done ? 'var(--color-text-muted)' : 'var(--color-text)', fontWeight: 500, margin: 0, textDecoration: done ? 'line-through' : 'none', transition: 'all 200ms' }}>
              {i + 1}. ziyaret
            </p>
          </div>
        ))}
      </div>

      <div style={{ height: 3, background: 'var(--color-stamp-empty)', borderRadius: 2, marginTop: 'var(--space-md)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-brand)', borderRadius: 2, transition: 'width 600ms cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-divider)' }}>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600 }}>{daysRemaining}g kaldı · {description}</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', margin: 0, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: 'var(--space-md)' }}>+{rewardValue} ödül</p>
      </div>
    </div>
  )
}

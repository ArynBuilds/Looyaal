'use client'

import type { ChallengeProps } from './challenge-types'

// Challenge — Calendar Grid. 7-day week visual. Days that count toward the
// challenge are filled, today is highlighted, future days are dimmed. Shows
// the rhythm pattern, not just the count.

const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function ChallengeCalendarGrid({ title, description, targetCount, currentCount, daysRemaining, rewardValue, isEmpty }: ChallengeProps) {
  if (isEmpty) {
    return (
      <div style={{ background: 'var(--color-card)', border: '1px dashed var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', margin: 0 }}>Şu an aktif görev yok</p>
      </div>
    )
  }

  // Current week index (0 = Mon..6 = Sun) using local day, then map JS Sunday=0..Sat=6 → Mon-first.
  const jsDay = new Date().getDay()
  const todayIndex = jsDay === 0 ? 6 : jsDay - 1

  // Distribute completed visits across days BEFORE today (pseudo, for visual feedback).
  // Real per-day completion would come from backend; for now, mark `currentCount` of the
  // days at-or-before today as filled.
  const days = Array.from({ length: 7 }, (_, i) => {
    if (i > todayIndex) return 'future' as const
    if (i === todayIndex) return currentCount > 0 ? 'today-done' : 'today' as const
    // Distribute remaining (currentCount - 1 if today is done, else currentCount) across past days
    const filledPast = currentCount > 0 ? currentCount - 1 : 0
    return i < filledPast ? 'done' as const : 'past-empty' as const
  })

  const pct = targetCount > 0 ? Math.min(100, (currentCount / targetCount) * 100) : 0

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>Bu Hafta</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.15 }}>{title}</p>
        </div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 800, color: 'var(--color-brand)', margin: 0 }}>{currentCount}/{targetCount}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 'var(--space-xs)', marginTop: 'var(--space-md)' }}>
        {days.map((status, i) => {
          const styles = {
            done: { background: 'var(--color-brand)', color: 'white', border: 'none' as const },
            'today-done': { background: 'var(--color-brand)', color: 'white', border: '2px solid var(--color-brand-light)', boxShadow: '0 0 0 2px var(--color-brand-glow)' },
            today: { background: 'var(--color-brand-glow)', color: 'var(--color-brand)', border: '2px solid var(--color-brand)' },
            'past-empty': { background: 'var(--color-stamp-empty)', color: 'var(--color-text-faint)', border: '1px dashed var(--color-stamp-border)' },
            future: { background: 'transparent', color: 'var(--color-text-faint)', border: '1px dashed var(--color-stamp-border)' },
          }[status]
          return (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--font-size-tiny)', fontWeight: 700, transition: 'all 200ms', ...styles }}>
              {(status === 'done' || status === 'today-done') ? '✓' : DAY_LABELS[i]}
            </div>
          )
        })}
      </div>

      <div style={{ height: 4, background: 'var(--color-stamp-empty)', borderRadius: 2, marginTop: 'var(--space-md)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--color-brand)', borderRadius: 2, transition: 'width 600ms cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.3, flex: 1 }}>{description}</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', margin: 0, fontWeight: 700, marginLeft: 'var(--space-md)' }}>+{rewardValue} ödül</p>
      </div>
    </div>
  )
}

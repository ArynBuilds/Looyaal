'use client'

import type { ChallengeProps } from './challenge-types'

// Challenge — XP Bar. Game-style progress with milestone markers and a glowing
// edge on current position. Big level / count badge top-right.

export function ChallengeXpBar({ title, description, targetCount, currentCount, daysRemaining, rewardValue, isEmpty }: ChallengeProps) {
  if (isEmpty) return <EmptyState />

  const pct = targetCount > 0 ? Math.min(100, (currentCount / targetCount) * 100) : 0
  const milestones = Array.from({ length: targetCount }, (_, i) => ((i + 1) / targetCount) * 100)

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>Görev</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.15 }}>{title}</p>
        </div>
        <div style={{ background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-light))', borderRadius: 'var(--radius-sm)', padding: '4px 10px', boxShadow: '0 2px 8px var(--color-brand-glow-strong)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.02em' }}>{currentCount}/{targetCount}</p>
        </div>
      </div>

      <div style={{ position: 'relative', height: 14, background: 'var(--color-stamp-empty)', borderRadius: 7, overflow: 'visible', marginTop: 'var(--space-md)' }}>
        <div style={{ position: 'absolute', inset: 0, right: `${100 - pct}%`, background: 'linear-gradient(90deg, var(--color-brand), var(--color-brand-light))', borderRadius: 7, transition: 'right 600ms cubic-bezier(0.34,1.56,0.64,1)' }} />
        {pct > 0 && pct < 100 && (
          <div style={{ position: 'absolute', left: `${pct}%`, top: -4, bottom: -4, width: 3, background: 'white', borderRadius: 1.5, boxShadow: '0 0 10px var(--color-brand-glow-strong), 0 0 4px white', transform: 'translateX(-50%)' }} />
        )}
        {milestones.slice(0, -1).map((m, i) => (
          <div key={i} style={{ position: 'absolute', left: `${m}%`, top: '50%', width: 2, height: 8, background: i < currentCount - 1 ? 'rgba(255,255,255,0.5)' : 'var(--color-stamp-border)', transform: 'translate(-50%, -50%)', borderRadius: 1 }} />
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-md)' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.3 }}>{description}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-divider)' }}>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600 }}>{daysRemaining}g kaldı</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', margin: 0, fontWeight: 700 }}>+{rewardValue} ödül</p>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ background: 'var(--color-card)', border: '1px dashed var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'center' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', margin: 0 }}>Şu an aktif görev yok</p>
    </div>
  )
}

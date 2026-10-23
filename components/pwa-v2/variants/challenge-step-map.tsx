'use client'

import type { ChallengeProps } from './challenge-types'

// Challenge — Step Map. Visual stepper with completed steps filled, current
// highlighted with glow ring. Like a journey, not a bar.

export function ChallengeStepMap({ title, description, targetCount, currentCount, daysRemaining, rewardValue, isEmpty }: ChallengeProps) {
  if (isEmpty) {
    return (
      <div style={{ background: 'var(--color-card)', border: '1px dashed var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', margin: 0 }}>Şu an aktif görev yok</p>
      </div>
    )
  }

  const steps = Array.from({ length: targetCount }, (_, i) => {
    if (i < currentCount) return 'done' as const
    if (i === currentCount) return 'current' as const
    return 'todo' as const
  })

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)' }}>
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>Görev</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.15 }}>{title}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 'var(--space-md)' }}>
        {steps.map((status, i) => (
          <div key={i} style={{ display: 'contents' }}>
            <div style={{
              width: status === 'current' ? 32 : 24,
              height: status === 'current' ? 32 : 24,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-heading)',
              fontSize: 12,
              fontWeight: 800,
              transition: 'all 300ms',
              ...(status === 'done' ? { background: 'var(--color-brand)', color: 'white' }
                : status === 'current' ? { background: 'var(--color-card)', border: '2.5px solid var(--color-brand)', color: 'var(--color-brand)', boxShadow: '0 0 0 4px var(--color-brand-glow), 0 0 12px var(--color-brand-glow-strong)' }
                : { background: 'var(--color-stamp-empty)', border: '1px solid var(--color-stamp-border)', color: 'var(--color-text-faint)' }),
            }}>
              {status === 'done' ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 3, background: status === 'done' ? 'var(--color-brand)' : 'var(--color-stamp-border)', position: 'relative', transition: 'background 300ms' }}>
                {status === 'done' && i + 1 === currentCount && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--color-brand) 50%, var(--color-stamp-border) 50%)' }} />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>{description}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-divider)' }}>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600 }}>{daysRemaining}g kaldı</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', margin: 0, fontWeight: 700 }}>+{rewardValue} ödül</p>
      </div>
    </div>
  )
}

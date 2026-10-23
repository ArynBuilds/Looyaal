'use client'

import type { ChallengeProps } from './challenge-types'

// Challenge — Countdown Coin. Circular progress ring with current count
// in the center. Compact, glanceable. Pairs with copy on the right.

export function ChallengeCountdownCoin({ title, description, targetCount, currentCount, daysRemaining, rewardValue, isEmpty }: ChallengeProps) {
  if (isEmpty) {
    return (
      <div style={{ background: 'var(--color-card)', border: '1px dashed var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'center' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', margin: 0 }}>Şu an aktif görev yok</p>
      </div>
    )
  }

  const pct = targetCount > 0 ? Math.min(1, currentCount / targetCount) : 0
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)

  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
      <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
        <svg viewBox="0 0 88 88" style={{ width: '100%', height: '100%' }}>
          <circle cx="44" cy="44" r={radius} stroke="var(--color-stamp-empty)" strokeWidth="8" fill="none" />
          <circle cx="44" cy="44" r={radius} stroke="var(--color-brand)" strokeWidth="8" fill="none" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 44 44)" style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.34,1.56,0.64,1)' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '7cqw', fontWeight: 800, color: 'var(--color-text)', margin: 0, lineHeight: 1, letterSpacing: '-0.04em' }}>{currentCount}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: '2px 0 0', letterSpacing: '0.1em' }}>/ {targetCount}</p>
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>Görev</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.2 }}>{title}</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-secondary)', margin: '6px 0 0', lineHeight: 1.4 }}>{description}</p>
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginTop: 'var(--space-sm)' }}>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600 }}>{daysRemaining}g</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', margin: 0, fontWeight: 700 }}>+{rewardValue} ödül</p>
        </div>
      </div>
    </div>
  )
}

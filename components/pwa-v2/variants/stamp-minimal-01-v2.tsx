'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Minimal 01 v2 — Hero number + thin progress line + numbered ticks below.

export function StampMinimal01V2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0 }}>Loyalty</p>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="brand" />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '18cqw', lineHeight: 0.9, fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.04em', margin: 0 }}>{current}</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', color: 'var(--color-text-faint)', fontWeight: 400, letterSpacing: '-0.02em', margin: 0 }}>/ {total}</p>
      </div>
      <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)' }}>{remaining > 0 ? `${remaining} more for ${rewardName.toLowerCase()}` : `Claim your ${rewardName.toLowerCase()}`}</p>
      <div style={{ position: 'relative', marginTop: 'var(--space-xl)' }}>
        <div style={{ height: 4, background: 'var(--color-stamp-empty)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct * 100}%`, background: 'var(--color-brand)', borderRadius: 2, transition: 'width 600ms cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>
        <div style={{ position: 'absolute', inset: '-6px 0 -6px 0', display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{ width: 2, height: 16, background: i < current ? 'var(--color-brand)' : 'var(--color-stamp-border)', transition: 'background 300ms' }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)' }}>
        {Array.from({ length: total }).map((_, i) => (
          <span key={i} style={{ color: i < current ? 'var(--color-brand)' : 'var(--color-text-faint)', fontWeight: i < current ? 700 : 500 }}>{String(i + 1).padStart(2, '0')}</span>
        ))}
      </div>
    </div>
  )
}

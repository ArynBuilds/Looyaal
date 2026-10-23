'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Minimal 02 v2 — Giant brand-colored number + secondary copy + dot row.

export function StampMinimal02V2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
      {streak !== undefined && (
        <div style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)' }}>
          <StreakBadge streak={streak} onClick={onStreakPress} tone="brand" />
        </div>
      )}
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', letterSpacing: '0.3em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Earn · {rewardName}</p>
      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: 'var(--space-sm)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: '38cqw', lineHeight: 0.85, fontWeight: 800, color: 'var(--color-brand)', letterSpacing: '-0.06em', margin: 0 }}>{String(current).padStart(2, '0')}</p>
        <div style={{ marginLeft: 'var(--space-sm)', marginTop: '6cqw' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '12cqw', lineHeight: 0.9, color: 'var(--color-text)', fontWeight: 400, letterSpacing: '-0.04em', margin: 0 }}>/ {total}</p>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>stamps</p>
        </div>
      </div>
      <p style={{ marginTop: 'var(--space-md)', fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', maxWidth: '85%' }}>{remaining > 0 ? `${remaining} more visits until your ${rewardName.toLowerCase()}.` : `Your ${rewardName.toLowerCase()} is ready.`}</p>
      <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--color-divider)', display: 'flex', gap: 6 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < current ? 'var(--color-brand)' : 'transparent', border: i < current ? 'none' : '1px solid var(--color-stamp-border)' }} />
        ))}
      </div>
    </div>
  )
}

'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Minimal 03 — Ultra-clean single row with thin progress line


export function StampMinimal03({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
    }}>
      {/* Top: number + reward on same line */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-lg)' }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--font-size-hero)',
          fontWeight: 'var(--font-weight-heading)',
          color: 'var(--color-text)',
          lineHeight: 1,
          letterSpacing: 'var(--letter-spacing)',
        }}>
          {current}<span style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-text-faint)', fontWeight: 400 }}>/{total}</span>
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600 }}>Ödül: {rewardName}</p>
        </div>
      </div>

      {/* Single row of small dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            width: 10,
            height: 10,
            borderRadius: 'var(--radius-stamp)',
            transition: 'var(--transition-fast)',
            ...(i < current ? {
              background: 'var(--color-brand)',
            } : {
              background: 'var(--color-stamp-empty)',
              border: '1px solid var(--color-stamp-border)',
            }),
          }} />
        ))}
      </div>

      {/* Thin progress line */}
      <div style={{
        height: 1,
        background: 'var(--color-divider)',
        borderRadius: 1,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          background: 'var(--color-brand)',
          transition: 'var(--transition)',
        }} />
      </div>

      {/* Footer */}
      <p style={{
        fontSize: 'var(--font-size-tiny)',
        color: 'var(--color-text-muted)',
        marginTop: 'var(--space-sm)',
      }}>
        {remaining > 0 ? `${remaining} damga topla, ${rewardName.toLowerCase()} senin!` : `Tebrikler! ${rewardName} kazandin!`}
      </p>
    </div>
  )
}

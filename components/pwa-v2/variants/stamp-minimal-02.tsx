'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Minimal 02 — Typography-driven card: large fraction + vertical bar indicators


export function StampMinimal02({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
    }}>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
        <p style={{
          fontSize: 'var(--font-size-tiny)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
        }}>Sadakat Karti</p>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
      </div>

      {/* Large fraction display */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--space-xs)',
        marginBottom: 'var(--space-xl)',
      }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'calc(var(--font-size-hero) * 1.8)',
          color: 'var(--color-brand)',
          lineHeight: 1,
          letterSpacing: 'var(--letter-spacing)',
        }}>{current}</p>
        <p style={{
          fontSize: 'var(--font-size-h1)',
          color: 'var(--color-text-faint)',
          fontWeight: 300,
        }}>/</p>
        <p style={{
          fontSize: 'var(--font-size-h1)',
          color: 'var(--color-text-faint)',
          fontWeight: 300,
        }}>{total}</p>
      </div>

      {/* Vertical bar indicators */}
      <div style={{
        display: 'flex',
        gap: 3,
        alignItems: 'flex-end',
        height: 28,
        marginBottom: 'var(--space-lg)',
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            borderRadius: 2,
            transition: 'var(--transition-fast)',
            height: i < current ? '100%' : '40%',
            background: i < current
              ? 'var(--color-brand)'
              : 'var(--color-stamp-empty)',
          }} />
        ))}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-divider)', marginBottom: 'var(--space-md)' }} />

      {/* Footer: reward + remaining */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

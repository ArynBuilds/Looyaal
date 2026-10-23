'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Minimal 01 — Flat, clean lines, no shadow, numbered empty slots


export function StampMinimal01({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)' }}>
          Sadakat Karti
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 700 }}>
            {current}/{total}
          </p>
        </div>
      </div>

      {/* Stamp grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-xs)' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            borderRadius: 'var(--radius-stamp)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)',
            ...(i < current
              ? { background: 'var(--color-brand)' }
              : i === total - 1
                ? { border: '1.5px solid var(--color-brand)', background: 'var(--color-brand-glow)' }
                : { border: '1px solid var(--color-stamp-border)', background: 'var(--color-stamp-empty)' }),
          }}>
            {i < current && (
              <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            {i === total - 1 && i >= current && (
              <svg width="35%" height="35%" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5"><path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /></svg>
            )}
            {i >= current && i < total - 1 && (
              <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--font-size-tiny)' }}>{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        marginTop: 'var(--space-sm)',
        height: 3,
        borderRadius: 2,
        background: 'var(--color-stamp-empty)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          borderRadius: 2,
          background: 'var(--color-brand)',
          transition: 'var(--transition)',
        }} />
      </div>

      {/* Reward text */}
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        marginTop: 'var(--space-sm)',
        textAlign: 'center',
      }}>
        {remaining > 0 ? `${remaining} damga topla, ${rewardName.toLowerCase()} senin!` : `Tebrikler! ${rewardName} kazandin!`}
      </p>
    </div>
  )
}

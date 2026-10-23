'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Minimal 04 — Full-width segmented bar with number overlay, ultra-minimal


export function StampMinimal04({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      position: 'relative',
    }}>
      {/* Streak badge — top-right corner inside card bounds */}
      {streak !== undefined && (
        <div style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)' }}>
          <StreakBadge streak={streak} onClick={onStreakPress} />
        </div>
      )}

      {/* Centered hero text */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'calc(var(--font-size-hero) * 1.2)',
          color: 'var(--color-text)',
          lineHeight: 1,
          letterSpacing: 'var(--letter-spacing)',
        }}>
          {current} <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--font-size-h1)' }}>of {total}</span>
        </p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600, marginTop: 'var(--space-sm)' }}>
          {rewardName}
        </p>
      </div>

      {/* Full-width segmented bar */}
      <div style={{ display: 'flex', gap: 3 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            height: 8,
            borderRadius: 'var(--radius-sm)',
            transition: 'var(--transition-fast)',
            background: i < current
              ? 'var(--color-brand)'
              : 'var(--color-stamp-empty)',
          }} />
        ))}
      </div>

      {/* Subtle footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 'var(--space-md)',
      }}>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)' }}>
          {remaining > 0 ? `${remaining} damga topla, ${rewardName.toLowerCase()} senin!` : `Tebrikler! ${rewardName} kazandin!`}
        </p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)' }}>
          Sadakat Karti
        </p>
      </div>
    </div>
  )
}

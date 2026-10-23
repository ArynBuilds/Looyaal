'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Playful 01 — Colorful, bouncy feel, rounded, fun emoji-like icons


export function StampPlayful01({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0

  // Fun coffee cup icons for filled stamps
  const cupIcon = (
    <svg width="50%" height="50%" viewBox="0 0 24 24" fill="white" stroke="none">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <path d="M6 1v3M10 1v3M14 1v3" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  )

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '2px solid var(--color-brand-glow-strong)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Fun gradient accent at top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light), var(--color-brand))`,
        borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
      }} />

      {/* Streak badge — top-right corner */}
      {streak !== undefined && (
        <div style={{ position: 'absolute', top: 'var(--space-sm)', right: 'var(--space-sm)' }}>
          <StreakBadge streak={streak} onClick={onStreakPress} />
        </div>
      )}

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-md)', marginTop: 'var(--space-xs)' }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'var(--font-size-h2)',
          color: 'var(--color-text)',
          letterSpacing: 'var(--letter-spacing)',
        }}>
          {current} / {total}
        </p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600 }}>
          Ödül: {rewardName}
        </p>
      </div>

      {/* Stamp grid — big, bouncy circles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            aspectRatio: '1',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            transform: i < current ? 'scale(1)' : 'scale(0.9)',
            ...(i < current ? {
              background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-light))`,
              boxShadow: '0 2px 8px var(--color-brand-glow-strong)',
            } : i === total - 1 ? {
              border: '2px dashed var(--color-brand)',
              background: 'var(--color-brand-glow)',
            } : {
              border: '2px dotted var(--color-stamp-border)',
              background: 'var(--color-stamp-empty)',
            }),
          }}>
            {i < current && cupIcon}
            {i === total - 1 && i >= current && (
              <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2"><path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>
            )}
            {i >= current && i < total - 1 && (
              <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--font-size-tiny)', fontWeight: 700 }}>{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Segmented progress */}
      <div style={{ display: 'flex', gap: 2, marginTop: 'var(--space-md)' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            height: 4,
            flex: 1,
            borderRadius: 2,
            background: i < current
              ? `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))`
              : 'var(--color-stamp-empty)',
            transition: 'var(--transition)',
          }} />
        ))}
      </div>

      {/* Footer */}
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-secondary)',
        marginTop: 'var(--space-sm)',
        textAlign: 'center',
        fontWeight: 500,
      }}>
        {remaining > 0 ? `Sadece ${remaining} damga kaldı!` : 'Harikaa! Ödülün hazır!'}
      </p>
    </div>
  )
}

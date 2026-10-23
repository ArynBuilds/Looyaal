'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Playful 02 — Horizontal scroll strip with big bouncy stamps


export function StampPlayful02({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: `var(--space-lg) 0`,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ padding: `0 var(--space-lg)`, marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-xs)' }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              fontSize: 'var(--font-size-hero)',
              color: 'var(--color-brand)',
              lineHeight: 1,
            }}>{current}</p>
            <p style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-text-muted)', fontWeight: 400 }}>/ {total}</p>
          </div>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)' }}>
            {remaining > 0 ? `${remaining} damga daha topla!` : 'Harikaa! Ödülün hazır!'}
          </p>
        </div>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
      </div>

      {/* Horizontal scroll strip */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-sm)',
        overflowX: 'auto',
        padding: `var(--space-sm) var(--space-lg)`,
        scrollbarWidth: 'none',
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flexShrink: 0,
            width: 52,
            height: 52,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            transform: i < current ? 'scale(1)' : 'scale(0.85)',
            ...(i < current ? {
              background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-light))`,
              boxShadow: '0 3px 12px var(--color-brand-glow-strong)',
            } : i === total - 1 ? {
              border: '2.5px dashed var(--color-brand)',
              background: 'var(--color-brand-glow)',
            } : {
              border: '2px dotted var(--color-stamp-border)',
              background: 'var(--color-stamp-empty)',
            }),
          }}>
            {i < current ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white" stroke="none">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              </svg>
            ) : i === total - 1 ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5">
                <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" />
              </svg>
            ) : (
              <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text-faint)' }}>{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Reward bar */}
      <div style={{
        margin: `var(--space-md) var(--space-lg) 0`,
        padding: 'var(--space-sm) var(--space-md)',
        background: 'var(--color-brand-glow)',
        borderRadius: 'var(--radius-button)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600 }}>Ödül: {rewardName}</p>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>
      </div>
    </div>
  )
}

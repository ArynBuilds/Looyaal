'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Playful 03 — Stacked badges with fun progress steps


export function StampPlayful03({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '2px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: -30,
        right: -30,
        width: 100,
        height: 100,
        borderRadius: '50%',
        background: 'var(--color-brand-glow)',
        pointerEvents: 'none',
      }} />

      {/* Header with emoji-style badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)', position: 'relative' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-light))`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px var(--color-brand-glow-strong)',
        }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{current}</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-h1)',
            color: 'var(--color-text)',
            letterSpacing: 'var(--letter-spacing)',
          }}>
            {remaining > 0 ? `${remaining} Damga Kaldı!` : 'Harikaa!'}
          </p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)' }}>Ödül: {rewardName}</p>
        </div>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
      </div>

      {/* Step progress — connected nodes */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {/* Node */}
            <div style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
              ...(i < current ? {
                background: 'var(--color-brand)',
                boxShadow: '0 0 8px var(--color-brand-glow-strong)',
              } : i === current ? {
                border: '2px solid var(--color-brand)',
                background: 'var(--color-brand-glow)',
              } : {
                background: 'var(--color-stamp-empty)',
                border: '1px solid var(--color-stamp-border)',
              }),
            }}>
              {i < current && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </div>
            {/* Connector line */}
            {i < total - 1 && (
              <div style={{
                flex: 1,
                height: 2,
                background: i < current ? 'var(--color-brand)' : 'var(--color-divider)',
                transition: 'var(--transition)',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Gradient progress bar */}
      <div style={{
        marginTop: 'var(--space-lg)',
        height: 6,
        borderRadius: 3,
        background: 'var(--color-stamp-empty)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct * 100}%`,
          borderRadius: 3,
          background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))`,
          transition: 'var(--transition)',
        }} />
      </div>
    </div>
  )
}

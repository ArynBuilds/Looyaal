'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Realistic 03 — Split card: left shows big number, right shows stamp grid


export function StampRealistic03({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      display: 'flex',
      overflow: 'hidden',
    }}>
      {/* Left: big number + brand accent */}
      <div style={{
        width: '35%',
        background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))`,
        padding: 'var(--space-xl)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <p style={{ fontSize: 'calc(var(--font-size-hero) * 1.5)', fontWeight: 900, color: 'white', lineHeight: 1 }}>{current}</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'rgba(255,255,255,0.7)', marginTop: 'var(--space-xs)' }}>/ {total} puan</p>
      </div>

      {/* Right: stamps + info */}
      <div style={{ flex: 1, padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-label)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--letter-spacing-label)',
          }}>Sadakat Karti</p>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
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
              ...(i < current ? {
                background: 'var(--color-brand)',
              } : {
                border: '1px solid var(--color-stamp-border)',
                background: 'var(--color-stamp-empty)',
              }),
            }}>
              {i < current && (
                <svg width="55%" height="55%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              )}
            </div>
          ))}
        </div>

        {/* Reward */}
        <div style={{
          marginTop: 'var(--space-md)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)' }}>
            {remaining > 0 ? `${remaining} damga kaldı` : 'Hazır!'}
          </p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 700 }}>
            {rewardName}
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Realistic 02 — Horizontal loyalty card feel, like a physical punch card


export function StampRealistic02({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Card header band */}
      <div style={{
        background: 'var(--color-brand)',
        padding: `var(--space-md) var(--space-lg)`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', fontSize: 'var(--font-size-h2)', color: 'white', letterSpacing: 'var(--letter-spacing)' }}>
            Sadakat Karti
          </p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
            Ödül: {rewardName}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="contrast" />}
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 'var(--radius-sm)',
            padding: `var(--space-xs) var(--space-sm)`,
          }}>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 800, color: 'white' }}>{current}/{total}</p>
          </div>
        </div>
      </div>

      {/* Stamp area */}
      <div style={{ padding: 'var(--space-lg)' }}>
        {/* Two rows of stamps */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.ceil(total / 2)}, 1fr)`, gap: 'var(--space-sm)' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              aspectRatio: '1',
              borderRadius: 'var(--radius-stamp)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
              ...(i < current ? {
                background: 'var(--color-brand)',
                boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
              } : i === total - 1 ? {
                background: 'var(--color-brand-glow)',
                border: '2px solid var(--color-brand)',
              } : {
                background: 'var(--color-stamp-empty)',
                border: '1.5px dashed var(--color-stamp-border)',
              }),
            }}>
              {i < current && (
                <svg width="45%" height="45%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
              )}
              {i === total - 1 && i >= current && (
                <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
              )}
              {i >= current && i < total - 1 && (
                <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--font-size-tiny)' }}>{i + 1}</span>
              )}
            </div>
          ))}
        </div>

        {/* Bottom info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'var(--space-md)',
          paddingTop: 'var(--space-sm)',
          borderTop: '1px solid var(--color-divider)',
        }}>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>
            {remaining > 0 ? `${remaining} damga kaldı` : 'Hazır!'}
          </p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 600 }}>
            Ödül: {rewardName}
          </p>
        </div>
      </div>
    </div>
  )
}

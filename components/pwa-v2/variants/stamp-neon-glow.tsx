'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Neon Glow — Dark card with neon brand-colored outlines and glow effects


export function StampNeonGlow({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  return (
    <div style={{
      background: 'var(--color-bg)',
      border: '1px solid var(--color-brand)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      boxShadow: `0 0 20px var(--color-brand-glow), inset 0 0 20px var(--color-brand-glow)`,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'var(--font-size-h2)',
          color: 'var(--color-brand)',
          letterSpacing: 'var(--letter-spacing)',
          textShadow: '0 0 10px var(--color-brand-glow-strong)',
        }}>Sadakat Karti</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak !== undefined && (
            <StreakBadge
              streak={streak}
              onClick={onStreakPress}
              tone="brand"
              style={{ boxShadow: '0 0 10px var(--color-brand-glow-strong)' }}
            />
          )}
          <p style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 800,
            color: 'var(--color-brand)',
            textShadow: '0 0 10px var(--color-brand-glow-strong)',
          }}>{current}/{total}</p>
        </div>
      </div>

      {/* Neon stamp grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
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
              boxShadow: `0 0 12px var(--color-brand-glow-strong), 0 0 4px var(--color-brand)`,
            } : i === total - 1 ? {
              border: '1.5px solid var(--color-brand)',
              boxShadow: `0 0 8px var(--color-brand-glow)`,
            } : {
              border: '1px solid var(--color-brand)',
              opacity: 0.25,
            }),
          }}>
            {i < current && (
              <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            {i === total - 1 && i >= current && (
              <svg width="35%" height="35%" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Footer with glow text */}
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-brand)',
        marginTop: 'var(--space-lg)',
        textAlign: 'center',
        textShadow: '0 0 8px var(--color-brand-glow)',
      }}>
        {remaining > 0 ? `${remaining} damga daha, ${rewardName.toLowerCase()} senin!` : 'Tebrikler! Ödülün hazır!'}
      </p>
    </div>
  )
}

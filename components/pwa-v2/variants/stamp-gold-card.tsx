'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Gold Card — Premium metallic credit card look with gold/silver gradient


export function StampGoldCard({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0

  return (
    <div style={{
      background: `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand), var(--color-brand-light), var(--color-brand))`,
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      position: 'relative',
      overflow: 'hidden',
      aspectRatio: '1.8 / 1',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxShadow: '0 8px 32px var(--color-brand-glow-strong)',
    }}>
      {/* Shimmer overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '-50%',
        width: '200%',
        height: '100%',
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Top row */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-h2)',
            color: 'white',
            letterSpacing: 'var(--letter-spacing)',
          }}>Sadakat Karti</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="ghost" />}
          {/* Chip icon */}
          <div style={{
            width: 36,
            height: 28,
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            border: '1px solid rgba(255,255,255,0.2)',
          }} />
        </div>
      </div>

      {/* Stamp row — small circles */}
      <div style={{ position: 'relative', display: 'flex', gap: 'var(--space-xs)', margin: `var(--space-lg) 0` }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            aspectRatio: '1',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition-fast)',
            ...(i < current ? {
              background: 'rgba(255,255,255,0.9)',
              boxShadow: '0 0 8px rgba(255,255,255,0.4)',
            } : {
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
            }),
          }}>
            {i < current && (
              <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            )}
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.7)' }}>
          {remaining > 0 ? `${remaining} damga kaldı` : 'Tamamlandı!'}
        </p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
          Ödül: {rewardName}
        </p>
      </div>
    </div>
  )
}

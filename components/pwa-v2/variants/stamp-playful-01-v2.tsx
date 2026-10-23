'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Playful 01 v2 — 3D bouncy circles with idle wiggle. Latest stamp pops in.

export function StampPlayful01V2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  return (
    <div style={{ background: 'linear-gradient(160deg, var(--color-brand-glow) 0%, var(--color-card) 70%)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, margin: 0 }}>{current} <span style={{ color: 'var(--color-text-faint)', fontWeight: 500 }}>/ {total}</span></p>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>{rewardName} reward</p>
        </div>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="brand" />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current
          const isLatest = i === current - 1
          return (
            <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', background: filled ? 'radial-gradient(circle at 30% 25%, var(--color-brand-light) 0%, var(--color-brand) 60%, var(--color-brand-dark) 100%)' : 'var(--color-stamp-empty)', border: filled ? 'none' : '1px solid var(--color-stamp-border)', boxShadow: filled ? 'inset 0 -3px 6px rgba(0,0,0,0.15), inset 0 3px 6px rgba(255,255,255,0.3), 0 4px 10px var(--color-brand-glow)' : 'inset 0 1px 2px rgba(0,0,0,0.04)', animation: isLatest ? 'sp01v2-pop 600ms cubic-bezier(0.34,1.56,0.64,1)' : filled ? 'sp01v2-wiggle 6s ease-in-out infinite' : 'none', animationDelay: filled && !isLatest ? `${i * 0.2}s` : '0s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '4.6cqw', fontWeight: filled ? 900 : 600, color: filled ? 'rgba(255,255,255,0.95)' : 'var(--color-text-faint)' }}>{i + 1}</span>
            </div>
          )
        })}
      </div>
      <p style={{ marginTop: 'var(--space-md)', textAlign: 'center', fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{remaining > 0 ? `Just ${remaining} more — yum` : 'Time to redeem!'}</p>
      <style>{`@keyframes sp01v2-pop { 0%{transform:scale(0.3)} 50%{transform:scale(1.25)} 100%{transform:scale(1)} } @keyframes sp01v2-wiggle { 0%,100%{transform:rotate(0) scale(1)} 25%{transform:rotate(-2deg) scale(1.02)} 75%{transform:rotate(2deg) scale(1.02)} }`}</style>
    </div>
  )
}

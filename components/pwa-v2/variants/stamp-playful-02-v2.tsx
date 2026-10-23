'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Playful 02 v2 — Sticker book. Each stamp is a slightly tilted star sticker with peeled corner.

export function StampPlayful02V2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', backgroundImage: 'radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1.5px)', backgroundSize: '14px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', color: 'var(--color-text)', fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Sticker Book</p>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="brand" />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-md)' }}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current
          const isLatest = i === current - 1
          const tilt = (i * 13) % 7 - 3
          return (
            <div key={i} style={{ aspectRatio: '1', position: 'relative', transform: filled ? `rotate(${tilt}deg)` : 'none', animation: isLatest ? 'sp02v2-stick 500ms cubic-bezier(0.34,1.56,0.64,1)' : 'none' }}>
              {filled ? (
                <div style={{ width: '100%', height: '100%', borderRadius: '20% 22% 18% 24%', background: 'radial-gradient(circle at 30% 30%, var(--color-brand-light) 0%, var(--color-brand) 100%)', border: '2px solid white', boxShadow: '0 4px 6px rgba(0,0,0,0.15), 0 1px 0 rgba(255,255,255,0.4) inset', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: '5cqw', fontWeight: 900, color: 'white', textShadow: '0 1px 0 rgba(0,0,0,0.15)' }}>★</span>
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: '30%', height: '30%', background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.18) 50%)', borderBottomRightRadius: '20%' }} />
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', borderRadius: '20% 22% 18% 24%', border: '2px dashed var(--color-stamp-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-label)', color: 'var(--color-text-faint)', fontWeight: 700 }}>{i + 1}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p style={{ marginTop: 'var(--space-md)', textAlign: 'center', fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)' }}>{remaining > 0 ? `${remaining} stickers away from ${rewardName.toLowerCase()}` : `${rewardName} unlocked!`}</p>
      <style>{`@keyframes sp02v2-stick { 0%{transform:scale(1.6) rotate(20deg);opacity:0} 60%{transform:scale(1.05) rotate(-3deg);opacity:1} 100%{transform:scale(1) rotate(-3deg);opacity:1} }`}</style>
    </div>
  )
}

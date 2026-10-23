'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Playful 03 v2 — Brand-colored hero card with falling confetti and oversized number.

export function StampPlayful03V2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg)', background: 'linear-gradient(140deg, var(--color-brand-dark) 0%, var(--color-brand) 50%, var(--color-brand-light) 100%)', color: 'white', overflow: 'hidden', boxShadow: 'var(--shadow-card), 0 10px 30px var(--color-brand-glow-strong)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {Array.from({ length: 18 }).map((_, i) => {
          const left = (i * 53) % 100
          const top = (i * 37) % 100
          const size = 4 + (i % 4) * 2
          const colors = ['rgba(255,255,255,0.85)', 'var(--color-brand-light)', 'rgba(255,255,255,0.4)']
          return <div key={i} style={{ position: 'absolute', left: `${left}%`, top: `${top}%`, width: size, height: size * 1.8, background: colors[i % 3], borderRadius: 1, transform: `rotate(${(i * 47) % 360}deg)`, animation: `sp03v2-confetti ${4 + (i % 4)}s linear ${i * 0.3}s infinite` }} />
        })}
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.85, margin: 0 }}>Coffee Card</p>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="contrast" />}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', marginTop: 6, gap: 8 }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: '24cqw', lineHeight: 0.85, fontWeight: 900, letterSpacing: '-0.05em', margin: 0 }}>{current}</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', opacity: 0.7, fontWeight: 500, margin: 0 }}>of {total}</p>
        </div>
        <p style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--font-size-body)', opacity: 0.95, fontWeight: 500, margin: 'var(--space-xs) 0 0' }}>{remaining > 0 ? `${remaining} to go for your free ${rewardName.toLowerCase()}` : `${rewardName} unlocked!`}</p>
        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', gap: 4 }}>
          {Array.from({ length: total }).map((_, i) => (<div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: i < current ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.25)' }} />))}
        </div>
      </div>
      <style>{`@keyframes sp03v2-confetti { 0%{transform:translateY(-20%) rotate(0);opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{transform:translateY(120%) rotate(360deg);opacity:0} }`}</style>
    </div>
  )
}

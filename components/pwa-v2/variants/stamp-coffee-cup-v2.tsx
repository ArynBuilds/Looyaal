'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Coffee Cup v2 — Side-by-side cup illustration that fills with brand color + steam wisps when >30% full.

export function StampCoffeeCupV2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0
  return (
    <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg)', display: 'flex', gap: 'var(--space-xl)', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: 96, height: 120, flexShrink: 0 }}>
        <svg width="96" height="120" viewBox="0 0 96 120" fill="none" style={{ overflow: 'visible' }}>
          <defs>
            <clipPath id="cupClipCCv2">
              <path d="M14 22 H62 V92 Q62 108 50 108 H26 Q14 108 14 92 Z" />
            </clipPath>
          </defs>
          {pct > 0.3 && (
            <g opacity="0.45" style={{ animation: 'cupv2-steam 3.5s ease-in-out infinite' }}>
              <path d="M28 14 Q31 8 28 2" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M40 18 Q43 10 40 2" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              <path d="M52 14 Q55 8 52 2" stroke="var(--color-brand)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}
          <ellipse cx="38" cy="113" rx="32" ry="3" fill="rgba(0,0,0,0.08)" />
          <path d="M14 22 H62 V92 Q62 108 50 108 H26 Q14 108 14 92 Z" fill="var(--color-card)" stroke="var(--color-card-border)" strokeWidth="1.5" />
          <path d="M62 38 Q86 38 86 60 Q86 82 62 82" stroke="var(--color-card-border)" strokeWidth="2" fill="none" />
          <g clipPath="url(#cupClipCCv2)">
            <rect x="14" y={22 + (86 * (1 - pct))} width="48" height={86 * pct + 2} fill="var(--color-brand)" style={{ transition: 'y 600ms cubic-bezier(0.34,1.56,0.64,1)' }} />
            {pct > 0 && (<path d={`M14 ${22 + 86 * (1 - pct) - 2} q 12 -4 24 0 t 24 0`} stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" fill="none" />)}
          </g>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>{rewardName}</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', color: 'var(--color-text)', lineHeight: 0.95, fontWeight: 800, letterSpacing: '-0.04em', margin: '4px 0 0' }}>{current}<span style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-text-faint)', fontWeight: 400 }}>/{total}</span></p>
          </div>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="brand" />}
        </div>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: 'var(--space-sm) 0 0' }}>{remaining > 0 ? `${remaining} more for your free ${rewardName.toLowerCase()}` : 'Reward ready'}</p>
        <div style={{ display: 'flex', gap: 4, marginTop: 'var(--space-md)' }}>
          {Array.from({ length: total }).map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < current ? 'var(--color-brand)' : 'var(--color-stamp-empty)' }} />))}
        </div>
      </div>
      <style>{`@keyframes cupv2-steam { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-3px);opacity:0.7} }`}</style>
    </div>
  )
}

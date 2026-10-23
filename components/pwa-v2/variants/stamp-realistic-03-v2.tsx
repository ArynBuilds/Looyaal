'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Realistic 03 v2 — Wax-seal almanac. Dark brand-tinted background with embossed seal stamps.

export function StampRealistic03V2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg) var(--space-lg)', background: 'radial-gradient(140% 80% at 50% 0%, var(--color-brand-dark) 0%, #110a04 100%)', color: '#f4e8d4', overflow: 'hidden', boxShadow: 'var(--shadow-card), inset 0 0 0 1px rgba(255,220,160,0.12), inset 0 0 60px rgba(0,0,0,0.4)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,220,160,0.05) 1px, transparent 1px)', backgroundSize: '4px 4px', opacity: 0.7 }} />
      <div aria-hidden style={{ position: 'absolute', inset: 'var(--space-md)', border: '0.5px solid rgba(255,210,140,0.35)', borderRadius: 'calc(var(--radius-card) - 6px)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(244,232,212,0.6)', margin: 0 }}>· The Loyalty Almanac ·</p>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 700, margin: '6px 0 0', letterSpacing: '-0.01em', color: '#f9eed7' }}>{rewardName}</p>
        <div style={{ margin: '8px auto 0', width: '40%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,210,140,0.5), transparent)' }} />
      </div>
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current
          const isLatest = i === current - 1
          return (
            <div key={i} style={{ aspectRatio: '1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: filled ? 'none' : '1px dashed rgba(255,210,140,0.3)', background: filled ? 'transparent' : 'rgba(0,0,0,0.25)' }}>
              {filled ? (
                <div style={{ position: 'absolute', inset: '4%', borderRadius: '50%', background: 'radial-gradient(circle at 35% 35%, var(--color-brand-light) 0%, var(--color-brand) 50%, var(--color-brand-dark) 100%)', boxShadow: '0 1px 0 rgba(255,255,255,0.2) inset, 0 -2px 4px rgba(0,0,0,0.3) inset, 0 2px 4px rgba(0,0,0,0.4)', transform: `rotate(${(i * 17) % 12 - 6}deg)`, animation: isLatest ? 'sr03v2-drop 500ms cubic-bezier(0.34,1.56,0.64,1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: '15%', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontWeight: 900, fontSize: '4cqw', color: 'rgba(255,255,255,0.85)' }}>✦</div>
                </div>
              ) : (<span style={{ color: 'rgba(255,210,140,0.4)', fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>)}
            </div>
          )
        })}
      </div>
      <div style={{ position: 'relative', marginTop: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-label)', fontStyle: 'italic', color: 'rgba(244,232,212,0.7)', margin: 0 }}>{remaining > 0 ? `${remaining} seals remain` : 'Almanac complete'}</p>
        {streak !== undefined ? <StreakBadge streak={streak} onClick={onStreakPress} tone="contrast" /> : <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 800, letterSpacing: '0.1em', margin: 0 }}>{current}/{total}</p>}
      </div>
      <style>{`@keyframes sr03v2-drop { 0%{transform:translateY(-30%) scale(0.6) rotate(0deg);opacity:0} 60%{transform:translateY(0) scale(1.1) rotate(-3deg);opacity:1} 100%{transform:translateY(0) scale(1) rotate(-2deg);opacity:1} }`}</style>
    </div>
  )
}

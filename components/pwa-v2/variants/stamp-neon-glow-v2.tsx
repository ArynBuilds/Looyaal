'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Neon Glow v2 — "Open Late" neon sign feel: dark deep purple bg with pulsing brand-colored neon outlines.

export function StampNeonGlowV2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg)', background: 'radial-gradient(120% 90% at 50% 0%, #15131f 0%, #0b0a14 100%)', color: '#f4f0ff', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 'var(--space-md)', borderRadius: 'calc(var(--radius-card) - 8px)', border: '1.5px solid var(--color-brand)', boxShadow: '0 0 12px var(--color-brand-glow-strong), inset 0 0 12px var(--color-brand-glow), 0 0 24px var(--color-brand-glow)', pointerEvents: 'none', animation: 'sngv2-pulse 3s ease-in-out infinite' }} />
      <div style={{ position: 'relative' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(244,240,255,0.5)', fontWeight: 600, margin: 0 }}>· OPEN LATE ·</p>
        <p style={{ fontFamily: '"Brush Script MT", cursive', fontSize: '14cqw', fontStyle: 'italic', color: 'var(--color-brand)', textShadow: '0 0 8px var(--color-brand), 0 0 20px var(--color-brand-glow-strong), 0 0 36px var(--color-brand-glow)', margin: '4px 0 0', lineHeight: 1, fontWeight: 400, letterSpacing: '-0.02em' }}>{rewardName}</p>
        <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
          {Array.from({ length: total }).map((_, i) => {
            const filled = i < current
            return <div key={i} style={{ aspectRatio: '1', borderRadius: '50%', border: filled ? '2px solid var(--color-brand)' : '1px solid rgba(244,240,255,0.18)', background: filled ? 'rgba(0,0,0,0.4)' : 'transparent', boxShadow: filled ? '0 0 8px var(--color-brand), inset 0 0 8px var(--color-brand-glow-strong), 0 0 16px var(--color-brand-glow)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '4cqw', fontWeight: 700, color: filled ? 'var(--color-brand)' : 'rgba(244,240,255,0.3)', textShadow: filled ? '0 0 6px var(--color-brand)' : 'none' }}>{i + 1}</span>
            </div>
          })}
        </div>
        <div style={{ marginTop: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 700, letterSpacing: '0.15em', textShadow: '0 0 6px var(--color-brand-glow-strong)', margin: 0 }}>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</p>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="contrast" />}
        </div>
      </div>
      <style>{`@keyframes sngv2-pulse { 0%,100%{opacity:1} 50%{opacity:0.85} }`}</style>
    </div>
  )
}

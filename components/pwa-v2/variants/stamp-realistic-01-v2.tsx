'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Realistic 01 v2 — Letterpress on cream paper, dotted texture, latest stamp gets a press animation.

export function StampRealistic01V2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const cols = total <= 8 ? total : Math.ceil(total / 2)
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg) var(--space-lg)', background: 'radial-gradient(120% 60% at 50% 0%, var(--color-brand-glow) 0%, #faf5ec 60%), #faf5ec', boxShadow: 'var(--shadow-card), inset 0 0 0 1px rgba(60,40,20,0.06)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(80,50,20,0.05) 1px, transparent 1px)', backgroundSize: '3px 3px', opacity: 0.5, mixBlendMode: 'multiply' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-md)' }}>
        <div>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-label)', color: 'rgba(60,40,20,0.6)', letterSpacing: '0.28em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>Reward Card · No. 001</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', color: '#2b1d10', fontWeight: 'var(--font-weight-heading)', lineHeight: 1.05, margin: '4px 0 0', letterSpacing: '-0.01em' }}>{rewardName}</p>
        </div>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="brand" />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', margin: 'var(--space-sm) 0 var(--space-lg)' }}>
        <div style={{ flex: 1, height: 1, background: 'rgba(60,40,20,0.2)' }} />
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-label)', color: '#2b1d10', fontWeight: 700, letterSpacing: '0.15em', margin: 0 }}>{String(current).padStart(2, '0')} / {String(total).padStart(2, '0')}</p>
        <div style={{ flex: 1, height: 1, background: 'rgba(60,40,20,0.2)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 'var(--space-sm)' }}>
        {Array.from({ length: total }).map((_, i) => {
          const filled = i < current
          const isLatest = i === current - 1
          const isReward = i === total - 1
          return (
            <div key={i} style={{ aspectRatio: '1', position: 'relative', borderRadius: 'var(--radius-stamp)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: filled ? 'none' : isReward ? '1.5px dashed var(--color-brand)' : '1px dashed rgba(60,40,20,0.35)', background: filled ? 'transparent' : isReward ? 'var(--color-brand-glow)' : 'rgba(255,255,255,0.4)' }}>
              {filled && (
                <>
                  <div style={{ position: 'absolute', inset: '-6%', borderRadius: '50%', background: 'var(--color-brand)', opacity: 0.18, filter: 'blur(2px)' }} />
                  <div style={{ position: 'absolute', inset: '8%', borderRadius: '50%', background: 'var(--color-brand)', boxShadow: 'inset 0 0 0 1.5px var(--color-brand-dark)', transform: isLatest ? 'rotate(-6deg)' : `rotate(${(i * 13) % 7 - 3}deg)`, animation: isLatest ? 'sr01v2-press 600ms cubic-bezier(0.34,1.56,0.64,1)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '4.6cqw' }}>✦</div>
                </>
              )}
              {!filled && isReward && (<svg width="38%" height="38%" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.4"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>)}
              {!filled && !isReward && (<span style={{ fontFamily: 'var(--font-heading)', color: 'rgba(60,40,20,0.4)', fontSize: 'var(--font-size-tiny)', fontWeight: 600 }}>{String(i + 1).padStart(2, '0')}</span>)}
            </div>
          )
        })}
      </div>
      <p style={{ marginTop: 'var(--space-lg)', textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-label)', color: '#5a3f22', fontStyle: 'italic' }}>{remaining > 0 ? `${remaining} more to claim your ${rewardName.toLowerCase()}` : `Ready to redeem`}</p>
      <style>{`@keyframes sr01v2-press { 0%{transform:scale(0.4) rotate(-30deg);opacity:0} 50%{transform:scale(1.15) rotate(-3deg);opacity:0.9} 100%{transform:scale(1) rotate(-6deg);opacity:1} }`}</style>
    </div>
  )
}

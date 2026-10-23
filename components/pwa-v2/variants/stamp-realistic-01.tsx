'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Realistic 01 — 3D shadow card, embossed stamps, paper-like feel


export function StampRealistic01({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      boxShadow: 'var(--shadow-card)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--color-brand-glow)',
        opacity: 0.3,
        pointerEvents: 'none',
      }} />

      {/* Header with brand accent line */}
      <div style={{ position: 'relative', marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)', fontSize: 'var(--font-size-h2)', color: 'var(--color-text)', letterSpacing: 'var(--letter-spacing)' }}>
              Sadakat Karti
            </p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Ödül: {rewardName}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
            <div style={{
              width: 40, height: 40, borderRadius: 'var(--radius-sm)',
              background: 'var(--color-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 8px var(--color-brand-glow-strong)`,
            }}>
              <span style={{ color: 'white', fontSize: 'var(--font-size-body)', fontWeight: 800 }}>{current}</span>
            </div>
          </div>
        </div>
        <div style={{ height: 2, background: `linear-gradient(90deg, var(--color-brand), transparent)`, marginTop: 'var(--space-sm)', borderRadius: 1 }} />
      </div>

      {/* Stamp grid — embossed look */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-sm)' }}>
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
              boxShadow: `inset 0 -2px 4px rgba(0,0,0,0.2), 0 1px 3px var(--color-brand-glow)`,
            } : i === total - 1 ? {
              border: '2px dashed var(--color-brand)',
              background: 'var(--color-brand-glow)',
            } : {
              border: '1.5px dashed var(--color-stamp-border)',
              background: 'var(--color-stamp-empty)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
            }),
          }}>
            {i < current && (
              <svg width="45%" height="45%" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            )}
            {i === total - 1 && i >= current && (
              <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            )}
            {i >= current && i < total - 1 && (
              <span style={{ color: 'var(--color-text-faint)', fontSize: 'var(--font-size-tiny)', fontWeight: 600 }}>{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <p style={{
        position: 'relative',
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-secondary)',
        marginTop: 'var(--space-md)',
        textAlign: 'center',
        fontWeight: 500,
      }}>
        {remaining > 0 ? `${remaining} damga topla, ${rewardName.toLowerCase()} senin!` : `Tebrikler! ${rewardName} kazandin!`}
      </p>
    </div>
  )
}

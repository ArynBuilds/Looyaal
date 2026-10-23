'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Coffee Cup — Visual of a cup that fills up as stamps are collected


export function StampCoffeeCup({ current, total, rewardName, onStampPress, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const pct = total > 0 ? current / total : 0

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      display: 'flex',
      gap: 'var(--space-xl)',
      alignItems: 'center',
    }}>
      {/* Cup visual */}
      <div style={{ position: 'relative', width: 80, height: 100, flexShrink: 0 }}>
        <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
          {/* Cup body */}
          <path d="M10 15 H55 V85 Q55 95 45 95 H20 Q10 95 10 85 Z"
            fill="var(--color-stamp-empty)" stroke="var(--color-card-border)" strokeWidth="1.5" />
          {/* Handle */}
          <path d="M55 30 Q75 30 75 50 Q75 70 55 70" stroke="var(--color-card-border)" strokeWidth="1.5" fill="none" />
          {/* Fill level */}
          <clipPath id="cupClip">
            <path d="M10 15 H55 V85 Q55 95 45 95 H20 Q10 95 10 85 Z" />
          </clipPath>
          <rect x="10" y={15 + (80 * (1 - pct))} width="45" height={80 * pct}
            fill="var(--color-brand)" opacity="0.6" clipPath="url(#cupClip)"
            style={{ transition: 'y 0.5s ease, height 0.5s ease' }} />
          {/* Fill line */}
          <line x1="10" y1={15 + (80 * (1 - pct))} x2="55" y2={15 + (80 * (1 - pct))}
            stroke="var(--color-brand)" strokeWidth="2" opacity="0.8"
            style={{ transition: 'y1 0.5s ease, y2 0.5s ease' }} />
          {/* Steam lines (only when > 50%) */}
          {pct > 0.5 && (
            <>
              <path d="M25 10 Q27 5 25 0" stroke="var(--color-brand)" strokeWidth="1" opacity="0.3" fill="none" />
              <path d="M35 12 Q37 6 35 1" stroke="var(--color-brand)" strokeWidth="1" opacity="0.2" fill="none" />
              <path d="M45 10 Q47 5 45 0" stroke="var(--color-brand)" strokeWidth="1" opacity="0.3" fill="none" />
            </>
          )}
        </svg>
      </div>

      {/* Text content */}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-hero)',
            color: 'var(--color-text)',
            lineHeight: 1,
            letterSpacing: 'var(--letter-spacing)',
          }}>{current}<span style={{ fontSize: 'var(--font-size-h2)', color: 'var(--color-text-faint)', fontWeight: 400 }}>/{total}</span></p>
          {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} />}
        </div>

        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-secondary)',
          marginTop: 'var(--space-sm)',
        }}>
          {remaining > 0
            ? `${remaining} damga daha, ${rewardName.toLowerCase()} senin!`
            : 'Tebrikler! Ödülün hazır!'}
        </p>

        {/* Tiny stamp dots */}
        <div style={{ display: 'flex', gap: 3, marginTop: 'var(--space-md)' }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: i < current ? 'var(--color-brand)' : 'var(--color-stamp-empty)',
              border: i >= current ? '1px solid var(--color-stamp-border)' : 'none',
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

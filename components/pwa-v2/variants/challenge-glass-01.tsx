'use client'

import { Target, Gift } from 'lucide-react'
import type { ChallengeProps } from './challenge-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Challenge Glass — Frosted glass card with brand gradient overlay, premium feel

export function ChallengeGlass01({ title, description, targetCount, currentCount, daysRemaining, expiresAt, rewardValue, isEmpty }: ChallengeProps) {
  if (isEmpty) return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px dashed var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      textAlign: 'center',
    }}>
      <Target size={22} style={{ color: 'var(--color-text-muted)', margin: '0 auto 8px', opacity: 0.5 }} />
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', fontWeight: 600, opacity: 0.6 }}>
        Yakında görevler burada
      </p>
    </div>
  )

  const progress = Math.min(100, (currentCount / targetCount) * 100)

  return (
    <div style={{
      background: `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`,
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 4px 20px var(--color-brand-glow-strong)',
    }}>
      {/* Shimmer */}
      <div style={{
        position: 'absolute', top: 0, left: '-50%', width: '200%', height: '100%',
        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} style={{ color: 'white' }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              fontSize: 'var(--font-size-body)',
              color: 'white',
            }}>
              {title}
            </span>
          </div>
          <span style={{
            fontSize: 'var(--font-size-small)',
            color: '#ff6b6b',
            background: 'rgba(0, 0, 0, 0.5)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-button)',
          }}>
            {formatTimeRemaining(expiresAt) || `${daysRemaining} gün`}
          </span>
        </div>

        <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.7)', marginBottom: 14 }}>
          {description}
        </p>

        {/* Progress */}
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            height: '100%', width: `${progress}%`,
            transition: 'width 0.4s ease', borderRadius: 6,
            boxShadow: '0 0 8px rgba(255,255,255,0.3)',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-small)', fontWeight: 600, color: 'white' }}>
            {currentCount}/{targetCount}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Gift size={12} style={{ color: 'rgba(255,255,255,0.8)' }} />
            <span style={{ fontSize: 'var(--font-size-small)', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              {rewardValue} bonus puan
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

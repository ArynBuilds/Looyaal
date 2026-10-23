'use client'

import { Target, Gift } from 'lucide-react'
import type { ChallengeProps } from './challenge-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Challenge Card — Bordered card with brand accent, progress bar, reward preview

export function ChallengeCard01({ title, description, targetCount, currentCount, daysRemaining, expiresAt, rewardValue, isEmpty }: ChallengeProps) {
  if (isEmpty) return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px dashed var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      textAlign: 'center',
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 'var(--radius-sm)',
        background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 12px',
      }}>
        <Target size={22} style={{ color: 'var(--color-text-muted)', opacity: 0.5 }} />
      </div>
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', fontWeight: 600, opacity: 0.6 }}>
        Yakında görevler burada
      </p>
      <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)', marginTop: 4, opacity: 0.5 }}>
        Sana özel görevler hazırlanınca burada görünecek
      </p>
    </div>
  )

  const progress = Math.min(100, (currentCount / targetCount) * 100)

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Top accent */}
      <div style={{ height: 3, background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))` }} />

      <div style={{ padding: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Target size={18} style={{ color: 'var(--color-brand)' }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text)',
            }}>
              {title}
            </span>
          </div>
          <span style={{
            fontSize: 'var(--font-size-small)',
            color: '#ef4444',
            background: 'rgba(239, 68, 68, 0.1)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-button)',
          }}>
            {formatTimeRemaining(expiresAt) || `${daysRemaining} gün`}
          </span>
        </div>

        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', marginBottom: 14 }}>
          {description}
        </p>

        {/* Progress */}
        <div style={{ background: 'var(--color-bg)', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 8 }}>
          <div style={{
            background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))`,
            height: '100%', width: `${progress}%`,
            transition: 'width 0.4s ease',
            borderRadius: 6,
            boxShadow: progress > 20 ? '0 0 8px var(--color-brand-glow)' : 'none',
          }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-small)', fontWeight: 600, color: 'var(--color-text)' }}>
            {currentCount}/{targetCount}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Gift size={12} style={{ color: 'var(--color-brand)' }} />
            <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-brand)', fontWeight: 600 }}>
              {rewardValue} bonus puan
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

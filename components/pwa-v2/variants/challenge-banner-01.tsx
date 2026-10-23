'use client'

import { Target, ChevronRight } from 'lucide-react'
import type { ChallengeProps } from './challenge-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Challenge Banner — Full-width brand gradient with top accent line

export function ChallengeBanner01({ title, description, targetCount, currentCount, daysRemaining, expiresAt, isEmpty }: ChallengeProps) {
  if (isEmpty) return (
    <div style={{
      background: 'var(--color-brand-glow)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-xl)',
      textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'var(--color-card-border)' }} />
      <Target size={22} style={{ color: 'var(--color-text-muted)', margin: '0 auto 8px', opacity: 0.5 }} />
      <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)', fontWeight: 600, opacity: 0.6 }}>
        Yakında görevler burada
      </p>
    </div>
  )

  const progress = Math.min(100, (currentCount / targetCount) * 100)

  return (
    <div style={{
      background: 'var(--color-brand-glow)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 2px 12px var(--color-brand-glow)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))`,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Target size={16} style={{ color: 'var(--color-brand)' }} />
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              fontSize: 'var(--font-size-body)',
              color: 'var(--color-text)',
            }}>
              {title}
            </span>
          </div>
          <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', marginBottom: 14 }}>
            {description}
          </p>
        </div>
        <span style={{
          fontSize: 'var(--font-size-small)', color: '#ef4444',
          background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-button)',
        }}>
          {formatTimeRemaining(expiresAt) || `${daysRemaining} gün`}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1, background: 'var(--color-card)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
          <div style={{
            background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))`,
            height: '100%', width: `${progress}%`, transition: 'width 0.4s ease',
          }} />
        </div>
        <span style={{ fontSize: 'var(--font-size-small)', fontWeight: 700, color: 'var(--color-text)', flexShrink: 0 }}>
          {currentCount}/{targetCount}
        </span>
        <ChevronRight size={14} style={{ color: 'var(--color-text-muted)' }} />
      </div>
    </div>
  )
}

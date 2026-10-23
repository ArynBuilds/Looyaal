'use client'

import { Target, Gift } from 'lucide-react'
import type { ChallengeProps } from './challenge-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Challenge Ticket — Split layout with brand sidebar, like a concert ticket

export function ChallengeTicket01({ title, description, targetCount, currentCount, daysRemaining, expiresAt, isEmpty }: ChallengeProps) {
  if (isEmpty) return (
    <div style={{
      display: 'flex',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      border: '1px dashed var(--color-card-border)',
      opacity: 0.5,
    }}>
      <div style={{
        width: 56, flexShrink: 0,
        background: 'var(--color-bg)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
        padding: 'var(--space-sm)',
      }}>
        <Target size={20} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <div style={{ flex: 1, padding: 'var(--space-md)', background: 'var(--color-card)' }}>
        <p style={{ fontWeight: 600, fontSize: 'var(--font-size-body)', color: 'var(--color-text-muted)' }}>
          Yakında görevler burada
        </p>
      </div>
    </div>
  )

  const progress = Math.min(100, (currentCount / targetCount) * 100)

  return (
    <div style={{
      display: 'flex',
      borderRadius: 'var(--radius-card)',
      overflow: 'hidden',
      border: '1px solid var(--color-card-border)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Left sidebar */}
      <div style={{
        width: 56, flexShrink: 0,
        background: `linear-gradient(180deg, var(--color-brand), var(--color-brand-dark))`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        padding: 'var(--space-sm)',
      }}>
        <Target size={20} style={{ color: 'white' }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Görev
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 'var(--space-md)', background: 'var(--color-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-body)',
            color: 'var(--color-text)',
          }}>
            {title}
          </span>
          <span style={{ fontSize: 'var(--font-size-small)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-button)' }}>
            {formatTimeRemaining(expiresAt) || `${daysRemaining} gün`}
          </span>
        </div>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', marginBottom: 10 }}>
          {description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, background: 'var(--color-bg)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
            <div style={{
              background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))`,
              height: '100%', width: `${progress}%`, transition: 'width 0.3s ease',
            }} />
          </div>
          <span style={{ fontSize: 'var(--font-size-small)', fontWeight: 600, color: 'var(--color-text)' }}>
            {currentCount}/{targetCount}
          </span>
          <Gift size={12} style={{ color: 'var(--color-brand)' }} />
        </div>
      </div>
    </div>
  )
}

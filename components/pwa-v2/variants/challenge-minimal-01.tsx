'use client'

import { Target } from 'lucide-react'
import type { ChallengeProps } from './challenge-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Challenge Minimal — Compact single row, icon + title + progress + count

export function ChallengeMinimal01({ title, targetCount, currentCount, daysRemaining, expiresAt, isEmpty }: ChallengeProps) {
  if (isEmpty) return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 'var(--space-md)',
      background: 'var(--color-card)',
      border: '1px dashed var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      opacity: 0.5,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-sm)',
        background: 'var(--color-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Target size={18} style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <span style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)' }}>
        Yakında görevler burada
      </span>
    </div>
  )

  const progress = Math.min(100, (currentCount / targetCount) * 100)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: 'var(--space-md)',
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 'var(--radius-sm)',
        background: 'var(--color-brand-glow)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Target size={18} style={{ color: 'var(--color-brand)' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-label)', color: 'var(--color-text)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{title}</span>
          <span style={{ fontSize: 'var(--font-size-small)', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: 'var(--radius-button)', flexShrink: 0 }}>
            {formatTimeRemaining(expiresAt) || `${daysRemaining} gün`}
          </span>
        </div>
        <div style={{ background: 'var(--color-bg)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
          <div style={{
            background: 'var(--color-brand)', height: '100%',
            width: `${progress}%`, transition: 'width 0.3s ease',
          }} />
        </div>
      </div>
      <span style={{ fontSize: 'var(--font-size-small)', fontWeight: 700, color: 'var(--color-brand)', flexShrink: 0 }}>
        {currentCount}/{targetCount}
      </span>
    </div>
  )
}

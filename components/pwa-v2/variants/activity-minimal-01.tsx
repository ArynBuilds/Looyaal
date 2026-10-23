'use client'

// Activity Minimal 01 — Clean text-driven: big stat numbers, subtle visit list

import type { ActivityProps } from './activity-types'

export function ActivityMinimal01({ streak, totalVisits, totalRewards, lastVisits, memberSince }: ActivityProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Big stat numbers inline */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-xl)' }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-hero)',
            color: 'var(--color-text)',
            lineHeight: 1,
          }}>{totalVisits}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>ziyaret</p>
        </div>
        <div>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 'var(--font-weight-heading)',
            fontSize: 'var(--font-size-hero)',
            color: 'var(--color-brand)',
            lineHeight: 1,
          }}>{totalRewards}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>ödül</p>
        </div>
        {streak > 0 && (
          <div>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 'var(--font-weight-heading)',
              fontSize: 'var(--font-size-hero)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1,
            }}>{streak}</p>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>bu hafta</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-divider)' }} />

      {/* Visit list — just text, no cards */}
      <div>
        <p style={{
          fontSize: 'var(--font-size-tiny)',
          color: 'var(--color-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
          marginBottom: 'var(--space-sm)',
        }}>Son ziyaretler</p>
        {lastVisits.map((v, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: `var(--space-xs) 0`,
          }}>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>{v.date}</p>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-faint)' }}>{v.location}</p>
          </div>
        ))}
      </div>

      {/* Member since */}
      <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)' }}>
        {memberSince} tarihinden beri üye
      </p>
    </div>
  )
}

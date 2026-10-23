'use client'

// Campaign Split 01 — Left: brand-colored discount block, Right: description

import type { CampaignProps } from './campaign-types'

export function CampaignSplit01({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
      }}>Kampanyalar</p>

      {campaigns.map(c => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          display: 'flex',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          border: '1px solid var(--color-card-border)',
        }}>
          {/* Discount block */}
          <div style={{
            width: 90,
            background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
            flexShrink: 0,
          }}>
            {c.discount_text ? (
              <p style={{ fontSize: 'var(--font-size-h1)', fontWeight: 900, color: 'white', textAlign: 'center', lineHeight: 1.1 }}>{c.discount_text}</p>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" />
              </svg>
            )}
          </div>
          {/* Description */}
          <div style={{
            flex: 1,
            padding: 'var(--space-lg)',
            background: 'var(--color-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--font-size-body)',
              fontWeight: 'var(--font-weight-heading)',
              color: 'var(--color-text)',
              letterSpacing: 'var(--letter-spacing)',
            }}>{c.name}</p>
            {c.description && (
              <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>{c.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

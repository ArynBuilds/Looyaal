'use client'

// Campaign Banner 01 — Full-width stacked banners with brand gradient accent

import type { CampaignProps } from './campaign-types'

export function CampaignBanner01({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
        marginBottom: 'var(--space-md)',
      }}>Kampanyalar</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {campaigns.map(c => (
          <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            background: 'var(--color-card)',
            border: '1px solid var(--color-card-border)',
            display: 'flex',
          }}>
            {/* Brand accent strip */}
            <div style={{
              width: 4,
              background: `linear-gradient(180deg, var(--color-brand), var(--color-brand-light))`,
              flexShrink: 0,
            }} />
            {/* Content */}
            <div style={{ flex: 1, padding: `var(--space-md) var(--space-lg)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-heading)',
                  color: 'var(--color-text)',
                  letterSpacing: 'var(--letter-spacing)',
                }}>{c.name}</p>
                {c.description && (
                  <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 2 }}>{c.description}</p>
                )}
              </div>
              {c.discount_text && (
                <div style={{
                  background: 'var(--color-brand)',
                  borderRadius: 'var(--radius-button)',
                  padding: `var(--space-xs) var(--space-md)`,
                  flexShrink: 0,
                  marginLeft: 'var(--space-md)',
                }}>
                  <p style={{ fontSize: 'var(--font-size-label)', fontWeight: 700, color: 'white' }}>{c.discount_text}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

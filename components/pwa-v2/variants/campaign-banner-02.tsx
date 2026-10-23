'use client'

// Campaign Banner 02 — Full brand gradient banner, white text, stacked

import type { CampaignProps } from './campaign-types'

export function CampaignBanner02({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      {campaigns.map(c => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          borderRadius: 'var(--radius-card)',
          background: `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`,
          padding: 'var(--space-lg)',
          boxShadow: '0 4px 16px var(--color-brand-glow-strong)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-h2)',
                fontWeight: 'var(--font-weight-heading)',
                color: 'white',
                letterSpacing: 'var(--letter-spacing)',
              }}>{c.name}</p>
              {c.description && (
                <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.7)', marginTop: 'var(--space-xs)' }}>{c.description}</p>
              )}
            </div>
            {c.discount_text && (
              <p style={{
                fontSize: 'var(--font-size-hero)',
                fontWeight: 900,
                color: 'white',
                opacity: 0.9,
                lineHeight: 1,
                flexShrink: 0,
                marginLeft: 'var(--space-md)',
              }}>{c.discount_text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

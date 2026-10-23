'use client'

// Campaign Neon 01 — Glowing outline cards, dark feel, neon brand accents

import type { CampaignProps } from './campaign-types'

export function CampaignNeon01({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-brand)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
        textShadow: '0 0 8px var(--color-brand-glow)',
      }}>Kampanyalar</p>

      {campaigns.map(c => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          borderRadius: 'var(--radius-card)',
          background: 'var(--color-bg)',
          border: '1px solid var(--color-brand)',
          padding: 'var(--space-lg)',
          boxShadow: `0 0 12px var(--color-brand-glow), inset 0 0 12px var(--color-brand-glow)`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-heading)',
                color: 'var(--color-brand)',
                letterSpacing: 'var(--letter-spacing)',
                textShadow: '0 0 6px var(--color-brand-glow)',
              }}>{c.name}</p>
              {c.description && (
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>{c.description}</p>
              )}
            </div>
            {c.discount_text && (
              <p style={{
                fontSize: 'var(--font-size-h1)',
                fontWeight: 900,
                color: 'var(--color-brand)',
                textShadow: '0 0 12px var(--color-brand-glow-strong)',
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

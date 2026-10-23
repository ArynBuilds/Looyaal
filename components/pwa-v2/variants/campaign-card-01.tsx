'use client'

// Campaign Card 01 — Standard cards in a vertical stack with icon + text

import type { CampaignProps } from './campaign-types'

export function CampaignCard01({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
    }}>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
        marginBottom: 'var(--space-md)',
      }}>Kampanyalar</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {campaigns.map(c => (
          <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
            display: 'flex',
            gap: 'var(--space-md)',
            alignItems: 'center',
            padding: `var(--space-md) 0`,
            borderBottom: '1px solid var(--color-divider)',
          }}>
            {/* Icon */}
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-brand-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5">
                <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" /><path d="M12 22V7" />
              </svg>
            </div>
            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 600, color: 'var(--color-text)' }}>{c.name}</p>
              {c.description && (
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 2 }}>{c.description}</p>
              )}
            </div>
            {/* Discount */}
            {c.discount_text && (
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 800, color: 'var(--color-brand)', flexShrink: 0 }}>{c.discount_text}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

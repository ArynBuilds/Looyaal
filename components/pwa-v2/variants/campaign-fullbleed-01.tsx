'use client'

// Campaign Fullbleed 01 — Full-width stacked image sections with text overlay

import type { CampaignProps } from './campaign-types'

export function CampaignFullbleed01({ campaigns, onCampaignPress }: CampaignProps) {
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

      {campaigns.map((c, i) => {
        const isFeatured = i === 0
        return (
          <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
            borderRadius: 'var(--radius-card)',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: isFeatured ? 'var(--ar-campaign-featured)' : 'var(--ar-campaign-card)',
            background: `linear-gradient(${120 + i * 30}deg, var(--color-brand-dark), var(--color-brand))`,
          }}>
            {/* Subtle pattern overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.2))',
            }} />

            {/* Content */}
            <div style={{
              position: 'absolute',
              inset: 0,
              padding: 'var(--space-xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isFeatured ? 'flex-end' : 'center',
            }}>
              {/* Discount badge */}
              {c.discount_text && isFeatured && (
                <p style={{
                  fontSize: 'calc(var(--font-size-hero) * 1.5)',
                  fontWeight: 900,
                  color: 'white',
                  opacity: 0.15,
                  position: 'absolute',
                  top: 'var(--space-md)',
                  right: 'var(--space-lg)',
                  lineHeight: 1,
                }}>{c.discount_text}</p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: isFeatured ? 'var(--font-size-h1)' : 'var(--font-size-h2)',
                    fontWeight: 'var(--font-weight-heading)',
                    color: 'white',
                    letterSpacing: 'var(--letter-spacing)',
                  }}>{c.name}</p>
                  {c.description && (
                    <p style={{
                      fontSize: 'var(--font-size-label)',
                      color: 'rgba(255,255,255,0.7)',
                      marginTop: 'var(--space-xs)',
                    }}>{c.description}</p>
                  )}
                </div>
                {c.discount_text && (
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 'var(--radius-button)',
                    padding: `var(--space-xs) var(--space-md)`,
                    flexShrink: 0,
                    marginLeft: 'var(--space-md)',
                  }}>
                    <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 800, color: 'white' }}>{c.discount_text}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

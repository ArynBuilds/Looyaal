'use client'

// Campaign Mosaic 01 — Alternating large/small blocks in a masonry-style grid

import type { CampaignProps } from './campaign-types'

export function CampaignMosaic01({ campaigns, onCampaignPress }: CampaignProps) {
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
        {campaigns.map((c, i) => {
          const isWide = i === 0
          return (
            <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
              gridColumn: isWide ? 'span 2' : 'span 1',
              borderRadius: 'var(--radius-card)',
              overflow: 'hidden',
              position: 'relative',
              aspectRatio: isWide ? 'var(--ar-campaign-featured)' : 'var(--ar-campaign-card)',
              background: `linear-gradient(${100 + i * 40}deg, var(--color-brand-dark), var(--color-brand))`,
            }}>
              {/* Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: isWide
                  ? 'linear-gradient(to right, rgba(0,0,0,0.4), transparent)'
                  : 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)',
              }} />

              {/* Content */}
              <div style={{
                position: 'absolute',
                inset: 0,
                padding: 'var(--space-lg)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}>
                {c.discount_text && (
                  <p style={{
                    fontSize: isWide ? 'var(--font-size-hero)' : 'var(--font-size-h2)',
                    fontWeight: 900,
                    color: 'white',
                    lineHeight: 1,
                  }}>{c.discount_text}</p>
                )}
                <p style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: isWide ? 'var(--font-size-h2)' : 'var(--font-size-body)',
                  fontWeight: 'var(--font-weight-heading)',
                  color: 'white',
                  letterSpacing: 'var(--letter-spacing)',
                  marginTop: 'var(--space-xs)',
                }}>{c.name}</p>
                {c.description && isWide && (
                  <p style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{c.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

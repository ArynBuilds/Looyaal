'use client'

// Sana Özel 09 — Frosted glass overlay with rotating gradient backgrounds

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel09({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
          fontWeight: 600,
        }}>Sana Özel</p>
      </div>

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
            {/* Dark gradient overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,0.3), transparent, rgba(0,0,0,0.2))',
            }} />

            {/* Small sparkle in overlay */}
            <div style={{ position: 'absolute', top: 'var(--space-md)', right: 'var(--space-md)', opacity: 0.3 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>

            {/* Content */}
            <div style={{
              position: 'absolute',
              inset: 0,
              padding: 'var(--space-xl)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isFeatured ? 'flex-end' : 'center',
            }}>
              {/* Large faded discount for featured */}
              {c.discount_text && isFeatured && (
                <p style={{
                  fontSize: 'calc(var(--font-size-hero) * 1.5)',
                  fontWeight: 900,
                  color: 'white',
                  opacity: 0.15,
                  position: 'absolute',
                  top: 'var(--space-md)',
                  left: 'var(--space-lg)',
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
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
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
                    maxWidth: '45%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    <p style={{
                      fontSize: 'var(--font-size-body)',
                      fontWeight: 800,
                      color: 'white',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>{c.discount_text}</p>
                  </div>
                )}
              </div>
            </div>
            {(() => { const t = formatTimeRemaining(c.valid_until); return t ? (
              <span style={{
                position: 'absolute',
                bottom: 6,
                right: 'var(--space-md)',
                fontSize: 'var(--font-size-tiny)',
                color: '#ff6b6b',
                background: 'rgba(0, 0, 0, 0.5)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-button)',
              }}>{t}</span>
            ) : null })()}
          </div>
        )
      })}
    </div>
  )
}

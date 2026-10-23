'use client'

// Sana Özel 10 — Mosaic grid with sparkle-accented discount text

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel10({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)' }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                    <svg width={isWide ? 18 : 14} height={isWide ? 18 : 14} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    </svg>
                    <p style={{
                      fontSize: isWide ? 'var(--font-size-hero)' : 'var(--font-size-h2)',
                      fontWeight: 900,
                      color: 'white',
                      lineHeight: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>{c.discount_text}</p>
                  </div>
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
                  <p style={{
                    fontSize: 'var(--font-size-label)',
                    color: 'rgba(255,255,255,0.6)',
                    marginTop: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical' as const,
                    overflow: 'hidden',
                  }}>{c.description}</p>
                )}
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
    </div>
  )
}

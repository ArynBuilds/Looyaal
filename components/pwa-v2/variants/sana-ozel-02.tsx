'use client'

// Sana Özel 02 — Gradient banner, full brand gradient bg, white text, hero discount right

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel02({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div>
      {/* Section header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-sm)',
        marginBottom: 'var(--space-md)',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-brand)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
          fontWeight: 700,
        }}>Sana Özel</p>
      </div>

      {/* Banner cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {campaigns.map(c => (
          <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{
            cursor: 'pointer',
            borderRadius: 'var(--radius-card)',
            background: `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`,
            padding: 'var(--space-lg)',
            boxShadow: '0 4px 16px var(--color-brand-glow-strong)',
            position: 'relative',
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
                <p style={{
                  fontSize: 'var(--font-size-hero)',
                  fontWeight: 900,
                  color: 'white',
                  opacity: 0.9,
                  lineHeight: 1,
                  flexShrink: 0,
                  marginLeft: 'var(--space-md)',
                  maxWidth: '45%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>{c.discount_text}</p>
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
        ))}
      </div>
    </div>
  )
}

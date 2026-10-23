'use client'

// Sana Özel — Personalized deals section with sparkle accent

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel01({ campaigns, onCampaignPress }: CampaignProps) {
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

      {/* Deal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {campaigns.map(c => (
          <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{
            cursor: 'pointer',
            borderRadius: 'var(--radius-card)',
            background: 'var(--color-brand-glow)',
            border: '1px solid var(--color-brand-glow)',
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-md)',
            transition: 'var(--transition)',
            position: 'relative',
          }}>
            {/* Sparkle icon */}
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-brand-glow-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-brand)" stroke="none">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>

            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-heading)',
                color: 'var(--color-text)',
                letterSpacing: 'var(--letter-spacing)',
              }}>{c.name}</p>
              {c.description && (
                <p style={{
                  fontSize: 'var(--font-size-label)',
                  color: 'var(--color-text-secondary)',
                  marginTop: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}>{c.description}</p>
              )}
            </div>

            {/* Discount badge */}
            {c.discount_text && (
              <div style={{
                background: 'var(--color-brand)',
                borderRadius: 'var(--radius-button)',
                padding: 'var(--space-xs) var(--space-md)',
                flexShrink: 0,
                maxWidth: '45%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                <p style={{
                  fontSize: 'var(--font-size-tiny)',
                  fontWeight: 700,
                  color: 'white',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>{c.discount_text}</p>
              </div>
            )}
            {(() => { const t = formatTimeRemaining(c.valid_until); return t ? (
              <span style={{
                position: 'absolute',
                bottom: 6,
                right: 'var(--space-md)',
                fontSize: 'var(--font-size-tiny)',
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
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

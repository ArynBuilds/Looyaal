'use client'

// Sana Özel 08 — Gift ticket with tear-off coupon feel and perforated edge

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel08({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
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

      {campaigns.map(c => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          display: 'flex',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          boxShadow: 'var(--shadow-card)',
          position: 'relative',
        }}>
          {/* Left: deal info */}
          <div style={{
            flex: 1,
            padding: 'var(--space-lg)',
            borderRight: '2px dashed var(--color-divider)',
            position: 'relative',
          }}>
            {/* Perforation circle top */}
            <div style={{
              position: 'absolute', top: -8, right: -9,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--color-bg)',
            }} />
            {/* Perforation circle bottom */}
            <div style={{
              position: 'absolute', bottom: -8, right: -9,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--color-bg)',
            }} />

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
                color: 'var(--color-text-muted)',
                marginTop: 'var(--space-xs)',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const,
                overflow: 'hidden',
              }}>{c.description}</p>
            )}
          </div>

          {/* Right: discount */}
          <div style={{
            width: 80,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
          }}>
            {c.discount_text ? (
              <p style={{
                fontSize: 'var(--font-size-h2)',
                fontWeight: 900,
                color: 'var(--color-brand)',
                textAlign: 'center',
                lineHeight: 1.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>{c.discount_text}</p>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            )}
          </div>
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
  )
}

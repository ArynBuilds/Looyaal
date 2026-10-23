'use client'

// Sana Özel 03 — Icon list in card, divider-separated rows, sparkle icon box, bold brand discount text

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel03({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-lg)',
    }}>
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

      {/* Rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        {campaigns.map(c => (
          <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{
            cursor: 'pointer',
            display: 'flex',
            gap: 'var(--space-md)',
            alignItems: 'center',
            padding: `var(--space-md) 0`,
            borderBottom: '1px solid var(--color-divider)',
            position: 'relative',
          }}>
            {/* Sparkle icon box */}
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-brand)" stroke="none">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 600, color: 'var(--color-text)' }}>{c.name}</p>
              {c.description && (
                <p style={{
                  fontSize: 'var(--font-size-label)',
                  color: 'var(--color-text-muted)',
                  marginTop: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                  overflow: 'hidden',
                }}>{c.description}</p>
              )}
            </div>
            {/* Discount as bold brand text */}
            {c.discount_text && (
              <p style={{
                fontSize: 'var(--font-size-body)',
                fontWeight: 800,
                color: 'var(--color-brand)',
                flexShrink: 0,
                maxWidth: '45%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{c.discount_text}</p>
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

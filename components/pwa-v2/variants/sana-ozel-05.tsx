'use client'

// Sana Özel 05 — Urgency circle badge: large circular discount on left, "Sadece senin için" flag top-right

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel05({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        Sana Özel
      </p>

      {campaigns.map(c => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          borderRadius: 'var(--radius-card)',
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          padding: 'var(--space-lg)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* "Sadece senin için" flag */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'var(--color-brand)',
            borderRadius: `0 0 0 var(--radius-sm)`,
            padding: `var(--space-xs) var(--space-sm)`,
          }}>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'white', fontWeight: 600 }}>Sadece senin için</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            {/* Big circular discount badge */}
            {c.discount_text && (
              <div style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'var(--color-brand-glow)',
                border: '2px solid var(--color-brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                <p style={{
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 900,
                  color: 'var(--color-brand)',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>{c.discount_text}</p>
              </div>
            )}
            {/* Text */}
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-h2)',
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

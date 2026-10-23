'use client'

// Campaign Countdown 01 — Cards with urgency: countdown/expiry date, bold discount

import type { CampaignProps } from './campaign-types'

export function CampaignCountdown01({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
      }}>Firsatlar</p>

      {campaigns.map(c => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          borderRadius: 'var(--radius-card)',
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          padding: 'var(--space-lg)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Urgency corner */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            background: 'var(--color-danger)',
            borderRadius: `0 0 0 var(--radius-sm)`,
            padding: `var(--space-xs) var(--space-sm)`,
          }}>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'white', fontWeight: 600 }}>Sinirli</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            {/* Big discount */}
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
              }}>
                <p style={{
                  fontSize: 'var(--font-size-body)',
                  fontWeight: 900,
                  color: 'var(--color-brand)',
                  textAlign: 'center',
                  lineHeight: 1.1,
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
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>{c.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

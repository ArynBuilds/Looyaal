'use client'

// Campaign Ticket 01 — Tear-off ticket/coupon style with perforated edge

import type { CampaignProps } from './campaign-types'

export function CampaignTicket01({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
      }}>Kuponlarim</p>

      {campaigns.map(c => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          display: 'flex',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          boxShadow: 'var(--shadow-card)',
        }}>
          {/* Left: info */}
          <div style={{
            flex: 1,
            padding: 'var(--space-lg)',
            borderRight: '2px dashed var(--color-divider)',
            position: 'relative',
          }}>
            {/* Perforation circles */}
            <div style={{
              position: 'absolute', top: -8, right: -9,
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--color-bg)',
            }} />
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
              <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 'var(--space-xs)' }}>{c.description}</p>
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
              }}>{c.discount_text}</p>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1.5">
                <path d="M20 12v10H4V12" /><path d="M2 7h20v5H2z" />
              </svg>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

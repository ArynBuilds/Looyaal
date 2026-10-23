'use client'

// Sana Özel 06 — Split block: 90px brand gradient left with sparkle + discount, text on right

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel06({ campaigns, onCampaignPress }: CampaignProps) {
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
          display: 'flex',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          border: '1px solid var(--color-card-border)',
          position: 'relative',
        }}>
          {/* Brand gradient block */}
          <div style={{
            width: 90,
            background: `linear-gradient(135deg, var(--color-brand), var(--color-brand-dark))`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
            flexShrink: 0,
            gap: 'var(--space-xs)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            </svg>
            {c.discount_text ? (
              <p style={{ fontSize: 'var(--font-size-h1)', fontWeight: 900, color: 'white', textAlign: 'center', lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.discount_text}</p>
            ) : (
              <p style={{ fontSize: 'var(--font-size-label)', fontWeight: 700, color: 'white', textAlign: 'center' }}>Firsat</p>
            )}
          </div>
          {/* Text content */}
          <div style={{
            flex: 1,
            padding: 'var(--space-lg)',
            background: 'var(--color-card)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
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

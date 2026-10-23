'use client'

// Sana Özel 07 — Neon glow: brand border, dual box-shadow, text-shadow accents, glowing discount

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel07({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-brand)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        fontWeight: 600,
        textShadow: '0 0 8px var(--color-brand-glow)',
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
          background: 'var(--color-bg)',
          border: '1px solid var(--color-brand)',
          padding: 'var(--space-lg)',
          boxShadow: `0 0 12px var(--color-brand-glow), inset 0 0 12px var(--color-brand-glow)`,
          position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--font-size-body)',
                fontWeight: 'var(--font-weight-heading)',
                color: 'var(--color-brand)',
                letterSpacing: 'var(--letter-spacing)',
                textShadow: '0 0 6px var(--color-brand-glow)',
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
            {c.discount_text && (
              <p style={{
                fontSize: 'var(--font-size-h1)',
                fontWeight: 900,
                color: 'var(--color-brand)',
                textShadow: '0 0 12px var(--color-brand-glow-strong)',
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

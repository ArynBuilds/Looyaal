'use client'

// Sana Özel 04 — Minimal dot rows, tiny sparkle dots, inline text, dividers between items

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

export function SanaOzel04({ campaigns, onCampaignPress }: CampaignProps) {
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
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
        <p style={{
          fontSize: 'var(--font-size-tiny)',
          color: 'var(--color-brand)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
          fontWeight: 700,
        }}>Sana Özel</p>
      </div>

      {/* Rows */}
      {campaigns.map((c, i) => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: `var(--space-sm) 0`,
          borderBottom: i < campaigns.length - 1 ? '1px solid var(--color-divider)' : 'none',
          position: 'relative',
        }}>
          {/* Tiny sparkle dot */}
          <svg width="8" height="8" viewBox="0 0 24 24" fill="var(--color-brand)" stroke="none" style={{ flexShrink: 0 }}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
          </svg>
          <p style={{ flex: 1, fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>{c.name}</p>
          {c.discount_text && (
            <p style={{
              fontSize: 'var(--font-size-label)',
              color: 'var(--color-brand)',
              fontWeight: 700,
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
  )
}

'use client'

// Campaign Inline 01 — Minimal inline text rows, no card wrapper, just brand dot + text

import type { CampaignProps } from './campaign-types'

export function CampaignInline01({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div>
      <p style={{
        fontSize: 'var(--font-size-tiny)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: 'var(--letter-spacing-label)',
        marginBottom: 'var(--space-md)',
      }}>Kampanyalar</p>

      {campaigns.map((c, i) => (
        <div key={c.id} onClick={() => onCampaignPress?.(c)} style={{ cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-sm)',
          padding: `var(--space-sm) 0`,
          borderBottom: i < campaigns.length - 1 ? '1px solid var(--color-divider)' : 'none',
        }}>
          <div style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: 'var(--color-brand)',
            flexShrink: 0,
          }} />
          <p style={{ flex: 1, fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>{c.name}</p>
          {c.discount_text && (
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 700, flexShrink: 0 }}>{c.discount_text}</p>
          )}
        </div>
      ))}
    </div>
  )
}

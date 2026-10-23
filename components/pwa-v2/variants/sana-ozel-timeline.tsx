'use client'

import type { CampaignProps } from './campaign-types'

// Sana Özel — Story Timeline. Vertical roadmap of all current offers laid
// out by valid_until (today / tomorrow / this week / later). One component
// renders all offers regardless of count.

export function SanaOzelTimeline({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  const sorted = [...campaigns].sort((a, b) => {
    const ta = a.valid_until ? new Date(a.valid_until).getTime() : Infinity
    const tb = b.valid_until ? new Date(b.valid_until).getTime() : Infinity
    return ta - tb
  })

  const now = Date.now()
  const dayMs = 86400000

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Sana Özel · Yol Haritan</p>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', paddingLeft: 'var(--space-lg)' }}>
        <div aria-hidden style={{ position: 'absolute', left: 9, top: 12, bottom: 12, width: 2, background: 'var(--color-divider)' }} />
        {sorted.map((c, i) => {
          const expiresAt = c.valid_until ? new Date(c.valid_until).getTime() : null
          const bucket = !expiresAt ? '' : expiresAt - now < dayMs ? 'BUGÜN' : expiresAt - now < 2 * dayMs ? 'YARIN' : expiresAt - now < 7 * dayMs ? 'BU HAFTA' : 'SONRA'
          const isFirst = i === 0
          return (
            <button
              key={c.id}
              onClick={() => onCampaignPress?.(c)}
              style={{ position: 'relative', background: 'var(--color-card)', border: `1px solid ${isFirst ? 'var(--color-brand)' : 'var(--color-card-border)'}`, borderRadius: 'var(--radius-card)', padding: 'var(--space-md) var(--space-lg)', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              <div aria-hidden style={{ position: 'absolute', left: -22, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, borderRadius: '50%', border: `2px solid ${isFirst ? 'var(--color-brand)' : 'var(--color-stamp-border)'}`, background: isFirst ? 'var(--color-brand)' : 'var(--color-card)' }} />
              {bucket && <p style={{ fontSize: 'var(--font-size-tiny)', color: isFirst ? 'var(--color-brand)' : 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>{bucket}</p>}
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>{c.name}</p>
              {c.discount_text && <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-brand)', fontWeight: 700, margin: 0 }}>{c.discount_text}</p>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

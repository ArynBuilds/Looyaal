'use client'

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Campaign — Front Page. Newspaper editorial: bold serif headline, dateline,
// two-column body copy. Makes a promotion feel like reportage, not an ad.

export function CampaignFrontPage({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null
  const today = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Kampanyalar</p>
      {campaigns.map((c, i) => {
        const time = formatTimeRemaining(c.valid_until)
        return (
          <button
            key={c.id}
            onClick={() => onCampaignPress?.(c)}
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-text)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid var(--color-text)', paddingBottom: 'var(--space-xs)' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '0.2em', margin: 0 }}>SAYI {String(i + 1).padStart(2, '0')}</p>
              <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', letterSpacing: '0.1em', margin: 0 }}>{today}</p>
            </div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.05 }}>{c.name}</p>
            {c.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-brand)', margin: 0, letterSpacing: '-0.01em', fontStyle: 'italic' }}>{c.discount_text}</p>}
            {c.description && <p style={{ columnCount: 2, columnGap: 'var(--space-md)', fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: 'var(--space-xs) 0 0', lineHeight: 1.5 }}>{c.description}</p>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-sm)', paddingTop: 'var(--space-sm)', borderTop: '1px dashed var(--color-divider)' }}>
              {time && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, margin: 0 }}>{time}</p>}
              <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', letterSpacing: '0.15em', fontWeight: 700, margin: 0 }}>OKU →</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}

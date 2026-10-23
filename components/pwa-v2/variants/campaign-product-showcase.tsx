'use client'

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Campaign — Product Showcase. E-commerce product card aesthetic. Big photo
// area on the left, "YENİ" badge, name, description, price with strikethrough
// suggestion based on discount. Familiar pattern → trust.

export function CampaignProductShowcase({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Kampanyalar</p>
      {campaigns.map(c => {
        const time = formatTimeRemaining(c.valid_until)
        const discountMatch = c.discount_text?.match(/(\d+)%/)?.[1]
        const discountPct = discountMatch ? parseInt(discountMatch, 10) : null
        return (
          <button
            key={c.id}
            onClick={() => onCampaignPress?.(c)}
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-md)', cursor: 'pointer', display: 'flex', gap: 'var(--space-md)', textAlign: 'left', overflow: 'hidden' }}
          >
            <div style={{ width: '32cqw', aspectRatio: '1', flexShrink: 0, borderRadius: 'var(--radius-sm)', background: `linear-gradient(135deg, var(--color-brand-glow), var(--color-brand-muted))`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="1" opacity="0.4"><path d="M17 8h1a4 4 0 1 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" /></svg>
              {discountPct && (
                <div style={{ position: 'absolute', top: 6, right: 6, background: 'var(--color-brand)', color: 'white', padding: '3px 7px', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', fontWeight: 800, letterSpacing: '-0.01em' }}>−%{discountPct}</div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 'var(--space-xs)' }}>
              <div>
                <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>YENİ</p>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.2 }}>{c.name}</p>
                {c.description && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-secondary)', margin: '4px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</p>}
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-sm)' }}>
                {c.discount_text && (
                  <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 800, color: 'var(--color-brand)', margin: 0, letterSpacing: '-0.02em' }}>{c.discount_text}</p>
                )}
                {time && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600 }}>{time}</p>}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

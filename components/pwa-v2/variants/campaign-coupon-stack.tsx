'use client'

import { useState } from 'react'
import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Campaign — Coupon Stack. Wallet of paper coupons with dashed perforations.
// Top one is active and tappable; others peek out from behind. Tapping a
// stacked coupon brings it to the front. Feels like flipping through deals.

export function CampaignCouponStack({ campaigns, onCampaignPress }: CampaignProps) {
  const [topIndex, setTopIndex] = useState(0)
  if (campaigns.length === 0) return null

  const ordered = [...campaigns.slice(topIndex), ...campaigns.slice(0, topIndex)]
  const top = ordered[0]
  const time = formatTimeRemaining(top.valid_until)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-xs)' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0 }}>Kuponlar</p>
        {campaigns.length > 1 && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)', margin: 0 }}>{campaigns.length} kupon</p>}
      </div>

      <div style={{ position: 'relative', minHeight: '32cqw' }}>
        {ordered.slice(1, 4).map((c, i) => {
          const offset = i + 1
          return (
            <button
              key={`bg-${c.id}`}
              onClick={() => setTopIndex((topIndex + offset) % campaigns.length)}
              aria-label={c.name}
              style={{ position: 'absolute', inset: 0, background: 'var(--color-card)', border: '1.5px dashed var(--color-card-border)', borderRadius: 'var(--radius-card)', transform: `rotate(${offset % 2 === 0 ? offset * 1.5 : -offset * 1.5}deg) translateY(${offset * 6}px)`, opacity: Math.max(0.4, 1 - offset * 0.18), cursor: 'pointer', zIndex: 0 }}
            />
          )
        })}

        <button
          onClick={() => onCampaignPress?.(top)}
          style={{ position: 'relative', zIndex: 2, width: '100%', background: 'var(--color-card)', border: '1.5px dashed var(--color-brand)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-md)', boxShadow: '0 4px 14px var(--color-brand-glow)' }}
        >
          <div style={{ position: 'absolute', left: '-1.5px', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, background: 'var(--color-bg)', borderRadius: '50%', border: '1.5px dashed var(--color-brand)' }} />
          <div style={{ position: 'absolute', right: '-1.5px', top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, background: 'var(--color-bg)', borderRadius: '50%', border: '1.5px dashed var(--color-brand)' }} />
          <div style={{ flex: 1, minWidth: 0, paddingLeft: 'var(--space-sm)' }}>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>Kupon</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.01em', margin: '4px 0 0', lineHeight: 1.15 }}>{top.name}</p>
            {time && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: '6px 0 0', fontWeight: 600 }}>{time}</p>}
          </div>
          {top.discount_text && (
            <div style={{ width: 1, alignSelf: 'stretch', borderLeft: '1.5px dashed var(--color-stamp-border)' }} />
          )}
          {top.discount_text && (
            <div style={{ flexShrink: 0, paddingRight: 'var(--space-sm)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', fontWeight: 900, color: 'var(--color-brand)', letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>{top.discount_text}</p>
            </div>
          )}
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Sana Özel — Gift Box. Tap once to "open" the box (animated bow lift),
// tap again to claim. One box per offer. Tactile delight for birthday +
// hero_offer + surprise rewards.

export function SanaOzelGift({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Sana Özel</p>
      {campaigns.map(c => <GiftCard key={c.id} campaign={c} onPress={onCampaignPress} />)}
    </div>
  )
}

function GiftCard({ campaign, onPress }: { campaign: CampaignProps['campaigns'][number]; onPress?: CampaignProps['onCampaignPress'] }) {
  const [opened, setOpened] = useState(false)
  const time = formatTimeRemaining(campaign.valid_until)

  return (
    <button
      onClick={() => { if (opened) onPress?.(campaign); else setOpened(true) }}
      style={{ position: 'relative', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 'var(--space-lg)', textAlign: 'left', minHeight: '24cqw' }}
    >
      <div style={{ position: 'relative', width: '20cqw', height: '20cqw', flexShrink: 0 }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))', borderRadius: 8, transition: 'transform 400ms cubic-bezier(0.34,1.56,0.64,1)', transform: opened ? 'translateY(40%) rotateX(-15deg)' : 'none', transformOrigin: 'top' }} />
        <div aria-hidden style={{ position: 'absolute', inset: 0, left: '40%', right: '40%', background: 'var(--color-brand-light)', borderRadius: 4, opacity: opened ? 0 : 1, transition: 'opacity 200ms' }} />
        <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, top: '40%', bottom: '40%', background: 'var(--color-brand-light)', borderRadius: 4, opacity: opened ? 0 : 1, transition: 'opacity 200ms' }} />
        <div aria-hidden style={{ position: 'absolute', left: '20%', right: '20%', top: '-15%', height: '40%', display: 'flex', justifyContent: 'center', transition: 'transform 350ms cubic-bezier(0.34,1.56,0.64,1)', transform: opened ? 'translateY(-100%) rotate(20deg)' : 'none' }}>
          <div style={{ width: '50%', height: '70%', background: 'var(--color-brand-light)', borderRadius: '50% 50% 0 50%', transform: 'rotate(-25deg)' }} />
          <div style={{ width: '50%', height: '70%', background: 'var(--color-brand-light)', borderRadius: '50% 50% 50% 0', transform: 'rotate(25deg)', marginLeft: '-15%' }} />
        </div>
        {opened && <div style={{ position: 'absolute', top: '-5%', left: '50%', transform: 'translateX(-50%)', fontSize: 'var(--font-size-h2)', animation: 'gift-sparkle 600ms ease-out' }}>✦</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {!opened ? (
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.01em' }}>Bir hediyen var</p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>Açmak için dokun</p>
          </div>
        ) : (
          <div>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em' }}>{campaign.name}</p>
            {campaign.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 800, color: 'var(--color-brand)', margin: '4px 0 0', letterSpacing: '-0.02em' }}>{campaign.discount_text}</p>}
            {time && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: '4px 0 0', fontWeight: 600 }}>{time} · QR ile aç →</p>}
          </div>
        )}
      </div>
      <style>{`@keyframes gift-sparkle { 0% { opacity: 0; transform: translate(-50%, 8px) scale(0.5); } 100% { opacity: 1; transform: translate(-50%, 0) scale(1); } }`}</style>
    </button>
  )
}

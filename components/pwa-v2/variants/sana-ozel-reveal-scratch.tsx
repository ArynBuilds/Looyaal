'use client'

import { useState } from 'react'
import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Sana Özel — Reveal Scratch. Tap to "scratch off" the cover and see the
// discount underneath. Builds anticipation; the claim feels earned.

export function SanaOzelRevealScratch({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <SectionHeader />
      {campaigns.map(c => <ScratchCard key={c.id} campaign={c} onPress={onCampaignPress} />)}
    </div>
  )
}

function ScratchCard({ campaign, onPress }: { campaign: CampaignProps['campaigns'][number]; onPress?: CampaignProps['onCampaignPress'] }) {
  const [revealed, setRevealed] = useState(false)
  const time = formatTimeRemaining(campaign.valid_until)

  return (
    <button
      onClick={() => { if (revealed) onPress?.(campaign); else setRevealed(true) }}
      style={{ position: 'relative', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}
    >
      <div style={{ padding: 'var(--space-lg)', minHeight: '22cqw', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 'var(--space-xs)' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.01em' }}>{campaign.name}</p>
        {campaign.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', fontWeight: 800, color: 'var(--color-brand)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{campaign.discount_text}</p>}
        {time && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: 'var(--space-xs) 0 0', fontWeight: 600 }}>{time}</p>}
      </div>
      {!revealed && (
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(45deg, var(--color-brand) 0 12px, var(--color-brand-dark) 12px 24px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, animation: 'scratch-pulse 2.4s ease-in-out infinite' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '0.05em', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>KAZIYIP AÇ</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'rgba(255,255,255,0.85)', margin: 0, letterSpacing: '0.2em' }}>SANA ÖZEL</p>
        </div>
      )}
      <style>{`@keyframes scratch-pulse { 0%,100%{opacity:1} 50%{opacity:0.85} }`}</style>
    </button>
  )
}

function SectionHeader() {
  return (
    <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Sana Özel</p>
  )
}

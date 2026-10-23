'use client'

import { useEffect, useState } from 'react'
import type { CampaignProps } from './campaign-types'

// Sana Özel — Countdown Capsule. Live ticking timer dominates the card.
// For time-bound offers (goal_gradient, dead_hour_targeted, birthday).

export function SanaOzelCountdown({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Sana Özel</p>
      {campaigns.map(c => <CountdownCard key={c.id} campaign={c} onPress={onCampaignPress} />)}
    </div>
  )
}

function CountdownCard({ campaign, onPress }: { campaign: CampaignProps['campaigns'][number]; onPress?: CampaignProps['onCampaignPress'] }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const expiresAt = campaign.valid_until ? new Date(campaign.valid_until).getTime() : null
  const remainingMs = expiresAt ? Math.max(0, expiresAt - now) : null
  const segments = remainingMs == null ? null : segmentMs(remainingMs)

  return (
    <button
      onClick={() => onPress?.(campaign)}
      style={{ background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'left', cursor: 'pointer', border: 'none', color: 'white', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', boxShadow: '0 6px 20px var(--color-brand-glow-strong)' }}
    >
      {segments && (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', gap: 6 }}>
          <Slot label="Saat" value={segments.h} />
          <Sep />
          <Slot label="Dk" value={segments.m} />
          <Sep />
          <Slot label="Sn" value={segments.s} />
        </div>
      )}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.2)' }} />
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-sm)' }}>
        {campaign.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{campaign.discount_text}</p>}
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 600, margin: 0, opacity: 0.9 }}>{campaign.name}</p>
      </div>
      {campaign.description && <p style={{ fontSize: 'var(--font-size-label)', margin: 0, opacity: 0.8, lineHeight: 1.4 }}>{campaign.description}</p>}
    </button>
  )
}

function Slot({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ textAlign: 'center', minWidth: '14cqw' }}>
      <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', fontWeight: 800, margin: 0, lineHeight: 1, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{String(value).padStart(2, '0')}</p>
      <p style={{ fontSize: 'var(--font-size-tiny)', margin: '4px 0 0', opacity: 0.7, letterSpacing: '0.15em', fontWeight: 600 }}>{label}</p>
    </div>
  )
}

function Sep() {
  return <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', margin: 0, opacity: 0.4, fontWeight: 800 }}>:</p>
}

function segmentMs(ms: number) {
  const s = Math.floor(ms / 1000)
  return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

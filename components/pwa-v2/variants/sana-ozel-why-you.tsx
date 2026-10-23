'use client'

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Sana Özel — Why-You. Each offer leads with a "Çünkü..." reason that
// derives from the offer type. Transparency builds trust in personalization.

const REASON_BY_TYPE: Record<string, string> = {
  goal_gradient: 'Bir kahve daha ve ödül senin',
  reengagement: 'Bir süredir uğramadın, yine bekleriz',
  hero_offer: 'Sadakatin için özel bir teşekkür',
  birthday: 'Bugün senin günün',
  challenge_reward: 'Bu haftaki görevini tamamladın',
  dead_hour_targeted: 'Sevdiğin saatlerden biri sakin',
}

export function SanaOzelWhyYou({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Sana Özel</p>
      {campaigns.map(c => {
        const reason = (c.type && REASON_BY_TYPE[c.type]) || c.description || 'AI sana göre seçti'
        const time = formatTimeRemaining(c.valid_until)
        return (
          <button
            key={c.id}
            onClick={() => onCampaignPress?.(c)}
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-md) var(--space-lg)', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}
          >
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-brand)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 700, margin: 0 }}>Çünkü</p>
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: '2px 0 0', lineHeight: 1.35 }}>{reason}</p>
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--color-divider)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              {c.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', fontWeight: 800, color: 'var(--color-brand)', margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{c.discount_text}</p>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text)', margin: 0, lineHeight: 1.2 }}>{c.name}</p>
                {time && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: '2px 0 0', fontWeight: 600 }}>{time}</p>}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

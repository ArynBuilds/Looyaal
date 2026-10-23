'use client'

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Sana Özel — Conversation Reveal. Owner/AI bubble messages build up,
// then offer slides in as a reply. Renders top 2 conversations to avoid
// clutter; remaining campaigns get a "diğer X teklif" footer button.

const INTRO_BY_TYPE: Record<string, string> = {
  goal_gradient: 'Sana hızlı bir not...',
  reengagement: 'Selam, bir süredir uğramadın',
  hero_offer: 'Sadakatin için...',
  birthday: 'İyi ki doğdun!',
  challenge_reward: 'Görevin için tebrikler',
  dead_hour_targeted: 'Sakin bir saat öneriyorum',
}

export function SanaOzelConversation({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  const top = campaigns.slice(0, 2)
  const overflow = campaigns.length - top.length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Sana Özel</p>
      {top.map((c, idx) => {
        const intro = (c.type && INTRO_BY_TYPE[c.type]) || c.description || 'Sana göre bir öneri var'
        return (
          <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-end' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-brand), var(--color-brand-light))', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
              </div>
              <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', padding: '8px 14px', borderRadius: '4px 14px 14px 14px', maxWidth: '80%', animation: `convo-in ${300 + idx * 80}ms ease-out both` }}>
                <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.4 }}>{intro}</p>
              </div>
            </div>
            <button
              onClick={() => onCampaignPress?.(c)}
              style={{ alignSelf: 'flex-start', background: 'var(--color-brand)', color: 'white', padding: 'var(--space-sm) var(--space-md)', borderRadius: '14px 14px 14px 4px', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 4, maxWidth: '85%', border: 'none', boxShadow: '0 2px 8px var(--color-brand-glow-strong)', animation: `convo-in ${500 + idx * 80}ms ease-out both` }}
            >
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-body)', fontWeight: 700, margin: 0 }}>{c.name}</p>
              {c.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>{c.discount_text}</p>}
              {formatTimeRemaining(c.valid_until) && <p style={{ fontSize: 'var(--font-size-tiny)', margin: '2px 0 0', opacity: 0.85, fontWeight: 600 }}>{formatTimeRemaining(c.valid_until)}</p>}
            </button>
          </div>
        )
      })}
      {overflow > 0 && (
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', textAlign: 'center', margin: 0 }}>+ {overflow} öneri daha</p>
      )}
      <style>{`@keyframes convo-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

'use client'

import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Sana Özel — Spotlight Ticket. Single full-width hero for the most
// important offer. Other offers fall through as a small "+N" footer.
//
// Priority: hero_offer > birthday > goal_gradient > rest. Falls back to
// first campaign if none match.

const PRIORITY: Record<string, number> = {
  hero_offer: 5,
  birthday: 4,
  goal_gradient: 3,
  challenge_reward: 2,
  dead_hour_targeted: 1,
  reengagement: 1,
}

export function SanaOzelSpotlight({ campaigns, onCampaignPress }: CampaignProps) {
  if (campaigns.length === 0) return null

  const sorted = [...campaigns].sort((a, b) => (PRIORITY[b.type ?? ''] ?? 0) - (PRIORITY[a.type ?? ''] ?? 0))
  const hero = sorted[0]
  const overflow = sorted.length - 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0, padding: '0 var(--space-xs)' }}>Sana Özel</p>

      <button
        onClick={() => onCampaignPress?.(hero)}
        style={{ position: 'relative', background: 'linear-gradient(135deg, var(--color-brand-dark), var(--color-brand) 60%, var(--color-brand-light))', borderRadius: 'var(--radius-card)', padding: 'var(--space-xl) var(--space-lg)', textAlign: 'left', cursor: 'pointer', border: 'none', color: 'white', boxShadow: '0 8px 28px var(--color-brand-glow-strong)', overflow: 'hidden' }}
      >
        <div aria-hidden style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', width: 8, height: '85%', background: 'radial-gradient(circle, white 30%, transparent 30%) repeat-y', backgroundSize: '8px 12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, margin: 0, opacity: 0.8 }}>· VIP ·</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.2em', fontWeight: 700, margin: 0, opacity: 0.7 }}>NO. {hero.id.slice(0, 4).toUpperCase()}</p>
        </div>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', fontWeight: 900, margin: 0, letterSpacing: '-0.03em', lineHeight: 1 }}>{hero.name}</p>
        {hero.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 700, margin: 'var(--space-sm) 0 0', opacity: 0.95 }}>{hero.discount_text}</p>}
        {formatTimeRemaining(hero.valid_until) && (
          <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px dashed rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0, opacity: 0.85, fontWeight: 700 }}>{formatTimeRemaining(hero.valid_until)}</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.2em', textTransform: 'uppercase', margin: 0, fontWeight: 700, opacity: 0.95 }}>QR İLE AÇ →</p>
          </div>
        )}
      </button>

      {overflow > 0 && (
        <button
          onClick={() => sorted[1] && onCampaignPress?.(sorted[1])}
          style={{ background: 'transparent', border: '1px dashed var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-sm) var(--space-md)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-label)', fontWeight: 600 }}
        >
          + {overflow} ek teklif daha
        </button>
      )}
    </div>
  )
}

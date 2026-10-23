'use client'

import { useState } from 'react'
import type { CampaignProps } from './campaign-types'
import { formatTimeRemaining } from '@/lib/format-time'

// Sana Özel — Stack of Three. Single component containing all offers as a
// swipeable deck. With 1 offer = single card. With 5+ = top 4 + count.

export function SanaOzelStack({ campaigns, onCampaignPress }: CampaignProps) {
  const [index, setIndex] = useState(0)
  if (campaigns.length === 0) return null

  const visible = campaigns.slice(0, 4)
  const overflow = campaigns.length - visible.length
  const current = visible[index]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-xs)' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0 }}>Sana Özel</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)', margin: 0 }}>{index + 1} / {visible.length}{overflow > 0 ? ` · +${overflow}` : ''}</p>
      </div>

      <div style={{ position: 'relative', minHeight: '38cqw' }}>
        {visible.length > 1 && visible.map((_, i) => {
          if (i <= index) return null
          const offset = i - index
          return <div key={`bg-${i}`} style={{ position: 'absolute', inset: 0, background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', transform: `translateY(${offset * 6}px) scale(${1 - offset * 0.04})`, opacity: Math.max(0.3, 1 - offset * 0.2), zIndex: 0 }} />
        })}

        <button
          onClick={() => onCampaignPress?.(current)}
          style={{ position: 'relative', zIndex: 1, width: '100%', background: 'var(--color-card)', border: '1.5px solid var(--color-brand)', borderRadius: 'var(--radius-card)', padding: 'var(--space-lg)', textAlign: 'left', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', boxShadow: '0 4px 16px var(--color-brand-glow)' }}
        >
          {current.type && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>{prettyType(current.type)}</p>}
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 800, color: 'var(--color-text)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.05 }}>{current.name}</p>
          {current.discount_text && <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-hero)', fontWeight: 800, color: 'var(--color-brand)', margin: 'var(--space-xs) 0 0', letterSpacing: '-0.04em', lineHeight: 1 }}>{current.discount_text}</p>}
          {formatTimeRemaining(current.valid_until) && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)', margin: 0, fontWeight: 600 }}>{formatTimeRemaining(current.valid_until)}</p>}
        </button>
      </div>

      {visible.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-xs)' }}>
          <button onClick={(e) => { e.stopPropagation(); setIndex(i => Math.max(0, i - 1)) }} disabled={index === 0} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--color-card-border)', background: 'var(--color-card)', cursor: index === 0 ? 'default' : 'pointer', opacity: index === 0 ? 0.4 : 1, color: 'var(--color-text-muted)' }}>‹</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {visible.map((_, i) => <div key={i} style={{ width: i === index ? 16 : 6, height: 6, borderRadius: 3, background: i === index ? 'var(--color-brand)' : 'var(--color-stamp-border)', transition: 'all 200ms' }} />)}
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIndex(i => Math.min(visible.length - 1, i + 1)) }} disabled={index === visible.length - 1} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--color-card-border)', background: 'var(--color-card)', cursor: index === visible.length - 1 ? 'default' : 'pointer', opacity: index === visible.length - 1 ? 0.4 : 1, color: 'var(--color-text-muted)' }}>›</button>
        </div>
      )}
    </div>
  )
}

function prettyType(t: string): string {
  if (t === 'goal_gradient') return 'Bugün geçerli'
  if (t === 'reengagement') return 'Bu hafta'
  if (t === 'hero_offer') return 'Özel teklif'
  if (t === 'birthday') return 'Doğum günün'
  if (t === 'challenge_reward') return 'Görev ödülü'
  if (t === 'dead_hour_targeted') return 'Sakin saat'
  return 'Sana özel'
}

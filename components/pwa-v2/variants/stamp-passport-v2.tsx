'use client'
import type { StampCardProps } from './stamp-types'
import { StreakBadge } from './stamp-streak-badge'

// Stamp Passport v2 — Vintage travel-passport pages with city/date entries and a folded corner.

export function StampPassportV2({ current, total, rewardName, streak, onStreakPress }: StampCardProps) {
  const remaining = total - current
  const today = new Date()
  const cities = ['IST', 'ANK', 'IZM', 'BOD', 'ESK', 'TBZ', 'ANT', 'BUR', 'ADA', 'GAZ', 'KON', 'SAM']
  const entries = Array.from({ length: total }).map((_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (current - 1 - i) * 3)
    return {
      city: cities[i % cities.length],
      date: `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`,
      angle: ((i * 23) % 16) - 8,
    }
  })
  return (
    <div style={{ position: 'relative', borderRadius: 'var(--radius-sm)', padding: 'var(--space-lg)', background: '#f7f0e1', backgroundImage: 'repeating-linear-gradient(0deg, transparent 0 18px, rgba(0,0,0,0.025) 18px 19px), radial-gradient(circle at 30% 0%, rgba(0,0,0,0.06), transparent 50%)', boxShadow: 'var(--shadow-card), inset 0 0 0 1px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: 0, right: 0, width: 24, height: 24, background: 'linear-gradient(225deg, #e8dcc1 50%, transparent 50%)', boxShadow: '-1px 1px 2px rgba(0,0,0,0.08)' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-md)' }}>
        <div>
          <p style={{ fontFamily: '"Courier New", monospace', fontSize: 'var(--font-size-tiny)', letterSpacing: '0.3em', textTransform: 'uppercase', color: '#3a2c19', fontWeight: 700, margin: 0 }}>Loyalty Passport</p>
          <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', color: '#1a1208', fontWeight: 700, margin: '4px 0 0', letterSpacing: '-0.01em' }}>{rewardName}</p>
        </div>
        {streak !== undefined && <StreakBadge streak={streak} onClick={onStreakPress} tone="brand" />}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 'var(--space-md)' }}>
        {entries.map((entry, i) => {
          const filled = i < current
          return (
            <div key={i} style={{ aspectRatio: '1', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {filled ? (
                <div style={{ width: '92%', height: '92%', borderRadius: '50%', border: '1.5px solid var(--color-brand)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transform: `rotate(${entry.angle}deg)`, color: 'var(--color-brand)', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '0.5px solid var(--color-brand)', opacity: 0.5 }} />
                  <p style={{ fontFamily: '"Courier New", monospace', fontSize: '4cqw', fontWeight: 800, lineHeight: 1, margin: 0 }}>{entry.city}</p>
                  <p style={{ fontFamily: '"Courier New", monospace', fontSize: '2.4cqw', fontWeight: 600, margin: '2px 0 0', opacity: 0.85 }}>{entry.date}</p>
                </div>
              ) : (
                <div style={{ width: '85%', height: '85%', borderRadius: '50%', border: '1px dashed rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,0,0,0.3)', fontFamily: '"Courier New", monospace', fontSize: 'var(--font-size-tiny)', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-sm)', borderTop: '1px dashed rgba(0,0,0,0.25)', display: 'flex', justifyContent: 'space-between', fontFamily: '"Courier New", monospace', fontSize: 'var(--font-size-tiny)', color: '#3a2c19', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        <span>Visits: {current} / {total}</span>
        <span>{remaining > 0 ? `${remaining} to claim` : 'Approved'}</span>
      </div>
    </div>
  )
}

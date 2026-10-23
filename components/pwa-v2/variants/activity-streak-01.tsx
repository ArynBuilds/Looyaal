'use client'

// Activity Streak 01 — Big streak number hero + week day indicators + minimal visit list

import type { ActivityProps } from './activity-types'

export function ActivityStreak01({ streak, totalVisits, totalRewards, lastVisits }: ActivityProps) {
  const days = ['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz']
  // Show which days this week had visits (mock: fill first N days based on streak)
  const visitedDays = Array.from({ length: 7 }).map((_, i) => i < streak)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Streak hero */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-xl)',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 'var(--font-weight-heading)',
          fontSize: 'calc(var(--font-size-hero) * 1.5)',
          color: 'var(--color-brand)',
          lineHeight: 1,
        }}>{streak}</p>
        <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text-secondary)', marginTop: 'var(--space-xs)' }}>
          bu hafta ziyaret
        </p>

        {/* Week day indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-sm)', marginTop: 'var(--space-lg)' }}>
          {days.map((d, i) => (
            <div key={d} style={{ textAlign: 'center' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: visitedDays[i] ? 'var(--color-brand)' : 'var(--color-stamp-empty)',
                border: visitedDays[i] ? 'none' : '1px solid var(--color-stamp-border)',
                marginBottom: 4,
              }}>
                {visitedDays[i] && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                )}
              </div>
              <p style={{ fontSize: 8, color: 'var(--color-text-faint)' }}>{d}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats + visits */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        <div style={{
          flex: 1,
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-md)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 'var(--font-size-h1)', fontWeight: 700, color: 'var(--color-text)' }}>{totalVisits}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)' }}>Toplam</p>
        </div>
        <div style={{
          flex: 1,
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-md)',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 'var(--font-size-h1)', fontWeight: 700, color: 'var(--color-brand)' }}>{totalRewards}</p>
          <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)' }}>Ödül</p>
        </div>
      </div>

      {/* Recent visits */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}>
        {lastVisits.slice(0, 3).map((v, i) => (
          <div key={i} style={{
            padding: `var(--space-sm) var(--space-lg)`,
            display: 'flex',
            justifyContent: 'space-between',
            borderBottom: i < 2 ? '1px solid var(--color-divider)' : 'none',
          }}>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text)' }}>{v.date}</p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-faint)' }}>{v.location}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

// Activity Achievement 01 — Gamified: milestone badges + progress to next milestone + visits

import type { ActivityProps } from './activity-types'

export function ActivityAchievement01({ streak, totalVisits, totalRewards, lastVisits }: ActivityProps) {
  // Milestones
  const milestones = [
    { target: 5, label: 'Ilk Adim', icon: '1' },
    { target: 10, label: 'Duzenli', icon: '10' },
    { target: 25, label: 'Sadik', icon: '25' },
    { target: 50, label: 'VIP', icon: '50' },
    { target: 100, label: 'Efsane', icon: '100' },
  ]
  const nextMilestone = milestones.find(m => m.target > totalVisits) || milestones[milestones.length - 1]
  const prevTarget = milestones.filter(m => m.target <= totalVisits).pop()?.target || 0
  const progress = nextMilestone ? (totalVisits - prevTarget) / (nextMilestone.target - prevTarget) : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Milestone badges */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-lg)',
      }}>
        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
          fontWeight: 600,
          marginBottom: 'var(--space-md)',
        }}>Basarimlar</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--space-xs)' }}>
          {milestones.map(m => {
            const earned = totalVisits >= m.target
            return (
              <div key={m.target} style={{ textAlign: 'center', flex: 1 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: earned ? 'var(--color-brand)' : 'var(--color-stamp-empty)',
                  border: earned ? 'none' : '1px dashed var(--color-stamp-border)',
                  boxShadow: earned ? '0 2px 8px var(--color-brand-glow-strong)' : 'none',
                }}>
                  {earned ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <span style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)', fontWeight: 600 }}>{m.icon}</span>
                  )}
                </div>
                <p style={{ fontSize: 7, color: earned ? 'var(--color-brand)' : 'var(--color-text-faint)', marginTop: 4, fontWeight: earned ? 600 : 400 }}>{m.label}</p>
              </div>
            )
          })}
        </div>

        {/* Progress to next */}
        {nextMilestone && totalVisits < nextMilestone.target && (
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
              <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)' }}>Siradaki: {nextMilestone.label}</p>
              <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', fontWeight: 600 }}>{totalVisits}/{nextMilestone.target}</p>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: 'var(--color-stamp-empty)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress * 100}%`, borderRadius: 2, background: 'var(--color-brand)', transition: 'var(--transition)' }} />
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
        {[
          { v: totalVisits, l: 'Ziyaret' },
          { v: totalRewards, l: 'Ödül' },
          { v: streak, l: 'Bu Hafta' },
        ].map(s => (
          <div key={s.l} style={{
            flex: 1,
            background: 'var(--color-card)',
            border: '1px solid var(--color-card-border)',
            borderRadius: 'var(--radius-card)',
            padding: 'var(--space-md)',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)' }}>{s.v}</p>
            <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-muted)' }}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Recent visits */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}>
        <p style={{
          fontSize: 'var(--font-size-label)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 'var(--letter-spacing-label)',
          fontWeight: 600,
          padding: `var(--space-md) var(--space-lg) var(--space-xs)`,
        }}>Son Ziyaretler</p>
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

'use client'

import { Flame, Trophy, Shield, Gift, Coffee } from 'lucide-react'

const STAMP_MILESTONES = [3, 5, 7, 10, 15, 20]
const FREE_ITEM_INTERVAL = 30

interface StreakDetailProps {
  currentStreak: number
  longestStreak: number
  graceAvailable: boolean
}

export function StreakDetail({ currentStreak, longestStreak, graceAvailable }: StreakDetailProps) {
  const nextStampMilestone = STAMP_MILESTONES.find(m => m > currentStreak)
  const nextFreeItem = currentStreak > 0
    ? Math.ceil(currentStreak / FREE_ITEM_INTERVAL) * FREE_ITEM_INTERVAL
    : FREE_ITEM_INTERVAL
  const daysToFreeItem = nextFreeItem - currentStreak

  // Progress toward whichever milestone is closer
  const nextMilestone = nextStampMilestone && nextStampMilestone < nextFreeItem ? nextStampMilestone : nextFreeItem
  const prevMilestone = currentStreak > 0
    ? [...STAMP_MILESTONES, ...Array.from({ length: 10 }, (_, i) => (i + 1) * FREE_ITEM_INTERVAL)]
        .filter(m => m <= currentStreak).pop() || 0
    : 0
  const progress = nextMilestone > prevMilestone
    ? ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    : 100

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Hero number */}
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '12px 24px',
          borderRadius: 'var(--radius-full)',
          background: currentStreak > 0 ? 'var(--color-brand)' : 'var(--color-card)',
          boxShadow: currentStreak > 0 ? '0 4px 20px var(--color-brand-glow-strong)' : 'none',
        }}>
          <Flame size={24} style={{ color: currentStreak > 0 ? 'white' : 'var(--color-text-muted)' }} />
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 800,
            fontSize: 28, color: currentStreak > 0 ? 'white' : 'var(--color-text-muted)',
            lineHeight: 1,
          }}>
            {currentStreak}
          </span>
          <span style={{
            fontSize: 'var(--font-size-body)', fontWeight: 600,
            color: currentStreak > 0 ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)',
          }}>
            gün
          </span>
        </div>
      </div>

      {/* Progress to next milestone */}
      {currentStreak > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-secondary)' }}>
              Sonraki ödül
            </span>
            <span style={{ fontSize: 'var(--font-size-label)', fontWeight: 600, color: 'var(--color-brand)' }}>
              {nextMilestone} gün
            </span>
          </div>
          <div style={{ background: 'var(--color-card)', borderRadius: 8, height: 10, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 8,
              background: `linear-gradient(90deg, var(--color-brand), var(--color-brand-light))`,
              width: `${Math.min(100, progress)}%`,
              transition: 'width 0.4s ease',
              boxShadow: '0 0 8px var(--color-brand-glow)',
            }} />
          </div>
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)', marginTop: 6, textAlign: 'center' }}>
            {nextMilestone - currentStreak} gün sonra ödül kazanırsın!
          </p>
        </div>
      )}

      {/* Info cards — hide when both are zero (looks broken for new users) */}
      {(longestStreak > 0 || graceAvailable) && (
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            flex: 1, padding: 14, borderRadius: 'var(--radius-card)',
            background: 'var(--color-card)', border: '1px solid var(--color-card-border)',
            textAlign: 'center',
          }}>
            <Trophy size={18} style={{ color: 'var(--color-text-muted)', margin: '0 auto 6px' }} />
            <p style={{ fontSize: 'var(--font-size-h3)', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
              {longestStreak}
            </p>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              En uzun seri
            </p>
          </div>

          <div style={{
            flex: 1, padding: 14, borderRadius: 'var(--radius-card)',
            background: 'var(--color-card)', border: '1px solid var(--color-card-border)',
            textAlign: 'center',
          }}>
            <Shield size={18} style={{ color: graceAvailable ? 'var(--color-brand)' : 'var(--color-text-muted)', margin: '0 auto 6px' }} />
            <p style={{ fontSize: 'var(--font-size-h3)', fontWeight: 800, color: graceAvailable ? 'var(--color-brand)' : 'var(--color-text-muted)', fontFamily: 'var(--font-heading)' }}>
              {graceAvailable ? '1' : '0'}
            </p>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-muted)', marginTop: 2 }}>
              Gün izni
            </p>
          </div>
        </div>
      )}

      {/* Milestone list — stamps */}
      <div>
        <p style={{ fontSize: 'var(--font-size-label)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
          Bonus puanlar
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {STAMP_MILESTONES.map(m => {
            const reached = currentStreak >= m
            const isNext = !reached && m === STAMP_MILESTONES.find(ms => ms > currentStreak)
            return (
              <div key={m} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                background: reached ? 'var(--color-brand-glow)' : 'var(--color-card)',
                border: `1px solid ${reached ? 'var(--color-brand)' : isNext ? 'var(--color-brand)' : 'var(--color-card-border)'}`,
                opacity: reached ? 1 : isNext ? 0.9 : 0.5,
              }}>
                <Gift size={14} style={{ color: reached || isNext ? 'var(--color-brand)' : 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 'var(--font-size-label)', fontWeight: 600, color: reached ? 'var(--color-brand)' : isNext ? 'var(--color-text)' : 'var(--color-text-muted)', flex: 1 }}>
                  {m} gün seri
                </span>
                <span style={{ fontSize: 'var(--font-size-small)', color: reached ? 'var(--color-brand)' : isNext ? 'var(--color-text-secondary)' : 'var(--color-text-muted)' }}>
                  +1 bonus puan
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Free item milestones */}
      <div>
        <p style={{ fontSize: 'var(--font-size-label)', fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
          Ücretsiz ürün
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[30, 60, 90].map(m => {
            const reached = currentStreak >= m
            return (
              <div key={m} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                background: reached
                  ? `linear-gradient(135deg, var(--color-brand-dark), var(--color-brand))`
                  : 'var(--color-card)',
                border: `1px solid ${reached ? 'var(--color-brand)' : 'var(--color-card-border)'}`,
                opacity: reached ? 1 : 0.7,
              }}>
                <Coffee size={16} style={{ color: reached ? 'white' : 'var(--color-text-muted)' }} />
                <span style={{ fontSize: 'var(--font-size-label)', fontWeight: 600, color: reached ? 'white' : 'var(--color-text-muted)', flex: 1 }}>
                  {m} gün seri
                </span>
                <span style={{ fontSize: 'var(--font-size-small)', fontWeight: 600, color: reached ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)' }}>
                  Favori ürünün hediye!
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Empty state */}
      {currentStreak === 0 && (
        <div style={{
          textAlign: 'center', padding: '8px 0',
          color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body)',
        }}>
          Her gün gel, seri yap, ödüller kazan!
        </div>
      )}
    </div>
  )
}

'use client'
// LOCKED — This file is part of the onboarding flow and must NOT be modified.// It is independent of the PWA design system (tokens, variants, templates).// Any changes to this file require explicit approval.

import { useEffect } from 'react'
import { useTheme } from './theme-provider'

interface StampCelebrationProps {
  title: string           // "Puaniniz kazanildi!" or "Odulunuz onaylandi!"
  subtitle: string        // "9 puan sonra bedava kahve" or "Kartiniz sifirlandi"
  currentStamps: number
  totalRequired: number
  onComplete: () => void
  autoCloseMs?: number    // default 3000
}

export function StampCelebration({ title, subtitle, currentStamps, totalRequired, onComplete, autoCloseMs = 3000 }: StampCelebrationProps) {
  const theme = useTheme()
  const p = theme.palette

  useEffect(() => {
    // Haptic feedback
    if ('vibrate' in navigator) navigator.vibrate([50, 50, 100])
    const timer = setTimeout(onComplete, autoCloseMs)
    return () => clearTimeout(timer)
  }, [onComplete, autoCloseMs])

  // Build stamp row: 6 slots visible (first N filled, last = gift)
  const visibleSlots = Math.min(totalRequired, 6)

  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center" style={{ background: 'var(--bg, #0f0f0f)' }}>
      {/* Stamp circle — exact stampIn animation from onboarding */}
      <div className="animate-[stampIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
        <div className="flex items-center justify-center" style={{
          width: 'var(--s-96)',
          height: 'var(--s-96)',
          borderRadius: '50%',
          background: p.primary,
          boxShadow: `0 0 60px ${p.glow}, 0 0 120px ${p.glow}`,
        }}>
          <svg style={{ width: 'var(--s-40)', height: 'var(--s-40)' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      {/* Title */}
      <h2 className="animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0" style={{
        marginTop: 'var(--s-10)',
        fontSize: 'var(--t-20)',
        fontWeight: 700,
        color: theme.isDark ? 'white' : '#111827',
        textAlign: 'center',
      }}>
        {title}
      </h2>

      {/* Subtitle */}
      <p className="animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0" style={{
        marginTop: 'var(--s-3)',
        fontSize: 'var(--t-12)',
        color: theme.isDark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
        textAlign: 'center',
      }}>
        {subtitle}
      </p>

      {/* Mini stamp card */}
      <div className="animate-[fadeInUp_0.5s_ease-out_0.3s_forwards] opacity-0" style={{
        marginTop: 'var(--s-12)',
        width: '80%',
        maxWidth: '300px',
        padding: 'var(--s-8)',
        background: p.cardBg,
        border: `${theme.border_width}px solid ${p.border}`,
        borderRadius: theme.radius || 'var(--s-6)',
      }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--s-4)' }}>
          <p style={{ fontSize: 'var(--t-7)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: p.subtleText }}>{theme.name}</p>
          <p style={{ fontSize: 'var(--t-10)', fontWeight: 700, color: p.primary }}>{currentStamps} / {totalRequired}</p>
        </div>

        <div className="flex justify-center" style={{ gap: 'var(--s-2)' }}>
          {Array.from({ length: visibleSlots }).map((_, i) => {
            const isFilled = i < currentStamps
            const isReward = i === visibleSlots - 1 && visibleSlots === totalRequired
            return (
              <div key={i} className="flex items-center justify-center" style={{
                width: 'var(--s-28)',
                height: 'var(--s-28)',
                borderRadius: '50%',
                ...(isFilled ? { background: p.primary }
                  : isReward ? { border: `1px solid ${p.borderStrong}`, background: p.stampFill }
                  : { border: `1px dashed rgba(255,255,255,0.1)` }),
                // Newest stamp gets a scale animation
                ...(isFilled && i === currentStamps - 1 ? { animation: 'stampIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.4s forwards', opacity: 0 } : {}),
              }}>
                {isFilled && <svg style={{ width: 'var(--s-10)', height: 'var(--s-10)' }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>}
                {!isFilled && isReward && <svg style={{ width: 'var(--s-8)', height: 'var(--s-8)' }} viewBox="0 0 24 24" fill="none" stroke={p.primary} strokeWidth="1.5"><path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/></svg>}
                {!isFilled && !isReward && <span style={{ color: 'rgba(255,255,255,0.12)', fontSize: 'var(--t-7)' }}>{i + 1}</span>}
              </div>
            )
          })}
        </div>

        {/* Progress bar */}
        <div className="rounded-full overflow-hidden" style={{ marginTop: 'var(--s-4)', height: 'var(--s-1h)', background: 'rgba(255,255,255,0.05)' }}>
          <div className="h-full rounded-full" style={{ width: `${(currentStamps / totalRequired) * 100}%`, background: p.primary, transition: 'width 0.6s ease-out 0.5s' }} />
        </div>
      </div>

      <style>{`
        @keyframes stampIn { 0% { opacity:0; transform:scale(0) rotate(-90deg); } 70% { transform:scale(1.1) rotate(5deg); } 100% { opacity:1; transform:scale(1) rotate(0deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

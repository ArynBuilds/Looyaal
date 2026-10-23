'use client'
// LOCKED — This file is part of the onboarding flow and must NOT be modified.// It is independent of the PWA design system (tokens, variants, templates).// Any changes to this file require explicit approval.

import { useTheme } from './theme-provider'

interface OnboardingStampProps {
  stampsRequired: number
  rewardName: string
  onInstall: () => void
  onSkip: () => void
}

const GiftIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
    <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)

export function OnboardingStamp({ stampsRequired, rewardName, onInstall, onSkip }: OnboardingStampProps) {
  const theme = useTheme()

  // Build stamp grid: row 1 = 6 slots, row 2 = remaining
  const row1Count = Math.min(stampsRequired, 6)
  const row2Count = Math.max(stampsRequired - 6, 0)

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg, #0f0f0f)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-7">
        {/* Checkmark stamp animation */}
        <div className="animate-[stampIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
          <div className="w-24 h-24 rounded-full bg-amber-600 flex items-center justify-center shadow-xl" style={{ boxShadow: '0 0 40px rgba(217,119,6,0.2)' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>

        <h2 className="mt-6 text-2xl font-bold text-white animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0">
          Ilk puaniniz kazanildi
        </h2>
        <p className="mt-2 text-white/30 text-sm animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0">
          {stampsRequired - 1} puan sonra {rewardName.toLowerCase()}
        </p>

        {/* Stamp card */}
        <div className="mt-8 w-full rounded-2xl p-5 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards] opacity-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/30 text-[11px] font-medium tracking-wider uppercase">{theme.name}</p>
            <p className="text-amber-500 text-xs font-semibold">1 / {stampsRequired}</p>
          </div>

          {/* Row 1 */}
          <div className="flex gap-2 justify-center">
            {/* First slot = earned */}
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            {/* Remaining row 1 empty slots */}
            {Array.from({ length: row1Count - 1 }).map((_, i) => {
              const slotNum = i + 2
              const isLast = slotNum === stampsRequired
              return (
                <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={isLast
                    ? { border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.1)' }
                    : { border: '1px dashed rgba(255,255,255,0.1)' }
                  }>
                  {isLast ? <GiftIcon /> : <span className="text-white/15 text-[10px]">{slotNum}</span>}
                </div>
              )
            })}
          </div>

          {/* Row 2 (if > 6 stamps) */}
          {row2Count > 0 && (
            <div className="flex gap-2 justify-center mt-2">
              {Array.from({ length: row2Count }).map((_, i) => {
                const slotNum = row1Count + i + 1
                const isLast = slotNum === stampsRequired
                return (
                  <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={isLast
                      ? { border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.1)' }
                      : { border: '1px dashed rgba(255,255,255,0.1)' }
                    }>
                    {isLast ? <GiftIcon /> : <span className="text-white/15 text-[10px]">{slotNum}</span>}
                  </div>
                )
              })}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4 w-full h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-amber-600" style={{ width: `${(1 / stampsRequired) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="px-7 pb-10">
        <button
          onClick={onInstall}
          className="w-full py-3.5 rounded-xl bg-amber-600 text-white font-semibold text-sm animate-[fadeInUp_0.5s_ease-out_0.4s_forwards] opacity-0"
        >
          Kartimi Kaydet
        </button>
        <button
          onClick={onSkip}
          className="w-full mt-2 py-3 text-white/20 text-xs font-medium animate-[fadeInUp_0.5s_ease-out_0.5s_forwards] opacity-0"
        >
          Simdilik gecir
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes stampIn { 0% { opacity:0; transform:scale(0) rotate(-90deg); } 70% { transform:scale(1.1) rotate(5deg); } 100% { opacity:1; transform:scale(1) rotate(0deg); } }
      `}</style>
    </div>
  )
}

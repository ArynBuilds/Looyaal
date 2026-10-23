'use client'
// LOCKED — This file is part of the onboarding flow and must NOT be modified.// It is independent of the PWA design system (tokens, variants, templates).// Any changes to this file require explicit approval.

import { useTheme } from './theme-provider'

interface OnboardingWelcomeProps {
  stampsRequired: number
  rewardName: string
  onContinue: () => void
}

// Coffee cup SVG used as default logo icon
const CoffeeIcon = ({ size = 18, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    <line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
  </svg>
)

// Gift icon for the reward slot
const GiftIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
    <path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
  </svg>
)

export function OnboardingWelcome({ stampsRequired, rewardName, onContinue }: OnboardingWelcomeProps) {
  const theme = useTheme()

  // Show 6 slots: 1, 2, 3, ..., 9, gift
  const previewSlots = [
    { label: '1' }, { label: '2' }, { label: '3' },
    { label: '...' }, { label: String(stampsRequired - 1) }, { type: 'gift' as const },
  ]

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg, #0f0f0f)' }}>
      <div className="flex-1 flex flex-col px-7 pt-14">
        {/* Shop header */}
        <div className="flex items-center gap-3 animate-[fadeInUp_0.5s_ease-out_forwards]">
          {theme.logo_url ? (
            <img src={theme.logo_url} alt={theme.name} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center">
              <CoffeeIcon />
            </div>
          )}
          <div>
            <p className="text-white font-semibold">{theme.name}</p>
            <p className="text-white/30 text-xs">Hosgeldiniz</p>
          </div>
        </div>

        {/* Value proposition */}
        <div className="mt-12 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0">
          <h2 className="text-2xl font-bold text-white leading-snug">
            Sadakat kartiniz<br/>hazir.
          </h2>
          <p className="mt-3 text-white/40 text-sm leading-relaxed">
            Her ziyaretinizde puan kazanin.<br/>{stampsRequired} puan = 1 {rewardName.toLowerCase()}.
          </p>
        </div>

        {/* Card preview */}
        <div className="mt-8 rounded-2xl p-5 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/30 text-[11px] font-medium tracking-wider uppercase">Sadakat Karti</p>
            <p className="text-amber-500 text-xs font-semibold">0 / {stampsRequired}</p>
          </div>
          <div className="flex gap-2 justify-center">
            {previewSlots.map((slot, i) => (
              <div key={i} className="w-10 h-10 rounded-full flex items-center justify-center"
                style={slot.type === 'gift'
                  ? { border: '1px solid rgba(217,119,6,0.3)', background: 'rgba(217,119,6,0.1)' }
                  : { border: '1px dashed rgba(255,255,255,0.1)' }
                }>
                {slot.type === 'gift'
                  ? <GiftIcon />
                  : <span className="text-white/15 text-[10px]">{slot.label}</span>
                }
              </div>
            ))}
          </div>
        </div>

        {/* Trust signal */}
        <div className="mt-6 flex items-center gap-2 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards] opacity-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <p className="text-white/25 text-xs">Ucretsiz. Kart bilgisi gerekmez.</p>
        </div>
      </div>

      <div className="px-7 pb-10">
        <button
          onClick={onContinue}
          className="w-full py-3.5 rounded-xl bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 transition-colors animate-[fadeInUp_0.5s_ease-out_0.4s_forwards] opacity-0"
        >
          Devam Et
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

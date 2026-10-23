'use client'
// LOCKED — This file is part of the onboarding flow and must NOT be modified.// It is independent of the PWA design system (tokens, variants, templates).// Any changes to this file require explicit approval.

import { useTheme } from './theme-provider'

interface InstallIOSProps {
  onDone: () => void
}

const CoffeeIcon = ({ size = 18, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
  </svg>
)

export function InstallIOS({ onDone }: InstallIOSProps) {
  const theme = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg, #0f0f0f)' }}>
      <div className="flex-1 flex flex-col px-7 pt-10">
        {/* Title */}
        <div className="text-center animate-[fadeInUp_0.5s_ease-out_forwards]">
          <p className="text-white font-semibold text-base">Kartinizi ana ekrana ekleyin</p>
        </div>

        {/* Step 1: Safari bar — tap ••• */}
        <div className="mt-6 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">1</span>
            </div>
            <p style={{ color: 'rgba(235,235,245,0.6)' }} className="text-xs">
              Alttaki <span className="text-white font-medium">...</span> simgesine dokunun
            </p>
          </div>
          <div style={{ background: '#1c1c1e', border: '0.5px solid #38383a' }} className="rounded-[18px] px-3 py-2 flex items-center gap-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.3)" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
            <div style={{ background: '#2c2c2e' }} className="flex-1 rounded-full px-3 py-1.5">
              <p style={{ color: 'rgba(235,235,245,0.3)' }} className="text-[10px] text-center truncate">{typeof window !== 'undefined' ? window.location.host : ''}</p>
            </div>
            <div className="relative flex-shrink-0">
              <div style={{ background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)' }} className="rounded-full w-7 h-7 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <circle cx="6" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18" cy="12" r="1.2"/>
                </svg>
              </div>
              <div className="absolute -inset-1.5 rounded-full border border-white/15 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </div>

        {/* Step 2: ••• menu — tap Paylas */}
        <div className="mt-5 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">2</span>
            </div>
            <p style={{ color: 'rgba(235,235,245,0.6)' }} className="text-xs">
              Menude <span className="text-white font-medium">Paylas</span> butonuna basin
            </p>
          </div>
          <div style={{ background: '#1c1c1e', border: '0.5px solid #38383a' }} className="rounded-2xl overflow-hidden">
            {/* Share — highlighted */}
            <div style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '0.5px solid rgba(84,84,88,0.35)' }} className="px-4 py-3 flex items-center gap-3">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
              <p className="text-white text-[13px]">Paylas...</p>
            </div>
            {/* Bookmark */}
            <div className="px-4 py-3 flex items-center gap-3">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              <p className="text-white text-[13px]">Yer isareti ekle</p>
            </div>
          </div>
        </div>

        {/* Step 3: Share sheet — Ana Ekrana Ekle */}
        <div className="mt-5 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards] opacity-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">3</span>
            </div>
            <p style={{ color: 'rgba(235,235,245,0.6)' }} className="text-xs">
              Asagi kaydirip <span className="text-white font-medium">Ana Ekrana Ekle</span> secin
            </p>
          </div>
          <div style={{ background: '#1c1c1e', border: '0.5px solid #38383a' }} className="rounded-2xl overflow-hidden">
            {/* Placeholder row */}
            <div style={{ borderBottom: '0.5px solid rgba(84,84,88,0.35)' }} className="px-4 py-2.5 flex items-center gap-3">
              <div className="w-5 h-5 rounded" style={{ background: '#2c2c2e' }} />
              <div className="h-2 w-24 rounded-full" style={{ background: '#2c2c2e' }} />
            </div>
            {/* Ana Ekrana Ekle — highlighted */}
            <div style={{ background: 'rgba(255,255,255,0.06)' }} className="px-4 py-3 flex items-center gap-3">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="4"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <p className="text-white text-[13px]">Ana Ekrana Ekle</p>
            </div>
          </div>
        </div>

        {/* Step 4: Tap Ekle — iOS 26 Liquid Glass */}
        <div className="mt-5 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards] opacity-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">4</span>
            </div>
            <p style={{ color: 'rgba(235,235,245,0.6)' }} className="text-xs">
              <span className="text-white font-medium">Ekle</span> butonuna basin
            </p>
          </div>
          <div style={{ background: '#1c1c1e', border: '0.5px solid #38383a' }} className="rounded-2xl p-3.5">
            {/* Top row: X — title — Ekle pill */}
            <div className="flex items-center justify-between">
              {/* X cancel circle */}
              <div style={{ background: 'rgba(120,120,128,0.24)', border: '0.5px solid rgba(255,255,255,0.08)' }}
                className="h-[30px] w-[30px] rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
                  <line x1="17" y1="7" x2="7" y2="17"/><line x1="7" y1="7" x2="17" y2="17"/>
                </svg>
              </div>
              {/* Title */}
              <span style={{ color: 'rgba(235,235,245,0.6)' }} className="text-[13px] font-medium">Ana Ekrana Ekle</span>
              {/* Ekle pill */}
              <div style={{ background: '#0a84ff', border: '0.5px solid rgba(255,255,255,0.15)' }} className="rounded-full px-3.5 py-1.5">
                <span className="text-white text-[12px] font-semibold">Ekle</span>
              </div>
            </div>
            {/* App preview */}
            <div className="mt-3 flex items-center gap-3">
              {theme.logo_url ? (
                <img src={theme.logo_url} alt={theme.name} className="w-11 h-11 rounded-2xl object-cover" />
              ) : (
                <div className="w-11 h-11 rounded-2xl bg-amber-600 flex items-center justify-center">
                  <CoffeeIcon />
                </div>
              )}
              <div>
                <p style={{ color: 'rgba(235,235,245,0.85)' }} className="text-[13px] font-medium">{theme.name}</p>
                <p style={{ color: 'rgba(235,235,245,0.3)' }} className="text-[11px]">{typeof window !== 'undefined' ? window.location.host : ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-7 pb-8 mt-auto">
        <button
          onClick={onDone}
          className="w-full py-3 text-white/20 text-xs font-medium animate-[fadeInUp_0.5s_ease-out_0.5s_forwards] opacity-0"
        >
          Eklemeden devam et
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

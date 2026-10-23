'use client'

import { useState } from 'react'
import { useTheme } from './theme-provider'

interface InstallAndroidProps {
  deferredPrompt: BeforeInstallPromptEvent | null
  onInstalled: () => void
  onSkip: () => void
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Phase = 'sheet' | 'fallback'

const CoffeeIcon = ({ size = 20, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
    <line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
  </svg>
)

export function InstallAndroid({ deferredPrompt, onInstalled, onSkip }: InstallAndroidProps) {
  const theme = useTheme()
  // If Chrome never fired beforeinstallprompt for this page load, the only
  // path to install is the browser menu. Skip the sheet, go straight to fallback.
  const [phase, setPhase] = useState<Phase>(deferredPrompt ? 'sheet' : 'fallback')

  async function handleInstall() {
    if (!deferredPrompt) { setPhase('fallback'); return }
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') onInstalled()
    // Dismissed → don't skip them out; show the menu-path hint as a second chance.
    else setPhase('fallback')
  }

  if (phase === 'fallback') {
    return <InstallAndroidFallback onSkip={onSkip} />
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg, #0f0f0f)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-7 relative">
        {/* Background: dimmed stamp card */}
        <div className="absolute inset-0 opacity-30 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-amber-600 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <p className="mt-4 text-white text-lg font-bold">Ilk puaniniz kazanildi</p>
        </div>

        {/* Chrome-style bottom sheet */}
        <div className="relative z-10 w-full animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0">
          <div className="bg-[#2d2d2d] rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.6)' }}>
            {/* App info */}
            <div className="p-5 flex items-center gap-4">
              {theme.logo_url ? (
                <img src={theme.logo_url} alt={theme.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center flex-shrink-0">
                  <CoffeeIcon />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{theme.name}</p>
                <p className="text-white/40 text-xs mt-0.5 truncate">{typeof window !== 'undefined' ? window.location.host : ''}</p>
              </div>
            </div>

            {/* Description */}
            <div className="px-5 pb-4">
              <p className="text-white/50 text-xs leading-relaxed">Bu uygulamayi ana ekraniniza ekleyerek hizli erisim saglayin.</p>
            </div>

            {/* Screenshot preview */}
            <div className="mx-5 mb-4 rounded-xl p-3 flex items-center gap-3" style={{ background: 'rgba(0,0,0,0.3)' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(217,119,6,0.2)' }}>
                <CoffeeIcon size={16} color="#d97706" />
              </div>
              <div>
                <p className="text-white/60 text-xs font-medium">Sadakat Karti</p>
                <p className="text-white/25 text-[10px]">Puan topla, bedava kahve kazan</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="border-t border-white/5 flex">
              <button onClick={() => setPhase('fallback')} className="flex-1 py-4 text-center text-white/40 text-sm font-medium">Iptal</button>
              <div className="w-px bg-white/5" />
              <button onClick={handleInstall} className="flex-1 py-4 text-center text-amber-500 text-sm font-semibold">Yukle</button>
            </div>
          </div>
        </div>

        {/* Info note */}
        <div className="relative z-10 mt-6 rounded-xl p-4 animate-[fadeInUp_0.5s_ease-out_0.5s_forwards] opacity-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-start gap-3">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" className="flex-shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <p className="text-white/40 text-xs leading-relaxed">
              Musteri &quot;Yukle&quot; dediginde Chrome otomatik olarak uygulamayi ana ekrana ekler. Tek dokus — islem tamam.
            </p>
          </div>
        </div>
      </div>

      <div className="px-7 pb-10">
        <p className="text-center text-white/15 text-[10px]">Chrome beforeinstallprompt API</p>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

/**
 * Shown when Chrome's beforeinstallprompt is unavailable (already consumed,
 * never fired, or user dismissed). Walks the customer through the browser
 * menu path — that route is always available even when Chrome silences the
 * automatic prompt after repeated dismissals.
 */
function InstallAndroidFallback({ onSkip }: { onSkip: () => void }) {
  const theme = useTheme()

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg, #0f0f0f)' }}>
      <div className="flex-1 flex flex-col px-7 pt-10">
        <div className="text-center animate-[fadeInUp_0.5s_ease-out_forwards]">
          <p className="text-white font-semibold text-base">{theme.name}&apos;i ana ekrana ekleyin</p>
          <p className="text-white/40 text-xs mt-1.5">Tarayicidan iki dokunusta ekleyebilirsiniz</p>
        </div>

        {/* Step 1: tap browser menu (three dots) */}
        <div className="mt-7 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">1</span>
            </div>
            <p style={{ color: 'rgba(235,235,245,0.6)' }} className="text-xs">
              Sag ustteki <span className="text-white font-medium">⋮</span> simgesine dokunun
            </p>
          </div>
          <div style={{ background: '#1c1c1e', border: '0.5px solid #38383a' }} className="rounded-[18px] px-3 py-2.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div style={{ background: '#2c2c2e' }} className="flex-1 rounded-full px-3 py-1.5">
                <p style={{ color: 'rgba(235,235,245,0.3)' }} className="text-[10px] truncate">{typeof window !== 'undefined' ? window.location.host : ''}</p>
              </div>
            </div>
            <div className="flex flex-col gap-[3px] flex-shrink-0 px-1">
              <div className="w-[3px] h-[3px] rounded-full bg-amber-500" />
              <div className="w-[3px] h-[3px] rounded-full bg-amber-500" />
              <div className="w-[3px] h-[3px] rounded-full bg-amber-500" />
            </div>
          </div>
        </div>

        {/* Step 2: tap "Ana ekrana ekle" in the menu */}
        <div className="mt-5 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">2</span>
            </div>
            <p style={{ color: 'rgba(235,235,245,0.6)' }} className="text-xs">
              <span className="text-white font-medium">Ana ekrana ekle</span> ya da <span className="text-white font-medium">Uygulamayi yukle</span> secenegine dokunun
            </p>
          </div>
          <div style={{ background: '#1c1c1e', border: '0.5px solid #38383a' }} className="rounded-[18px] overflow-hidden">
            <div className="px-4 py-3 flex items-center gap-3" style={{ borderBottom: '0.5px solid #38383a' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.35)" strokeWidth="1.6"><path d="M12 5v14M5 12h14"/></svg>
              <span style={{ color: 'rgba(235,235,245,0.3)' }} className="text-xs">Yeni sekme</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(217,119,6,0.08)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>
              </svg>
              <span className="text-amber-400 text-xs font-medium">Ana ekrana ekle</span>
            </div>
            <div className="px-4 py-3 flex items-center gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(235,235,245,0.35)" strokeWidth="1.6"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
              <span style={{ color: 'rgba(235,235,245,0.3)' }} className="text-xs">Ayarlar</span>
            </div>
          </div>
        </div>

        {/* Reassurance */}
        <div className="mt-7 rounded-xl p-4 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards] opacity-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-white/45 text-xs leading-relaxed">
            Eklendikten sonra {theme.name} bir uygulama gibi ana ekranda gozukur. Tek dokunusla acilir.
          </p>
        </div>
      </div>

      <div className="px-7 pb-10 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards] opacity-0">
        <button
          onClick={onSkip}
          className="block w-full text-center text-white/35 text-xs font-medium py-3 hover:text-white/60 transition-colors"
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

'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Check, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallHintProps {
  displayName: string
  onContinue: () => void
}

type Mode = 'standalone' | 'android' | 'ios' | 'desktop'

function detectMode(): Mode {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia('(display-mode: standalone)').matches) return 'standalone'
  const ua = window.navigator.userAgent
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'desktop'
}

export function SetupInstallHint({ displayName, onContinue }: InstallHintProps) {
  // Lazy init avoids a setState-in-effect for the initial detection.
  // `null` on the server, real value on first client render.
  const [mode, setMode] = useState<Mode | null>(() =>
    typeof window === 'undefined' ? null : detectMode(),
  )
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }

    function onInstalled() {
      setMode('standalone')
    }

    window.addEventListener('beforeinstallprompt', onPrompt as EventListener)
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt as EventListener)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function triggerInstall() {
    if (!deferred) return
    setInstalling(true)
    try {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
    } finally {
      setInstalling(false)
    }
  }

  if (mode === null) return null

  if (mode === 'standalone') {
    return (
      <Frame title="Sifren hazir" subtitle={`${displayName} olarak girise hazirsin.`}>
        <div className="flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15">
            <Check className="h-7 w-7 text-amber-400" strokeWidth={2.5} />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-white/60">
          Tarayiciyi tek dokunusla acabilirsin.
        </p>
        <Continue onContinue={onContinue} label="Tarayiciya gec" />
      </Frame>
    )
  }

  if (mode === 'android') {
    // Two sub-modes:
    //   deferred captured → one-tap native install button
    //   deferred null (never fired, or already consumed by a dismiss) → visual
    //     menu-path instructions so the user still has a way to install
    if (deferred) {
      return (
        <Frame title="Telefonuna kur" subtitle="Looyaal Barista'yi ana ekranina ekle.">
          <button
            onClick={triggerInstall}
            disabled={installing}
            className="group flex w-full items-center justify-between rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] px-4 py-4 text-left transition-colors hover:bg-amber-500/[0.12] disabled:opacity-60"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                <Download className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Cihaza yukle</p>
                <p className="text-xs text-white/50">Chrome anlik yukleme acar.</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-amber-400 transition-transform group-hover:translate-x-0.5" />
          </button>

          <Note>
            Yukleme bitince Looyaal Barista bir uygulama gibi acilir, adres cubugu gozukmez.
          </Note>

          <Continue onContinue={onContinue} label="Daha sonra" subtle />
        </Frame>
      )
    }

    return (
      <Frame title="Tarayicidan ekle" subtitle="Chrome menusunden Looyaal Barista'yi ana ekrana ekle.">
        <div className="space-y-2.5">
          <AndroidMenuStep
            n={1}
            primary="⋮"
            tail="simgesine dokun (sag ust)"
          />
          <AndroidMenuStep
            n={2}
            primary="Ana ekrana ekle"
            tail="ya da Uygulamayi yukle"
          />
        </div>

        <Note>
          Eklendikten sonra Looyaal Barista ana ekranda bir uygulama gibi acilir.
        </Note>

        <Continue onContinue={onContinue} label="Eklemeden devam et" subtle />
      </Frame>
    )
  }

  if (mode === 'ios') {
    return (
      <Frame title="iPhone'a kur" subtitle="Safari'de Paylas menusunden ana ekrana ekle.">
        <div className="space-y-2.5">
          <IOSStep
            n={1}
            primary="Paylas"
            tail="butonuna dokun"
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            }
          />
          <IOSStep n={2} primary="Ana Ekrana Ekle" tail="secenegine bas" />
          <IOSStep n={3} primary="Ekle" tail="dugmesiyle onayla" />
        </div>

        <Note>
          Bu adim Safari&apos;de calisir. Chrome ya da baska tarayicidaysan once Safari&apos;de ac.
        </Note>

        <Continue onContinue={onContinue} label="Eklemeden devam et" subtle />
      </Frame>
    )
  }

  // Desktop fallback — barista PWAs are phone-only in spirit, but don't block.
  return (
    <Frame title="Telefondan kur" subtitle="Looyaal Barista bir telefon uygulamasi olarak tasarlandi.">
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
          <Smartphone className="h-5 w-5 text-amber-400" />
        </div>
        <p className="text-sm text-white/70">
          Bu baglantiyi telefonunda ac, ardindan ana ekrana ekle.
        </p>
      </div>
      <Continue onContinue={onContinue} label="Tarayiciya gec" />
    </Frame>
  )
}

function Frame({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-[19px] font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/50">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function IOSStep({
  n,
  primary,
  tail,
  icon,
}: {
  n: number
  primary: string
  tail: string
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-600/25 text-[11px] font-bold text-amber-300">
        {n}
      </span>
      {icon && <span className="text-white/60">{icon}</span>}
      <p className="text-sm text-white/80">
        <span className="font-semibold text-white">{primary}</span>{' '}
        <span className="text-white/55">{tail}</span>
      </p>
    </div>
  )
}

function AndroidMenuStep({
  n,
  primary,
  tail,
}: {
  n: number
  primary: string
  tail: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-600/25 text-[11px] font-bold text-amber-300">
        {n}
      </span>
      <p className="text-sm text-white/80">
        <span className="font-semibold text-white">{primary}</span>{' '}
        <span className="text-white/55">{tail}</span>
      </p>
    </div>
  )
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs leading-relaxed text-white/40">{children}</p>
  )
}

function Continue({
  onContinue,
  label,
  subtle,
}: {
  onContinue: () => void
  label: string
  subtle?: boolean
}) {
  if (subtle) {
    return (
      <button
        onClick={onContinue}
        className="block w-full pt-2 text-center text-xs font-medium text-white/35 transition-colors hover:text-white/60"
      >
        {label}
      </button>
    )
  }
  return (
    <button
      onClick={onContinue}
      className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-4 text-[15px] font-semibold text-white shadow-[0_8px_30px_-12px_rgba(217,119,6,0.6)] transition-all hover:bg-amber-500 active:scale-[0.99]"
    >
      {label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  )
}

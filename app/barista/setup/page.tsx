'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertTriangle, Coffee, KeyRound, Lock, MapPin } from 'lucide-react'
import { SetupInstallHint } from '@/components/barista/setup-install-hint'

interface ValidateResult {
  displayName: string
  orgName: string
  orgSlug: string
  locationName: string
}

type Stage =
  | { kind: 'loading' }
  | { kind: 'invalid' }
  | { kind: 'form'; info: ValidateResult }
  | { kind: 'install'; info: ValidateResult }

export default function BaristaSetupPage() {
  return (
    <Suspense fallback={<SetupLoadingScreen />}>
      <BaristaSetupInner />
    </Suspense>
  )
}

function SetupLoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function BaristaSetupInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('t')
  const [stage, setStage] = useState<Stage>({ kind: 'loading' })

  useEffect(() => {
    if (!token) {
      setStage({ kind: 'invalid' })
      return
    }
    let cancelled = false

    fetch(`/api/barista/setup/validate?t=${encodeURIComponent(token)}`)
      .then(async (r) => {
        if (!r.ok) return null
        return r.json() as Promise<ValidateResult>
      })
      .then((data) => {
        if (cancelled) return
        if (!data) setStage({ kind: 'invalid' })
        else setStage({ kind: 'form', info: data })
      })
      .catch(() => {
        if (!cancelled) setStage({ kind: 'invalid' })
      })

    return () => {
      cancelled = true
    }
  }, [token])

  function handleSuccess(info: ValidateResult) {
    setStage({ kind: 'install', info })
  }

  function continueToScanner(orgSlug: string) {
    router.push(`/barista/${orgSlug}`)
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#0a0a0a] text-white">
      <BackgroundGlow />

      <header className="relative px-6 pt-10">
        <div className="mx-auto flex max-w-sm items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
          <Coffee className="h-3.5 w-3.5 text-amber-500" />
          Looyaal Barista
        </div>
      </header>

      <div className="relative flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {stage.kind === 'loading' && (
            <div className="flex items-center justify-center py-20">
              <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            </div>
          )}

          {stage.kind === 'invalid' && <InvalidState />}

          {stage.kind === 'form' && (
            <SetupForm
              token={token!}
              info={stage.info}
              onSuccess={() => handleSuccess(stage.info)}
            />
          )}

          {stage.kind === 'install' && (
            <SetupInstallHint
              displayName={stage.info.displayName}
              onContinue={() => continueToScanner(stage.info.orgSlug)}
            />
          )}
        </div>
      </div>
    </main>
  )
}

function IdentityCard({ info }: { info: ValidateResult }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-amber-400">
        Cihaz eslestiriliyor
      </p>
      <p className="mt-3 text-[26px] font-semibold leading-tight tracking-tight">
        {info.displayName}
      </p>
      <div className="mt-3 space-y-1.5 text-sm text-white/55">
        <p className="flex items-center gap-2">
          <Coffee className="h-3.5 w-3.5 text-white/30" />
          <span>{info.orgName}</span>
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-white/30" />
          <span>{info.locationName}</span>
        </p>
      </div>
    </div>
  )
}

function SetupForm({
  token,
  info,
  onSuccess,
}: {
  token: string
  info: ValidateResult
  onSuccess: () => void
}) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const passwordTooShort = password.length > 0 && password.length < 8
  const mismatch = confirm.length > 0 && confirm !== password
  const ready = password.length >= 8 && confirm === password && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ready) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/barista/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: token, password }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'Sifre kaydedilemedi. QR suresi dolmus olabilir.')
        setSubmitting(false)
        return
      }
      onSuccess()
    } catch {
      setError('Baglanti hatasi. Tekrar deneyin.')
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <IdentityCard info={info} />

      <form onSubmit={handleSubmit} className="space-y-3">
        <h2 className="text-base font-semibold tracking-tight text-white">Bir sifre belirle</h2>
        <p className="-mt-2 text-sm text-white/45">
          Her giriste bu sifreyi kullanacaksin. En az 8 karakter.
        </p>

        <PasswordInput
          icon={<KeyRound className="h-4 w-4" />}
          value={password}
          onChange={setPassword}
          placeholder="Yeni sifre"
          autoFocus
          autoComplete="new-password"
        />

        <PasswordInput
          icon={<Lock className="h-4 w-4" />}
          value={confirm}
          onChange={setConfirm}
          placeholder="Tekrar yaz"
          autoComplete="new-password"
        />

        <div className="min-h-[20px] px-1 text-xs">
          {passwordTooShort && (
            <span className="text-amber-400/80">En az 8 karakter olmali.</span>
          )}
          {!passwordTooShort && mismatch && (
            <span className="text-amber-400/80">Sifreler ayni degil.</span>
          )}
          {!passwordTooShort && !mismatch && password.length >= 8 && confirm === password && (
            <span className="text-emerald-400/80">Hazir.</span>
          )}
        </div>

        {error && (
          <p className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3 py-2.5 text-sm text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!ready}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-4 text-[15px] font-semibold text-white shadow-[0_8px_30px_-12px_rgba(217,119,6,0.6)] transition-all hover:bg-amber-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
        >
          {submitting ? 'Kaydediliyor...' : 'Sifreyi belirle'}
        </button>
      </form>
    </div>
  )
}

function PasswordInput({
  icon,
  value,
  onChange,
  placeholder,
  autoFocus,
  autoComplete,
}: {
  icon: React.ReactNode
  value: string
  onChange: (v: string) => void
  placeholder: string
  autoFocus?: boolean
  autoComplete?: string
}) {
  return (
    <label className="group block">
      <span className="sr-only">{placeholder}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-amber-500">
          {icon}
        </span>
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          minLength={1}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-11 pr-4 text-[15px] text-white outline-none ring-0 transition-colors placeholder:text-white/30 focus:border-amber-500/60 focus:bg-white/[0.06]"
        />
      </div>
    </label>
  )
}

function InvalidState() {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15">
        <AlertTriangle className="h-5 w-5 text-amber-400" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white">Kurulum baglantisi gecersiz</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/50">
          Bu QR suresi dolmus, kullanilmis ya da yenilenmis olabilir. Isletme sahibinden
          yeni kurulum QR&apos;i iste.
        </p>
      </div>
    </div>
  )
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
        style={{ background: 'radial-gradient(closest-side, rgba(217,119,6,0.18), transparent)' }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(217,119,6,0.4) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}

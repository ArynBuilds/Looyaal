'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Coffee, KeyRound, ScanLine } from 'lucide-react'

interface WhoAmI {
  displayName: string
  orgSlug: string
  email: string
}

function readHandleCookie(): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(/(?:^|; )barista_handle=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export default function BaristaLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  // Lazy init: undefined on SSR, real value on first client render.
  const [handle] = useState<string | null | undefined>(() =>
    typeof document === 'undefined' ? undefined : readHandleCookie(),
  )
  const [who, setWho] = useState<WhoAmI | null>(null)
  const [whoError, setWhoError] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!handle) return

    let cancelled = false
    fetch(`/api/barista/whoami?handle=${encodeURIComponent(handle)}&includeEmail=1`)
      .then(async (r) => {
        if (!r.ok) {
          if (!cancelled) setWhoError(true)
          return null
        }
        return r.json() as Promise<WhoAmI>
      })
      .then((data) => {
        if (cancelled) return
        if (data) setWho(data)
        else setWhoError(true)
      })
      .catch(() => {
        if (!cancelled) setWhoError(true)
      })

    return () => {
      cancelled = true
    }
  }, [handle])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!who) return
    setSubmitting(true)
    setError(null)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: who.email,
      password,
    })

    if (authError) {
      setError('Sifre yanlis. Tekrar deneyin.')
      setSubmitting(false)
      return
    }

    router.push(`/barista/${who.orgSlug}`)
  }

  // Initial state: cookie probe in flight.
  if (handle === undefined) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0a0a0a]">
        <div className="h-2 w-2 animate-pulse rounded-full bg-white/30" />
      </main>
    )
  }

  // No handle cookie: empty state — owner must issue a setup QR.
  if (!handle) {
    return <EmptyState />
  }

  // Cookie present but whoami failed: treat as empty.
  if (whoError) {
    return <EmptyState reason="expired" />
  }

  // Cookie present, whoami still loading.
  if (!who) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#0a0a0a]">
        <div className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
      </main>
    )
  }

  return (
    <main className="relative flex min-h-dvh flex-col bg-[#0a0a0a] text-white">
      <BackgroundGlow />

      <div className="relative flex flex-1 flex-col items-stretch justify-center px-6 pb-10 pt-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-white/40">
            <Coffee className="h-3.5 w-3.5 text-amber-500" />
            Looyaal Barista
          </div>

          <h1 className="mt-6 text-[26px] font-semibold leading-tight tracking-tight">
            Hosgeldin, <span className="text-amber-500">{who.displayName}</span>
          </h1>
          <p className="mt-2 text-sm text-white/50">
            Sifreni gir, tarayiciya don. Cihaz Looyaal ile zaten eslestirilmis.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <label className="block">
              <span className="sr-only">Sifre</span>
              <div className="group relative">
                <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30 transition-colors group-focus-within:text-amber-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sifre"
                  autoFocus
                  required
                  minLength={1}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-4 pl-11 pr-4 text-[15px] text-white outline-none ring-0 transition-colors placeholder:text-white/30 focus:border-amber-500/60 focus:bg-white/[0.06]"
                />
              </div>
            </label>

            {error && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-3 py-2.5 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || password.length === 0}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-600 py-4 text-[15px] font-semibold text-white shadow-[0_8px_30px_-12px_rgba(217,119,6,0.6)] transition-all hover:bg-amber-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? (
                'Giris yapiliyor...'
              ) : (
                <>
                  Tarayiciya gec
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-white/30">
            Sifreni unuttun mu? Isletme sahibinden yeni kurulum QR&apos;i iste.
          </p>
        </div>
      </div>
    </main>
  )
}

function EmptyState({ reason }: { reason?: 'expired' }) {
  return (
    <main className="relative flex min-h-dvh flex-col bg-[#0a0a0a] text-white">
      <BackgroundGlow />

      <div className="relative flex flex-1 flex-col items-stretch justify-center px-6 pb-10 pt-16">
        <div className="mx-auto w-full max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <ScanLine className="h-6 w-6 text-amber-500" />
          </div>

          <h1 className="mt-6 text-[22px] font-semibold tracking-tight">
            {reason === 'expired' ? 'Eslestirme gecersiz' : 'Bu cihaz eslestirilmemis'}
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-white/50">
            {reason === 'expired'
              ? 'Hesap bulunamadi ya da kaldirilmis. Isletme sahibinden yeni kurulum QR\'i iste.'
              : 'Telefonunu Looyaal\'a baglamak icin isletme sahibinden kurulum QR\'i iste, sonra okut.'}
          </p>

          <div className="mt-8 space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left">
            <Step n={1} text="Isletme sahibi: Ayarlar > Personel > Kurulum QR." />
            <Step n={2} text="Bu telefonun kamerasiyla QR'i okut." />
            <Step n={3} text="Sifreni belirle, tarayici acilir." />
          </div>
        </div>
      </div>
    </main>
  )
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-amber-600/20 text-[10px] font-bold text-amber-400">
        {n}
      </span>
      <p className="text-sm leading-relaxed text-white/70">{text}</p>
    </div>
  )
}

function BackgroundGlow() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
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

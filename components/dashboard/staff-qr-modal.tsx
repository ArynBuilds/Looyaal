'use client'

import { motion, AnimatePresence } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { Check, Copy, Loader2, RefreshCw, X } from 'lucide-react'

interface StaffQRModalProps {
  open: boolean
  displayName: string | null
  setupToken: string | null
  setupExpiresAt: string | null
  staffId: string | null
  onClose: () => void
  onRefreshed: (next: { setupToken: string; setupExpiresAt: string }) => void
}

function setupUrl(token: string): string {
  if (typeof window === 'undefined') return `/barista/setup?t=${token}`
  return `${window.location.origin}/barista/setup?t=${token}`
}

function formatRemaining(expiresAtIso: string | null): { label: string; warn: boolean } {
  if (!expiresAtIso) return { label: '—', warn: false }
  const ms = new Date(expiresAtIso).getTime() - Date.now()
  if (ms <= 0) return { label: 'Suresi doldu', warn: true }
  const hours = Math.floor(ms / 3_600_000)
  const minutes = Math.floor((ms % 3_600_000) / 60_000)
  if (hours >= 1) return { label: `${hours} sa ${minutes} dk`, warn: hours < 2 }
  return { label: `${minutes} dk`, warn: true }
}

export function StaffQRModal({
  open,
  displayName,
  setupToken,
  setupExpiresAt,
  staffId,
  onClose,
  onRefreshed,
}: StaffQRModalProps) {
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  // Reset transient state when modal toggles or token changes (no setState-in-effect).
  const [resetKey, setResetKey] = useState(`${open}|${setupToken}`)
  const currentKey = `${open}|${setupToken}`
  if (currentKey !== resetKey) {
    setResetKey(currentKey)
    setCopied(false)
    setError(null)
  }

  useEffect(() => {
    if (!open) return
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000)
    return () => window.clearInterval(id)
  }, [open])

  const url = setupToken ? setupUrl(setupToken) : ''
  const remaining = formatRemaining(setupExpiresAt)
  // Reference `tick` so eslint sees the dep is intentional and the value re-renders.
  void tick

  async function copyLink() {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError('Kopyalanamadi. Manuel sec.')
    }
  }

  async function refresh() {
    if (!staffId) return
    setRefreshing(true)
    setError(null)
    try {
      const res = await fetch(`/api/staff/${staffId}/setup-token`, { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'QR yenilenemedi.')
        setRefreshing(false)
        return
      }
      const data = (await res.json()) as { setupToken: string; setupExpiresAt: string }
      onRefreshed(data)
    } catch {
      setError('Baglanti hatasi.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="staff-qr-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 px-4 pb-4 pt-16 sm:items-center sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between px-6 pt-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                  Kurulum QR
                </p>
                <h2 className="mt-1 text-base font-semibold text-gray-900">
                  {displayName ?? 'Barista'}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Bu QR&apos;i baristanin telefonuna okutun. Sifresini kendisi belirler.
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Kapat"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pb-6 pt-5">
              <div className="flex justify-center">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  {url ? (
                    <QRCodeSVG value={url} size={208} level="M" />
                  ) : (
                    <div className="flex h-52 w-52 items-center justify-center text-sm text-gray-400">
                      QR yukleniyor...
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5">
                <div className="min-w-0 flex-1 pr-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                    Kurulum baglantisi
                  </p>
                  <p className="mt-0.5 truncate font-mono text-xs text-gray-700">{url || '—'}</p>
                </div>
                <button
                  onClick={copyLink}
                  disabled={!url}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-600" />
                      Kopyalandi
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Kopyala
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className={remaining.warn ? 'text-amber-700' : 'text-gray-500'}>
                  Gecerlilik: {remaining.label}
                </span>
                <span className="text-gray-400">Tek kullanimlik</span>
              </div>

              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <p className="max-w-[60%] text-xs text-gray-400">
                  QR kaybolursa veya sifre unutulursa yeni QR uretebilirsin. Eski baglanti calismaz.
                </p>
                <button
                  onClick={refresh}
                  disabled={refreshing || !staffId}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                >
                  {refreshing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  Yenile
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

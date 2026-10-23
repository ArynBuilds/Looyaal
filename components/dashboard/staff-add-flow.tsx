'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useState } from 'react'
import { Loader2, MapPin, X } from 'lucide-react'

export interface LocationOption {
  id: string
  name: string
}

export interface CreatedStaff {
  id: string
  displayName: string
  assignedLocationId: string
  setupToken: string
  setupExpiresAt: string
}

interface StaffAddFlowProps {
  open: boolean
  locations: LocationOption[]
  onClose: () => void
  onCreated: (staff: CreatedStaff) => void
}

export function StaffAddFlow({ open, locations, onClose, onCreated }: StaffAddFlowProps) {
  const singleLocation = locations.length === 1
  // Reset internal state by remounting via `key={open ? '1' : '0'}` from the parent
  // would be one route. Simpler: derive defaults the first time the modal opens.
  const [locationId, setLocationId] = useState<string | null>(
    singleLocation ? locations[0].id : null,
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openWas, setOpenWas] = useState(open)

  if (open !== openWas) {
    setOpenWas(open)
    if (open) {
      setError(null)
      setSubmitting(false)
      setLocationId(singleLocation ? locations[0].id : null)
    }
  }

  async function submit() {
    if (!locationId) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: locationId }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'Barista olusturulamadi.')
        setSubmitting(false)
        return
      }
      const data = (await res.json()) as CreatedStaff
      onCreated(data)
    } catch {
      setError('Baglanti hatasi. Tekrar deneyin.')
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="staff-add-overlay"
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
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Yeni barista</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {singleLocation
                    ? 'Yeni baristayi olustur, ardindan kurulum QR\'ini telefonuna okut.'
                    : 'Hangi subede calisacagini sec. Ad otomatik atanir.'}
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

            {!singleLocation && (
              <div className="mt-5 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Sube</p>
                <div className="space-y-1.5">
                  {locations.map((loc) => {
                    const selected = locationId === loc.id
                    return (
                      <button
                        key={loc.id}
                        onClick={() => setLocationId(loc.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors ${
                          selected
                            ? 'border-amber-300 bg-amber-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                            selected ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          <MapPin className="h-4 w-4" />
                        </span>
                        <span
                          className={`flex-1 truncate text-sm ${
                            selected ? 'font-medium text-amber-900' : 'text-gray-900'
                          }`}
                        >
                          {loc.name}
                        </span>
                        <span
                          aria-hidden
                          className={`h-2 w-2 rounded-full transition-colors ${
                            selected ? 'bg-amber-600' : 'bg-gray-200'
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Iptal
              </button>
              <button
                onClick={submit}
                disabled={!locationId || submitting}
                className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-shadow hover:bg-amber-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Olustur ve QR goster
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

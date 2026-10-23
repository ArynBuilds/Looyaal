'use client'

import { motion } from 'motion/react'
import { Coffee, MapPin, QrCode } from 'lucide-react'

export interface StaffMember {
  id: string
  full_name: string | null
  role: string
  is_active: boolean
  assigned_locations: string[] | null
  created_at: string
}

interface StaffRowProps {
  staff: StaffMember
  locationNameById: Record<string, string>
  onToggleActive: (id: string, currentlyActive: boolean) => void
  onShowQR: (id: string) => void
  pendingToggle: boolean
}

export function StaffRow({ staff, locationNameById, onToggleActive, onShowQR, pendingToggle }: StaffRowProps) {
  const locationId = staff.assigned_locations?.[0] ?? null
  const locationName = locationId ? (locationNameById[locationId] ?? 'Konum bilinmiyor') : 'Konum atanmamis'
  const inactive = !staff.is_active

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`group flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-colors ${
        inactive ? 'border-gray-200 opacity-60' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
        <Coffee className="h-4 w-4 text-amber-600" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">
            {staff.full_name ?? 'Adsiz barista'}
          </p>
          {inactive && (
            <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
              Pasif
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-500">
          <MapPin className="h-3 w-3 flex-shrink-0" />
          <span className="truncate">{locationName}</span>
        </p>
      </div>

      <button
        onClick={() => onShowQR(staff.id)}
        className="hidden items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:flex"
        aria-label="Kurulum QR'ini goster"
      >
        <QrCode className="h-3.5 w-3.5" />
        Kurulum QR
      </button>

      <button
        onClick={() => onShowQR(staff.id)}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 sm:hidden"
        aria-label="Kurulum QR'ini goster"
      >
        <QrCode className="h-4 w-4" />
      </button>

      <button
        onClick={() => onToggleActive(staff.id, staff.is_active)}
        disabled={pendingToggle}
        aria-pressed={staff.is_active}
        aria-label={staff.is_active ? 'Pasifle' : 'Aktifle'}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          staff.is_active ? 'bg-amber-600' : 'bg-gray-300'
        }`}
      >
        <motion.span
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm"
          animate={{ left: staff.is_active ? 22 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </motion.div>
  )
}

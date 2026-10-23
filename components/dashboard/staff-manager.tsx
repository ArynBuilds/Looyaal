'use client'

import { createClient } from '@/lib/supabase/client'
import { motion } from 'motion/react'
import { Plus, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { StaffRow, type StaffMember } from './staff-row'
import { StaffAddFlow, type CreatedStaff, type LocationOption } from './staff-add-flow'
import { StaffQRModal } from './staff-qr-modal'

interface QRModalState {
  open: boolean
  staffId: string | null
  displayName: string | null
  setupToken: string | null
  setupExpiresAt: string | null
}

const initialQR: QRModalState = {
  open: false,
  staffId: null,
  displayName: null,
  setupToken: null,
  setupExpiresAt: null,
}

export function StaffManager() {
  const supabase = createClient()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [qr, setQr] = useState<QRModalState>(initialQR)
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [staffRes, locsRes] = await Promise.all([
        fetch('/api/staff').then(async (r) => (r.ok ? r.json() : [])),
        supabase.from('locations').select('id, name').eq('is_active', true).order('name'),
      ])
      if (cancelled) return
      setStaff(Array.isArray(staffRes) ? (staffRes as StaffMember[]) : [])
      setLocations((locsRes.data as LocationOption[] | null) ?? [])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  const locationNameById = useMemo(() => {
    const map: Record<string, string> = {}
    for (const loc of locations) map[loc.id] = loc.name
    return map
  }, [locations])

  async function toggleActive(id: string, currentlyActive: boolean) {
    setPendingToggleId(id)
    setError(null)
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentlyActive }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'Guncellenemedi.')
        return
      }
      setStaff((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !currentlyActive } : s)),
      )
    } catch {
      setError('Baglanti hatasi.')
    } finally {
      setPendingToggleId(null)
    }
  }

  function handleCreated(created: CreatedStaff) {
    setAddOpen(false)
    const newRow: StaffMember = {
      id: created.id,
      full_name: created.displayName,
      role: 'barista',
      is_active: true,
      assigned_locations: [created.assignedLocationId],
      created_at: new Date().toISOString(),
    }
    setStaff((prev) => [newRow, ...prev])
    setQr({
      open: true,
      staffId: created.id,
      displayName: created.displayName,
      setupToken: created.setupToken,
      setupExpiresAt: created.setupExpiresAt,
    })
  }

  async function openQR(id: string) {
    const target = staff.find((s) => s.id === id)
    if (!target) return
    setError(null)
    setQr({
      open: true,
      staffId: id,
      displayName: target.full_name,
      setupToken: null,
      setupExpiresAt: null,
    })
    try {
      const res = await fetch(`/api/staff/${id}/setup-token`, { method: 'POST' })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        setError(body.error ?? 'QR uretilemedi.')
        return
      }
      const data = (await res.json()) as { setupToken: string; setupExpiresAt: string }
      setQr((prev) =>
        prev.staffId === id
          ? { ...prev, setupToken: data.setupToken, setupExpiresAt: data.setupExpiresAt }
          : prev,
      )
    } catch {
      setError('Baglanti hatasi.')
    }
  }

  function closeQR() {
    setQr(initialQR)
  }

  function handleRefreshed(next: { setupToken: string; setupExpiresAt: string }) {
    setQr((prev) => ({ ...prev, setupToken: next.setupToken, setupExpiresAt: next.setupExpiresAt }))
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-7 w-32 animate-pulse rounded bg-gray-100" />
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      </div>
    )
  }

  const canAdd = locations.length > 0

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Baristalar</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Tek tikla olustur, QR&apos;i okuttur, baristanin telefonu hazir.
          </p>
        </div>
        <motion.button
          onClick={() => setAddOpen(true)}
          disabled={!canAdd}
          whileHover={{ scale: canAdd ? 1.02 : 1 }}
          whileTap={{ scale: canAdd ? 0.98 : 1 }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition-shadow hover:bg-amber-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Barista ekle
        </motion.button>
      </div>

      {!canAdd && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Once en az bir sube ekleyin. Ardindan barista olusturabilirsiniz.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {staff.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Henuz barista yok</p>
            <p className="mt-1 max-w-xs text-xs text-gray-500">
              &quot;Barista ekle&quot; ile baslayin. Numara otomatik atanir, sifreyi barista belirler.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {staff.map((s) => (
            <StaffRow
              key={s.id}
              staff={s}
              locationNameById={locationNameById}
              onToggleActive={toggleActive}
              onShowQR={openQR}
              pendingToggle={pendingToggleId === s.id}
            />
          ))}
        </div>
      )}

      <StaffAddFlow
        open={addOpen}
        locations={locations}
        onClose={() => setAddOpen(false)}
        onCreated={handleCreated}
      />

      <StaffQRModal
        open={qr.open}
        displayName={qr.displayName}
        setupToken={qr.setupToken}
        setupExpiresAt={qr.setupExpiresAt}
        staffId={qr.staffId}
        onClose={closeQR}
        onRefreshed={handleRefreshed}
      />
    </div>
  )
}

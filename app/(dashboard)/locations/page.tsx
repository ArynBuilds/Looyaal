'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { LocationQR } from '@/components/dashboard/location-qr'
import { AddLocationModal } from '@/components/dashboard/add-location-modal'

interface Location {
  id: string
  name: string
  address: string | null
  city: string | null
  district: string | null
  phone: string | null
  is_active: boolean
  opening_time: string
  closing_time: string
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [orgSlug, setOrgSlug] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showQR, setShowQR] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const { org: authOrg } = useAuth()

  useEffect(() => {
    loadLocations()
  }, [])

  async function loadLocations() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase
      .from('users')
      .select('org_id, organizations(slug)')
      .eq('id', user!.id)
      .single()

    if (userData?.organizations) {
      const org = userData.organizations as unknown as { slug: string }
      setOrgSlug(org.slug)
    }

    const { data } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: true })

    setLocations(data ?? [])
    setLoading(false)
  }

  function handleLocationAdded() {
    setShowAddModal(false)
    loadLocations()
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    await supabase.from('locations').update({ is_active: !currentStatus }).eq('id', id)
    loadLocations()
  }

  if (loading && locations.length === 0) {
    return <p className="text-gray-500">Yükleniyor...</p>
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Şubeler</h1>
          <p className="mt-1 text-sm text-gray-500">{locations.length} şube</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          Yeni Şube Ekle
        </button>
      </div>

      {showAddModal && (
        <AddLocationModal
          onClose={() => setShowAddModal(false)}
          onComplete={handleLocationAdded}
        />
      )}

      <div className="mt-6 space-y-3">
        {locations.map((loc) => (
          <React.Fragment key={loc.id}>
          <div
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div>
              <h3 className="font-medium text-gray-900">{loc.name}</h3>
              <p className="text-sm text-gray-500">
                {[loc.district, loc.city].filter(Boolean).join(', ') || 'Adres belirtilmemiş'}
              </p>
              <p className="text-xs text-gray-400">
                {loc.opening_time} - {loc.closing_time}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowQR(showQR === loc.id ? null : loc.id)}
                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                {showQR === loc.id ? 'QR Gizle' : 'QR Kod'}
              </button>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  loc.is_active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {loc.is_active ? 'Aktif' : 'Pasif'}
              </span>
              <button
                onClick={() => toggleActive(loc.id, loc.is_active)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {loc.is_active ? 'Devre Dışı Bırak' : 'Aktifleştir'}
              </button>
            </div>
          </div>
          {showQR === loc.id && orgSlug && (
            <div className="mt-2">
              <LocationQR orgSlug={orgSlug} locationId={loc.id} locationName={loc.name} />
            </div>
          )}
        </React.Fragment>
        ))}

        {locations.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">Henüz şube eklenmemiş.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-500"
            >
              İlk şubenizi ekleyin
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

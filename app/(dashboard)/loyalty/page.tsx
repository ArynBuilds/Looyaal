'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { BranchList } from '@/components/dashboard/branch-list'
import { AddLocationModal } from '@/components/dashboard/add-location-modal'

export default function LoyaltyPage() {
  const { org } = useAuth()
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  function handleAdded() {
    setShowAddModal(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Şubeler</h1>
          <p className="mt-1 text-sm text-gray-500">Şube performansı ve QR kodları</p>
          <p className="mt-2 text-xs text-gray-400">
            Sadakat programı: 10 damga = 1 bedava kahve (tüm şubelerde geçerli)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-amber-700"
        >
          Yeni Şube Ekle
        </button>
      </div>

      <div className="mt-6">
        <BranchList key={refreshKey} orgSlug={org.slug} onAddBranchClick={() => setShowAddModal(true)} />
      </div>

      {showAddModal && (
        <AddLocationModal
          onClose={() => setShowAddModal(false)}
          onComplete={handleAdded}
        />
      )}
    </div>
  )
}

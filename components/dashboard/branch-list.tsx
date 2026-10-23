'use client'

import { useEffect, useState } from 'react'
import { BranchRow } from './branch-row'
import { BranchQrSlideover } from './branch-qr-slideover'
import { SkeletonList } from '@/components/ui/skeleton'
import type { BranchMetricRow } from '@/lib/dashboard/branch-metrics'

interface BranchListProps {
  orgSlug: string
  onAddBranchClick: () => void
}

export function BranchList({ orgSlug, onAddBranchClick }: BranchListProps) {
  const [branches, setBranches] = useState<BranchMetricRow[] | null>(null)
  const [qrBranch, setQrBranch] = useState<BranchMetricRow | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const res = await fetch('/api/branches')
      if (!res.ok) {
        if (!cancelled) setBranches([])
        return
      }
      const json = await res.json()
      if (cancelled) return
      setBranches((json.branches as BranchMetricRow[]) ?? [])
    })()
    return () => { cancelled = true }
  }, [])

  if (branches === null) {
    return <SkeletonList rows={3} />
  }

  if (branches.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="text-sm text-gray-600">Henüz şube yok.</p>
        <button
          type="button"
          onClick={onAddBranchClick}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
        >
          İlk şubeni ekle
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <ul className="divide-y divide-gray-100">
          {branches.map((b) => (
            <li key={b.id}>
              <BranchRow branch={b} onOpenQr={(branch) => setQrBranch(branch)} />
            </li>
          ))}
        </ul>
      </div>
      <BranchQrSlideover
        open={qrBranch !== null}
        onClose={() => setQrBranch(null)}
        orgSlug={orgSlug}
        branch={qrBranch}
      />
    </>
  )
}

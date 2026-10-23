'use client'

import { useRouter } from 'next/navigation'
import { ChevronRight, QrCode } from 'lucide-react'
import type { BranchMetricRow } from '@/lib/dashboard/branch-metrics'

interface BranchRowProps {
  branch: BranchMetricRow
  onOpenQr: (b: BranchMetricRow) => void
}

function formatTry(n: number): string {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n)
}

function formatLastScan(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1) return 'şimdi'
  if (diffMin < 60) return `${diffMin} dk önce`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} sa önce`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD}g önce`
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
}

export function BranchRow({ branch, onOpenQr }: BranchRowProps) {
  const router = useRouter()
  const isNew = branch.is_active && branch.last_scan_at === null
  const isDimmed = !branch.is_active || isNew

  function goToHub() {
    router.push(`/hub?locationId=${branch.id}`)
  }

  return (
    <div
      className={`group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-gray-50 ${
        isDimmed ? 'opacity-70' : ''
      }`}
    >
      {/* Identity */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${branch.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}
            aria-label={branch.is_active ? 'Aktif' : 'Pasif'}
          />
          <h3 className="truncate text-sm font-semibold text-gray-900">{branch.name}</h3>
        </div>
        <p className="ml-4 mt-0.5 truncate text-xs text-gray-500">
          {[branch.city, branch.district].filter(Boolean).join(', ') || '—'}
        </p>
      </div>

      {/* Metrics or empty state */}
      {branch.is_active ? (
        isNew ? (
          <p className="hidden text-xs italic text-gray-400 md:block">İlk scan bekleniyor</p>
        ) : (
          <div className="hidden grid-cols-4 gap-6 text-right md:grid">
            <Metric label="Bugün" value={String(branch.todays_visits)} />
            <Metric label="Bu hafta ek gelir" value={`${formatTry(branch.weekly_incremental_revenue_try)} ₺`} />
            <Metric label="Aktif müşteri" value={String(branch.active_customers)} />
            <Metric label="Son scan" value={formatLastScan(branch.last_scan_at)} />
          </div>
        )
      ) : (
        <span className="hidden rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500 md:block">
          Pasif
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onOpenQr(branch)}
          className="rounded-md p-2 text-gray-400 hover:bg-amber-50 hover:text-amber-700"
          aria-label={`${branch.name} QR kodu`}
        >
          <QrCode size={18} />
        </button>
        <button
          type="button"
          onClick={goToHub}
          className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label={`${branch.name} verilerine git`}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold tabular-nums text-gray-900">{value}</p>
    </div>
  )
}

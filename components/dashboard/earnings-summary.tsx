'use client'

import { InlineInfoIcon } from '@/components/ui/inline-info-icon'
import type { Segment } from '@/lib/dashboard/earnings-attribution'

const PERIODS = [
  { days: 7, label: '7g' },
  { days: 30, label: '30g' },
  { days: 90, label: '90g' },
]

interface EarningsSummaryProps {
  totalTry: number
  totalVisits: number
  segments: Segment[]
  periodDays: number
  loading: boolean
  onPeriodChange: (days: number) => void
}

function formatTry(n: number): string {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(n)
}

function segmentUnit(key: Segment['key'], count: number): string {
  if (key === 'subscription') return `${formatTry(count)} abone`
  return `${formatTry(count)} ziyaret`
}

export function EarningsSummary({
  totalTry,
  totalVisits,
  segments,
  periodDays,
  loading,
  onPeriodChange,
}: EarningsSummaryProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white px-6 py-6 shadow-sm">
      {/* Header row: label + period toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h2 className="text-sm font-medium text-gray-500">Tahmini Gelir</h2>
          <InlineInfoIcon text="Tahmini hesap. Gelir, ziyaretler ve menü fiyatlarından / müşteri ortalama harcamasından hesaplanır. POS bağlandığında gerçek tutarlar gösterilir." />
        </div>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              onClick={() => onPeriodChange(p.days)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                periodDays === p.days
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Big total */}
      {loading ? (
        <div className="mt-2 h-12 w-56 animate-pulse rounded-lg bg-gray-100" />
      ) : (
        <p className="mt-1 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          {formatTry(totalTry)}
          <span className="ml-1 text-2xl font-semibold text-gray-400">₺</span>
        </p>
      )}
      <p className="mt-1.5 text-xs text-gray-500">
        Son {periodDays} günde {formatTry(totalVisits)} ziyaret
      </p>

      {/* Source breakdown columns */}
      {loading ? (
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-100 bg-gray-100 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white px-4 py-3">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              <div className="mt-2 h-5 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      ) : segments.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-gray-100 bg-gray-100 sm:grid-cols-3 lg:grid-cols-5">
          {segments.map((s) => (
            <div key={s.key} className="bg-white px-4 py-3">
              <p className="truncate text-xs text-gray-500">{s.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-gray-900">
                {formatTry(s.value_try)} <span className="text-sm font-medium text-gray-400">₺</span>
              </p>
              <p className="mt-0.5 text-[11px] text-gray-400">{segmentUnit(s.key, s.count)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-gray-200 px-4 py-6 text-center">
          <p className="text-sm text-gray-500">Bu dönemde gelir verisi yok.</p>
        </div>
      )}
    </section>
  )
}

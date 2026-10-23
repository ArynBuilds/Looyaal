'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { Clock, Heart, Cake, Sparkles, Megaphone, type LucideIcon } from 'lucide-react'
import { staggerItem } from '@/lib/animations'

export interface CampaignPerformanceItem {
  id: string
  name: string
  type: string
  status: string
  total_sent: number
  delivered: number
  converted: number
}

interface CampaignPerformanceProps {
  campaigns: CampaignPerformanceItem[]
  loading: boolean
  onShowAll?: () => void
}

const typeConfig: Record<string, { icon: LucideIcon; label: string; className: string }> = {
  dead_hour: { icon: Clock, label: 'Ölü Saat', className: 'bg-blue-50 text-blue-600' },
  reengagement: { icon: Heart, label: 'Geri Kazanım', className: 'bg-pink-50 text-pink-600' },
  birthday: { icon: Cake, label: 'Doğum Günü', className: 'bg-purple-50 text-purple-600' },
  seasonal: { icon: Sparkles, label: 'Mevsimsel', className: 'bg-emerald-50 text-emerald-600' },
  custom: { icon: Megaphone, label: 'Ozel', className: 'bg-amber-50 text-amber-600' },
}

const statusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: 'Taslak', className: 'bg-gray-100 text-gray-600' },
  active: { label: 'Aktif', className: 'bg-green-100 text-green-700' },
  completed: { label: 'Tamamlandı', className: 'bg-gray-100 text-gray-600' },
  paused: { label: 'Duraklatıldı', className: 'bg-yellow-100 text-yellow-700' },
}

export function CampaignPerformance({ campaigns, loading, onShowAll }: CampaignPerformanceProps) {
  return (
    <motion.div variants={staggerItem} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Kampanya Performansi</h3>
        <Link
          href="/campaigns/new"
          className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors"
        >
          Yeni Kampanya
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm text-gray-500">Henuz kampanya yok</p>
          <Link href="/campaigns/new" className="mt-1 inline-block text-sm font-medium text-amber-600 hover:text-amber-700">
            Ilk kampanyanizi olusturun &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => {
            const conversionRate = c.total_sent > 0 ? ((c.converted / c.total_sent) * 100).toFixed(1) : '0.0'
            const tc = typeConfig[c.type] ?? typeConfig.custom
            const Icon = tc.icon
            const status = statusLabels[c.status] ?? statusLabels.draft

            return (
              <Link
                key={c.id}
                href={`/campaigns/${c.id}`}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50"
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tc.className}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-500">
                    {c.total_sent} gönderim &middot; {c.converted} dönüşüm
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${status.className}`}>
                  {status.label}
                </span>
                <span className="shrink-0 text-sm font-semibold text-gray-900">{conversionRate}%</span>
              </Link>
            )
          })}

          {campaigns.length >= 5 && onShowAll && (
            <button
              onClick={onShowAll}
              className="block w-full pt-2 text-center text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
            >
              Tümünu Gor &rarr;
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

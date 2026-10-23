'use client'

import { motion } from 'motion/react'
import {
  QrCode,
  Monitor,
  Hand,
  Coffee,
  Clock,
  Heart,
  Cake,
  Sparkles,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { formatCurrency, formatRelativeTime } from '@/lib/format'
import { Skeleton } from '@/components/ui/skeleton'

export interface ActivityItem {
  id: string
  visited_at: string
  visit_type: string
  amount: number | null
  items: { name: string; qty: number; price: number }[] | null
  full_name: string | null
  phone: string
  campaign_id: string | null
  campaign_name: string | null
  campaign_type: string | null
}

interface ActivityFeedProps {
  items: ActivityItem[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  dateRange: string
  onDateRangeChange: (range: string) => void
}

const dateRanges = [
  { id: '1', label: '1g' },
  { id: '7', label: '7g' },
  { id: '14', label: '14g' },
  { id: '30', label: '30g' },
  { id: '90', label: '90g' },
]

const sourceConfig: Record<string, { icon: LucideIcon; label: string; bg: string; text: string }> = {
  qr_scan: { icon: QrCode, label: 'QR Tarama', bg: 'bg-amber-50', text: 'text-amber-600' },
  pos_sync: { icon: Monitor, label: 'POS', bg: 'bg-blue-50', text: 'text-blue-600' },
  manual: { icon: Hand, label: 'Manuel', bg: 'bg-gray-100', text: 'text-gray-600' },
  subscription_redeem: { icon: Coffee, label: 'Abonelik', bg: 'bg-purple-50', text: 'text-purple-600' },
}

const campaignTypeIcons: Record<string, LucideIcon> = {
  dead_hour: Clock,
  reengagement: Heart,
  birthday: Cake,
  seasonal: Sparkles,
  custom: Megaphone,
}

function SkeletonRows() {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-6 py-3">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <div className="flex-1">
            <Skeleton className="mb-1.5 h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  )
}

export function ActivityFeed({
  items,
  loading,
  hasMore,
  onLoadMore,
  dateRange,
  onDateRangeChange,
}: ActivityFeedProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900">Son Aktiviteler</h3>
        <div className="flex gap-1">
          {dateRanges.map((r) => (
            <button
              key={r.id}
              onClick={() => onDateRangeChange(r.id)}
              className={`rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${
                dateRange === r.id
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading && items.length === 0 ? (
        <SkeletonRows />
      ) : items.length === 0 ? (
        <div className="px-6 py-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            Henüz aktivite yok
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Müşteriler QR kodu taradığında burada görünecek
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="divide-y divide-gray-50"
        >
          {items.map((item) => {
            const source = sourceConfig[item.visit_type] ?? sourceConfig.qr_scan
            const SourceIcon = source.icon
            const CampaignIcon = item.campaign_type
              ? campaignTypeIcons[item.campaign_type] ?? Megaphone
              : null

            const itemNames = item.items?.map((i) => i.name).join(', ')
            const displayName = item.full_name || item.phone

            return (
              <motion.div
                key={item.id}
                variants={staggerItem}
                className="flex items-center gap-3 px-6 py-3"
              >
                {/* Source icon */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${source.bg} ${source.text}`}
                >
                  <SourceIcon className="h-4 w-4" />
                </div>

                {/* Middle: name, campaign badge, details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-medium text-gray-900">{displayName}</p>
                    {item.campaign_name && CampaignIcon && (
                      <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-pink-50 px-1.5 py-0.5 text-[10px] font-medium text-pink-600">
                        <CampaignIcon className="h-2.5 w-2.5" />
                        {item.campaign_name}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {itemNames || '+1 puan'}
                    {' \u00B7 '}
                    {source.label}
                    {item.amount != null && (
                      <>
                        {' \u00B7 '}
                        {formatCurrency(item.amount)}
                      </>
                    )}
                  </p>
                </div>

                {/* Right: relative time */}
                <span className="shrink-0 text-xs text-gray-400">
                  {formatRelativeTime(item.visited_at)}
                </span>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Load more */}
      {hasMore && items.length > 0 && (
        <div className="border-t border-gray-100 px-6 py-3 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Yükleniyor...' : 'Daha Fazla Göster'}
          </button>
        </div>
      )}
    </div>
  )
}

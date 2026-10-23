'use client'

import { motion, AnimatePresence } from 'motion/react'
import { X, Clock, Heart, Cake, Sparkles, Megaphone } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export interface CampaignFull {
  id: string
  name: string
  type: string
  status: string
  created_at: string
  total_sent: number
  delivered: number
  converted: number
}

const typeConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  dead_hour: { icon: Clock, label: 'Ölü Saat', color: 'bg-blue-50 text-blue-600' },
  reengagement: { icon: Heart, label: 'Geri Kazanım', color: 'bg-pink-50 text-pink-600' },
  birthday: { icon: Cake, label: 'Doğum Günü', color: 'bg-purple-50 text-purple-600' },
  seasonal: { icon: Sparkles, label: 'Mevsimsel', color: 'bg-emerald-50 text-emerald-600' },
  custom: { icon: Megaphone, label: 'Ozel', color: 'bg-amber-50 text-amber-600' },
}

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'Taslak', color: 'bg-gray-100 text-gray-600' },
  active: { label: 'Aktif', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Tamamlandı', color: 'bg-gray-100 text-gray-500' },
  paused: { label: 'Duraklatıldı', color: 'bg-yellow-100 text-yellow-700' },
}

interface CampaignSlideoverProps {
  isOpen: boolean
  onClose: () => void
}

export function CampaignSlideover({ isOpen, onClose }: CampaignSlideoverProps) {
  const [campaigns, setCampaigns] = useState<CampaignFull[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [sort, setSort] = useState<'conversion' | 'date'>('conversion')

  useEffect(() => {
    if (isOpen) {
      loadCampaigns()
    }
  }, [isOpen])

  async function loadCampaigns() {
    setLoading(true)
    try {
      const res = await fetch('/api/analytics/campaign-performance?limit=50')
      if (res.ok) {
        const data = await res.json()
        setCampaigns(Array.isArray(data) ? data : (data.campaigns ?? []))
      }
    } catch {}
    setLoading(false)
  }

  const filtered = campaigns.filter(c => {
    if (filter === 'active') return c.status === 'active'
    if (filter === 'completed') return c.status === 'completed'
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'conversion') {
      const rateA = a.total_sent > 0 ? a.converted / a.total_sent : 0
      const rateB = b.total_sent > 0 ? b.converted / b.total_sent : 0
      return rateB - rateA
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-white shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Tüm Kampanyalar</h2>
                <p className="text-xs text-gray-500">{campaigns.length} kampanya</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters + Sort */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-3">
              <div className="flex gap-1">
                {(['all', 'active', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      filter === f
                        ? 'bg-amber-100 text-amber-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Tamamlanan'}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(['conversion', 'date'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      sort === s
                        ? 'bg-gray-100 text-gray-700'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {s === 'conversion' ? 'Dönüşüm' : 'Tarih'}
                  </button>
                ))}
              </div>
            </div>

            {/* Campaign List */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
                  ))}
                </div>
              ) : sorted.length > 0 ? (
                <div className="space-y-2">
                  {sorted.map((c, i) => {
                    const config = typeConfig[c.type] || typeConfig.custom
                    const Icon = config.icon
                    const rate = c.total_sent > 0 ? Math.round((c.converted / c.total_sent) * 100) : 0
                    const status = statusLabels[c.status] || statusLabels.draft

                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                      >
                        <Link
                          href={`/campaigns/${c.id}`}
                          className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 hover:border-amber-200 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${config.color}`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{c.name}</p>
                              <p className="text-[11px] text-gray-400">
                                {c.total_sent} gönderim · {c.converted} dönüşüm
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${status.color}`}>
                              {status.label}
                            </span>
                            <span className="text-sm font-bold text-gray-900 w-10 text-right">{rate}%</span>
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-gray-500">
                  Kampanya bulunamadı
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Star, Gift, Coffee, Tag } from 'lucide-react'

interface RecentItem {
  type: string
  customerName: string
  usedAt: string
}

export function RecentList() {
  const [items, setItems] = useState<RecentItem[]>([])

  useEffect(() => {
    fetchRecent()
    const interval = setInterval(fetchRecent, 30000)
    return () => clearInterval(interval)
  }, [])

  function fetchRecent() {
    fetch('/api/barista/recent')
      .then(r => r.ok ? r.json() : [])
      .then(data => setItems(Array.isArray(data) ? data : []))
  }

  const typeConfig: Record<string, { icon: typeof Star; label: string; color: string }> = {
    stamp: { icon: Star, label: 'Puan', color: '#d97706' },
    reward: { icon: Gift, label: 'Odul', color: '#22c55e' },
    subscription: { icon: Coffee, label: 'Abonelik', color: '#3b82f6' },
    campaign: { icon: Tag, label: 'Kampanya', color: '#8b5cf6' },
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Az once'
    if (mins < 60) return `${mins}dk once`
    return `${Math.floor(mins / 60)}sa once`
  }

  if (items.length === 0) return null

  return (
    <div className="mt-6">
      <p className="text-xs text-white/40 font-medium mb-3">Son Islemler</p>
      <div className="space-y-2">
        {items.map((item, i) => {
          const config = typeConfig[item.type] || typeConfig.stamp
          const Icon = config.icon
          return (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${config.color}20` }}>
                <Icon className="w-4 h-4" style={{ color: config.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/80 truncate">{item.customerName}</p>
                <p className="text-xs text-white/30">{config.label}</p>
              </div>
              <span className="text-xs text-white/30">{timeAgo(item.usedAt)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

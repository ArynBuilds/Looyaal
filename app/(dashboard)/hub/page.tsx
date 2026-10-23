'use client'

import { createClient } from '@/lib/supabase/client'
import { LocationSelector } from '@/components/dashboard/location-selector'
import { TabBar } from '@/components/ui/tab-bar'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import { CampaignPerformance, type CampaignPerformanceItem } from '@/components/dashboard/campaign-performance'
import { ActivityFeed, type ActivityItem } from '@/components/dashboard/activity-feed'
import { CampaignSlideover } from '@/components/dashboard/campaign-slideover'
import { EarningsSummary } from '@/components/dashboard/earnings-summary'
import { HubCustomers } from '@/components/dashboard/hub-customers'
import type { Segment } from '@/lib/dashboard/earnings-attribution'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

const tabs = [
  { id: 'analytics', label: 'Analitik' },
  { id: 'customers', label: 'Müşteriler' },
]

interface EarningsData {
  period_days: number
  total_try: number
  total_visits: number
  segments: Segment[]
}

const ACTIVITY_PAGE_SIZE = 20

export default function HubPage() {
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') || 'analytics'
  const initialLocationId = searchParams.get('locationId')
  const [activeTab, setActiveTab] = useState(initialTab)

  function handleTabChange(tab: string) {
    setActiveTab(tab)
    const url = tab === 'analytics' ? '/hub' : `/hub?tab=${tab}`
    window.history.replaceState(null, '', url)
  }

  const [locationId, setLocationId] = useState<string | null>(initialLocationId)

  // Earnings summary state (Zone A)
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [earningsPeriod, setEarningsPeriod] = useState(30)
  const [earningsLoading, setEarningsLoading] = useState(true)

  // Analytics state
  const [dateRange, setDateRange] = useState('7')
  const [dailyData, setDailyData] = useState<{ date: string; visits: number }[]>([])
  const [hourlyData, setHourlyData] = useState<{ hour: number; visits: number }[]>([])
  const [campaignPerf, setCampaignPerf] = useState<CampaignPerformanceItem[]>([])
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [activityOffset, setActivityOffset] = useState(0)
  const [hasMoreActivity, setHasMoreActivity] = useState(true)
  const [feedDateRange, setFeedDateRange] = useState('1')
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Shared
  const [error, setError] = useState<string | null>(null)
  const [showCampaignPanel, setShowCampaignPanel] = useState(false)

  // Abort controller for cancelling stale requests
  const abortRef = useRef<AbortController | null>(null)

  const supabase = createClient()

  function sinceFromRange(range: string): string {
    const days = parseInt(range, 10) || 1
    return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  }

  // Earnings summary (Zone A): reload when locationId or period changes
  useEffect(() => {
    let cancelled = false
    setEarningsLoading(true)
    ;(async () => {
      const params = new URLSearchParams({ days: String(earningsPeriod) })
      if (locationId) params.set('locationId', locationId)
      try {
        const res = await fetch(`/api/hub-earnings?${params.toString()}`)
        if (!res.ok) return
        const json = await res.json()
        if (cancelled) return
        setEarnings(json as EarningsData)
      } catch {
        // leave previous data; loading flag clears below
      } finally {
        if (!cancelled) setEarningsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [locationId, earningsPeriod])

  // Analytics: reload when dateRange or locationId changes
  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange, locationId, activeTab])

  // Feed date range: reload activity feed independently
  useEffect(() => {
    if (activeTab === 'analytics') {
      setActivityOffset(0)
      setHasMoreActivity(true)
      loadActivityFeed(0, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feedDateRange, locationId])

  async function loadAnalytics() {
    // Abort previous request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setAnalyticsLoading(true)
    setDailyData([])
    setHourlyData([])
    setError(null)

    try {
      const days = parseInt(dateRange, 10) || 7

      // 1. Charts — always query visits directly (no cron dependency)
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
      let query = supabase
        .from('visits')
        .select('visited_at, hour_of_day')
        .gte('visited_at', since)
      if (locationId) query = query.eq('location_id', locationId)
      const { data: visits } = await query

      // Check if aborted
      if (controller.signal.aborted) return

      if (visits && visits.length > 0) {
        const dailyMap = new Map<string, number>()
        const hourlyMap = new Map<number, number>()
        for (const v of visits) {
          const day = v.visited_at.split('T')[0]
          dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1)
          const hour = v.hour_of_day ?? new Date(v.visited_at).getHours()
          hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + 1)
        }
        setDailyData(
          Array.from(dailyMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, visits: count }))
        )
        setHourlyData(
          Array.from({ length: 24 }, (_, h) => ({ hour: h, visits: hourlyMap.get(h) ?? 0 }))
        )
      }

      // 2. Campaign performance
      try {
        const params = new URLSearchParams()
        if (locationId) params.set('locationId', locationId)
        const res = await fetch(`/api/analytics/campaign-performance?${params.toString()}`, { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setCampaignPerf(Array.isArray(data) ? data : (data.campaigns ?? []))
        } else {
          setCampaignPerf([])
        }
      } catch {
        if (!controller.signal.aborted) setCampaignPerf([])
      }

      // 3. Activity feed
      if (!controller.signal.aborted) {
        setActivityOffset(0)
        setHasMoreActivity(true)
        await loadActivityFeed(0, true)
      }
    } catch {
      if (!controller.signal.aborted) setError('Veriler yüklenirken bir hata oluştu')
    }

    if (!controller.signal.aborted) setAnalyticsLoading(false)
  }

  async function loadActivityFeed(offset: number, replace: boolean) {
    try {
      const params = new URLSearchParams({
        limit: String(ACTIVITY_PAGE_SIZE),
        offset: String(offset),
        since: sinceFromRange(feedDateRange),
      })
      if (locationId) params.set('locationId', locationId)
      const res = await fetch(`/api/analytics/activity-feed?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const items: ActivityItem[] = Array.isArray(data) ? data : (data.items ?? [])
        if (replace) {
          setActivityItems(items)
        } else {
          setActivityItems((prev) => [...prev, ...items])
        }
        setHasMoreActivity(items.length >= ACTIVITY_PAGE_SIZE)
      } else {
        if (replace) setActivityItems([])
        setHasMoreActivity(false)
      }
    } catch {
      if (replace) setActivityItems([])
      setHasMoreActivity(false)
    }
  }

  const loadMoreActivity = useCallback(() => {
    const nextOffset = activityOffset + ACTIVITY_PAGE_SIZE
    setActivityOffset(nextOffset)
    loadActivityFeed(nextOffset, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityOffset, locationId, feedDateRange])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Müşteriler & Analitik
          </h1>
          <p className="mt-1 text-sm text-gray-500">Verileriniz tek bir yerde</p>
        </div>
        <LocationSelector value={locationId} onChange={setLocationId} />
      </div>

      {/* Zone A — Earnings summary */}
      <div className="mt-6">
        <EarningsSummary
          totalTry={earnings?.total_try ?? 0}
          totalVisits={earnings?.total_visits ?? 0}
          segments={earnings?.segments ?? []}
          periodDays={earningsPeriod}
          loading={earningsLoading}
          onPeriodChange={setEarningsPeriod}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6">
        <TabBar tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        {/* ============ ANALITIK TAB ============ */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* 1. Charts */}
            <AnalyticsCharts
              dailyData={dailyData}
              hourlyData={hourlyData}
              loading={analyticsLoading}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />

            {/* 2. Campaign Performance */}
            <CampaignPerformance campaigns={campaignPerf} loading={analyticsLoading} onShowAll={() => setShowCampaignPanel(true)} />

            {/* 3. Activity Feed */}
            <ActivityFeed
              items={activityItems}
              loading={analyticsLoading}
              hasMore={hasMoreActivity}
              onLoadMore={loadMoreActivity}
              dateRange={feedDateRange}
              onDateRangeChange={setFeedDateRange}
            />
          </div>
        )}

        {/* ============ MUSTERILER TAB ============ */}
        {activeTab === 'customers' && (
          <HubCustomers locationId={locationId} active={activeTab === 'customers'} />
        )}
      </div>

      {/* Campaign slide-over panel */}
      <CampaignSlideover isOpen={showCampaignPanel} onClose={() => setShowCampaignPanel(false)} />
    </div>
  )
}

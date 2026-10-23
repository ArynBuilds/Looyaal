'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'motion/react'
import { staggerItem } from '@/lib/animations'
import { SkeletonChart } from '@/components/ui/skeleton'
import { formatDateShort } from '@/lib/format'

const dateRanges = [
  { id: '1', label: '1g' },
  { id: '7', label: '7g' },
  { id: '14', label: '14g' },
  { id: '30', label: '30g' },
  { id: '90', label: '90g' },
]

interface AnalyticsChartsProps {
  dailyData: { date: string; visits: number }[]
  hourlyData: { hour: number; visits: number }[]
  loading: boolean
  dateRange: string
  onDateRangeChange: (range: string) => void
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center h-[240px] text-gray-400 text-sm">
      Hen&uuml;z veri yok
    </div>
  )
}

export function AnalyticsCharts({ dailyData, hourlyData, loading, dateRange, onDateRangeChange }: AnalyticsChartsProps) {
  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonChart />
        <SkeletonChart />
      </div>
    )
  }

  const avgHourly = hourlyData.length > 0
    ? hourlyData.reduce((sum, d) => sum + d.visits, 0) / hourlyData.length
    : 0
  const deadThreshold = avgHourly * 0.5

  const formattedDailyData = dailyData.map((d) => ({
    ...d,
    label: formatDateShort(d.date),
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Daily Visits Chart */}
      <motion.div
        variants={staggerItem}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">G&uuml;nl&uuml;k Ziyaretler</h3>
          <div className="flex gap-1">
            {dateRanges.map((r) => (
              <button
                key={r.id}
                onClick={() => onDateRangeChange(r.id)}
                className={`px-2 py-0.5 text-xs rounded-md font-medium transition-colors ${
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
        {formattedDailyData.length === 0 ? (
          <EmptyState />
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={formattedDailyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                labelStyle={{ fontWeight: 600 }}
              />
              <Bar dataKey="visits" name="Ziyaret" radius={[4, 4, 0, 0]} fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Hourly Distribution Chart */}
      <motion.div
        variants={staggerItem}
        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Saatlik Da&#287;&#305;l&#305;m</h3>
        {hourlyData.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(h: number) => `${String(h).padStart(2, '0')}:00`}
                />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }}
                  labelFormatter={(h) => `${String(h).padStart(2, '0')}:00`}
                />
                <Bar dataKey="visits" name="Ziyaret" radius={[4, 4, 0, 0]}>
                  {hourlyData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.visits < deadThreshold ? '#ef4444' : '#d97706'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-600" />
                Normal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm bg-red-500" />
                Ölü Saat (&lt;50% ort.)
              </span>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { SkeletonList } from '@/components/ui/skeleton'

interface Customer {
  id: string
  phone: string
  full_name: string | null
  total_visits: number
  last_visit_at: string | null
  rfm_segment: string | null
  loyalty_cards: { current_stamps: number }[] | null
}

const segmentColors: Record<string, string> = {
  champion: 'bg-green-100 text-green-700',
  loyal: 'bg-blue-100 text-blue-700',
  new: 'bg-purple-100 text-purple-700',
  at_risk: 'bg-orange-100 text-orange-700',
  lost: 'bg-red-100 text-red-600',
  promising: 'bg-cyan-100 text-cyan-700',
}

interface HubCustomersProps {
  locationId: string | null
  active: boolean
}

export function HubCustomers({ locationId, active }: HubCustomersProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!active) return
    let cancelled = false
    ;(async () => {
      setLoading(true)
      let query = supabase
        .from('customers')
        .select('id, phone, full_name, total_visits, last_visit_at, rfm_segment, loyalty_cards(current_stamps)')
        .order('last_visit_at', { ascending: false, nullsFirst: false })
        .limit(100)
      if (locationId) query = query.eq('primary_location_id', locationId)
      const { data } = await query
      if (cancelled) return
      setCustomers((data as unknown as Customer[]) ?? [])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [active, locationId, supabase])

  const filtered = search
    ? customers.filter(
        (c) => c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search),
      )
    : customers

  return (
    <div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="İsim veya telefon ile ara..."
        className="mb-4 w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      {loading ? (
        <SkeletonList />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {filtered.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  href={`/customers/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.full_name || c.phone}</p>
                    <p className="text-xs text-gray-500">
                      {c.phone} — {c.total_visits} ziyaret
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {c.rfm_segment && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${segmentColors[c.rfm_segment] || 'bg-gray-100'}`}>
                        {c.rfm_segment}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="px-4 py-8 text-center text-sm text-gray-500">Müşteri bulunamadı</p>
          )}
        </div>
      )}
    </div>
  )
}

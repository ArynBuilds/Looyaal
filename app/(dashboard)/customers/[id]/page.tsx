'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface CustomerDetail {
  id: string
  phone: string
  full_name: string | null
  email: string | null
  birth_date: string | null
  total_visits: number
  total_spent: number
  last_visit_at: string | null
  first_visit_at: string | null
  rfm_segment: string | null
  tags: string[]
  notes: string | null
  created_at: string
}

interface Visit {
  id: string
  visited_at: string
  visit_type: string
  stamps_earned: number
  amount: number | null
  locations: { name: string } | null
}

interface LoyaltyCard {
  current_stamps: number
  total_stamps: number
  cards_completed: number
  loyalty_programs: { stamps_required: number; name: string } | null
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [card, setCard] = useState<LoyaltyCard | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadCustomer()
  }, [id])

  async function loadCustomer() {
    const [
      { data: customerData },
      { data: visitsData },
      { data: cardData },
    ] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase
        .from('visits')
        .select('id, visited_at, visit_type, stamps_earned, amount, locations(name)')
        .eq('customer_id', id)
        .order('visited_at', { ascending: false })
        .limit(50),
      supabase
        .from('loyalty_cards')
        .select('current_stamps, total_stamps, cards_completed, loyalty_programs(stamps_required, name)')
        .eq('customer_id', id)
        .single(),
    ])

    setCustomer(customerData as CustomerDetail)
    setVisits((visitsData as unknown as Visit[]) ?? [])
    setCard(cardData as unknown as LoyaltyCard)
    setLoading(false)
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>
  if (!customer) return <p className="text-red-500">Müşteri bulunamadı.</p>

  return (
    <div>
      <Link href="/hub?tab=customers" className="text-sm text-amber-600 hover:text-amber-500">
        ← Müşteriler
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.full_name || customer.phone}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{customer.phone}</p>
        </div>
        {customer.rfm_segment && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
            {customer.rfm_segment}
          </span>
        )}
      </div>

      {/* Stats cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Toplam Ziyaret</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{customer.total_visits}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Toplam Harcama</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">₺{customer.total_spent || 0}</p>
        </div>
        {card && (
          <>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Mevcut Puan</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">
                {card.current_stamps}/{(card.loyalty_programs as { stamps_required: number })?.stamps_required ?? 10}
              </p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-xs text-gray-500">Tamamlanan Kart</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{card.cards_completed}</p>
            </div>
          </>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">İlk Ziyaret</p>
            <p className="font-medium text-gray-900">
              {customer.first_visit_at
                ? new Date(customer.first_visit_at).toLocaleDateString('tr-TR')
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Son Ziyaret</p>
            <p className="font-medium text-gray-900">
              {customer.last_visit_at
                ? new Date(customer.last_visit_at).toLocaleDateString('tr-TR')
                : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-500">E-posta</p>
            <p className="font-medium text-gray-900">{customer.email || '—'}</p>
          </div>
          <div>
            <p className="text-gray-500">Doğum Tarihi</p>
            <p className="font-medium text-gray-900">{customer.birth_date || '—'}</p>
          </div>
        </div>
      </div>

      {/* Visit history */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Ziyaret Geçmişi</h2>
        <div className="mt-3 rounded-xl border border-gray-200 bg-white shadow-sm">
          {visits.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {visits.map((v) => (
                <div key={v.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {(v.locations as { name: string })?.name || 'Bilinmeyen şube'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {v.visit_type === 'qr_scan' ? 'QR Tarama' : v.visit_type}
                      {v.stamps_earned > 0 && ` — +${v.stamps_earned} puan`}
                      {v.amount && ` — ₺${v.amount}`}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(v.visited_at).toLocaleString('tr-TR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-gray-500">Ziyaret yok</p>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  target_segment: string | null
  channel: string
  message_template: string | null
  offer_type: string | null
  offer_value: number | null
  dead_hour_start: string | null
  dead_hour_end: string | null
  ai_generated: boolean
  created_at: string
  started_at: string | null
  completed_at: string | null
}

interface SendStats {
  total: number
  sent: number
  delivered: number
  failed: number
}

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [stats, setStats] = useState<SendStats>({ total: 0, sent: 0, delivered: 0, failed: 0 })
  const [targetCount, setTargetCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadCampaign()
  }, [id])

  async function loadCampaign() {
    const { data } = await supabase.from('campaigns').select('*').eq('id', id).single()
    setCampaign(data as Campaign)

    // Get send stats
    const [
      { count: total },
      { count: sent },
      { count: delivered },
      { count: failed },
    ] = await Promise.all([
      supabase.from('campaign_sends').select('*', { count: 'exact', head: true }).eq('campaign_id', id),
      supabase.from('campaign_sends').select('*', { count: 'exact', head: true }).eq('campaign_id', id).eq('status', 'sent'),
      supabase.from('campaign_sends').select('*', { count: 'exact', head: true }).eq('campaign_id', id).eq('status', 'delivered'),
      supabase.from('campaign_sends').select('*', { count: 'exact', head: true }).eq('campaign_id', id).eq('status', 'failed'),
    ])

    setStats({ total: total ?? 0, sent: sent ?? 0, delivered: delivered ?? 0, failed: failed ?? 0 })

    // Count target customers
    if (data) {
      let query = supabase.from('customers').select('*', { count: 'exact', head: true })
      if (data.target_segment && data.target_segment !== 'all') {
        query = query.eq('rfm_segment', data.target_segment)
      }
      const { count } = await query
      setTargetCount(count ?? 0)
    }

    setLoading(false)
  }

  async function sendCampaign() {
    if (!campaign) return
    if (!confirm(`${targetCount} müşteriye bildirim gönderilecek. Devam etmek istiyor musunuz?`)) return
    setSending(true)

    try {
      const res = await fetch('/api/campaigns/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error || 'Gönderim başarısız')
      }
    } catch {
      alert('Gönderim sırasında hata oluştu')
    }

    setSending(false)
    loadCampaign()
  }

  async function updateStatus(status: string) {
    await supabase.from('campaigns').update({ status, completed_at: status === 'completed' ? new Date().toISOString() : null }).eq('id', id)
    loadCampaign()
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>
  if (!campaign) return <p className="text-red-500">Kampanya bulunamadı.</p>

  return (
    <div>
      <Link href="/campaigns" className="text-sm text-amber-600 hover:text-amber-500">
        ← Kampanyalar
      </Link>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {campaign.type === 'dead_hour' ? 'Ölü Saat' : campaign.type === 'reengagement' ? 'Geri Kazanım' : campaign.type}
            {campaign.dead_hour_start && ` — ${campaign.dead_hour_start}-${campaign.dead_hour_end}`}
          </p>
        </div>
        <div className="flex gap-2">
          {campaign.status === 'draft' && (
            <button
              onClick={sendCampaign}
              disabled={sending}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {sending ? 'Gönderiliyor...' : `Gönder (${targetCount} müşteri)`}
            </button>
          )}
          {campaign.status === 'active' && (
            <>
              <button onClick={() => updateStatus('paused')} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Duraklat
              </button>
              <button onClick={() => updateStatus('completed')} className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                Tamamla
              </button>
            </>
          )}
          {campaign.status === 'paused' && (
            <button onClick={() => updateStatus('active')} className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
              Devam Et
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats.total > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Toplam Gönderim</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Gönderildi</p>
            <p className="mt-1 text-2xl font-bold text-green-600">{stats.sent}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Teslim Edildi</p>
            <p className="mt-1 text-2xl font-bold text-blue-600">{stats.delivered}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Başarısız</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{stats.failed}</p>
          </div>
        </div>
      )}

      {/* Message preview */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500">Mesaj</h2>
        <p className="mt-2 text-gray-900">{campaign.message_template || 'Mesaj belirtilmemiş'}</p>
        {campaign.offer_type && campaign.offer_value && (
          <p className="mt-2 text-sm text-amber-600 font-medium">
            Teklif: {campaign.offer_type === 'discount_percent' ? `%${campaign.offer_value} indirim` :
                     campaign.offer_type === 'bogo' ? 'Al 1 Öde 1' :
                     `₺${campaign.offer_value} indirim`}
          </p>
        )}
      </div>

      {/* Campaign info */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-medium text-gray-500">Detaylar</h2>
        <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Hedef</p>
            <p className="font-medium text-gray-900">{campaign.target_segment || 'Tüm müşteriler'}</p>
          </div>
          <div>
            <p className="text-gray-500">Kanal</p>
            <p className="font-medium text-gray-900">{campaign.channel === 'push' ? 'Push Bildirim' : campaign.channel}</p>
          </div>
          <div>
            <p className="text-gray-500">Oluşturulma</p>
            <p className="font-medium text-gray-900">{new Date(campaign.created_at).toLocaleDateString('tr-TR')}</p>
          </div>
          <div>
            <p className="text-gray-500">AI Oluşturuldu</p>
            <p className="font-medium text-gray-900">{campaign.ai_generated ? 'Evet' : 'Hayır'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

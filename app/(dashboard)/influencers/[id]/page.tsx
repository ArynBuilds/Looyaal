'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface InfluencerDetail {
  id: string
  full_name: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  bio: string | null
  follower_count: number | null
  following_count: number | null
  avg_engagement_rate: number | null
  avg_likes: number | null
  avg_comments: number | null
  looyaal_score: number | null
  locality_score: number | null
  status: string
  contacted_at: string | null
  contact_method: string | null
  notes: string | null
  city: string | null
  district: string | null
  tags: string[]
  created_at: string
}

interface InfluencerCampaign {
  id: string
  deal_type: string
  deal_value: number | null
  deal_description: string | null
  unique_code: string | null
  status: string
  new_customers: number
  revenue_generated: number
  required_posts: number
  required_stories: number
  required_reels: number
  posts_delivered: number
  stories_delivered: number
  reels_delivered: number
  created_at: string
  locations: { name: string } | null
}

const statusFlow = ['discovered', 'contacted', 'negotiating', 'active', 'completed', 'rejected']
const statusLabels: Record<string, string> = {
  discovered: 'Keşfedildi',
  contacted: 'İletişime Geçildi',
  negotiating: 'Görüşülüyor',
  active: 'Aktif',
  completed: 'Tamamlandı',
  rejected: 'Reddedildi',
}

const outreachTemplates = [
  {
    label: 'İlk İletişim — Kahve Daveti',
    text: `Merhaba {name}! {shop_name} olarak içeriklerinizi takip ediyoruz ve çok beğeniyoruz. Sizinle bir iş birliği yapmak isteriz. Kahve ve tatlı ikramımız olarak sizi mağazamıza davet etmek isteriz. Uygun olduğunuz bir tarih için bize dönüş yapabilir misiniz?`,
  },
  {
    label: 'İş Birliği Teklifi — İçerik Karşılığı',
    text: `Merhaba {name}! {shop_name} olarak yerel influencer'larla iş birliği programımız kapsamında size bir teklif sunmak istiyoruz. 1 post + 2 story karşılığında aylık sınırsız kahve + özel indirim kodu sunuyoruz. İlgilenirseniz detayları paylaşabiliriz!`,
  },
  {
    label: 'Takip — Hatırlatma',
    text: `Merhaba {name}, geçen hafta iş birliği teklifimizle ilgili mesaj göndermiştik. Hala ilgilenip ilgilenmediğinizi merak ediyoruz. Size en uygun formatta çalışabiliriz. Bir kahve içmeye gelir misiniz?`,
  },
]

export default function InfluencerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [influencer, setInfluencer] = useState<InfluencerDetail | null>(null)
  const [campaigns, setCampaigns] = useState<InfluencerCampaign[]>([])
  const [showOutreach, setShowOutreach] = useState(false)
  const [showDealForm, setShowDealForm] = useState(false)
  const [outreachText, setOutreachText] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [dealForm, setDealForm] = useState({
    deal_type: 'free_product',
    deal_value: '',
    deal_description: '',
    required_posts: '1',
    required_stories: '2',
    required_reels: '0',
  })
  const supabase = createClient()

  useEffect(() => {
    loadInfluencer()
  }, [id])

  async function loadInfluencer() {
    const [{ data: inf }, { data: camps }] = await Promise.all([
      supabase.from('influencers').select('*').eq('id', id).single(),
      supabase.from('influencer_campaigns')
        .select('*, locations(name)')
        .eq('influencer_id', id)
        .order('created_at', { ascending: false }),
    ])

    setInfluencer(inf as InfluencerDetail)
    setCampaigns((camps as unknown as InfluencerCampaign[]) ?? [])
    setNotes(inf?.notes || '')
    setLoading(false)
  }

  async function updateStatus(newStatus: string) {
    await supabase.from('influencers').update({
      status: newStatus,
      contacted_at: newStatus === 'contacted' ? new Date().toISOString() : undefined,
    }).eq('id', id)
    loadInfluencer()
  }

  async function saveNotes() {
    await supabase.from('influencers').update({ notes }).eq('id', id)
  }

  async function createDeal(e: React.FormEvent) {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('org_id').eq('id', user!.id).single()

    // Generate unique tracking code
    const uniqueCode = `INF-${influencer!.instagram_handle?.replace('@', '').toUpperCase().slice(0, 6) || 'CODE'}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

    const { error } = await supabase.from('influencer_campaigns').insert({
      org_id: userData!.org_id,
      influencer_id: id,
      deal_type: dealForm.deal_type,
      deal_value: dealForm.deal_value ? parseFloat(dealForm.deal_value) : null,
      deal_description: dealForm.deal_description || null,
      required_posts: parseInt(dealForm.required_posts),
      required_stories: parseInt(dealForm.required_stories),
      required_reels: parseInt(dealForm.required_reels),
      unique_code: uniqueCode,
      status: 'proposed',
    })

    if (error) {
      alert(error.message)
      return
    }

    setShowDealForm(false)
    setDealForm({ deal_type: 'free_product', deal_value: '', deal_description: '', required_posts: '1', required_stories: '2', required_reels: '0' })
    loadInfluencer()
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>
  if (!influencer) return <p className="text-red-500">Influencer bulunamadı.</p>

  const totalRevenue = campaigns.reduce((sum, c) => sum + (c.revenue_generated || 0), 0)
  const totalCustomers = campaigns.reduce((sum, c) => sum + (c.new_customers || 0), 0)

  return (
    <div>
      <Link href="/influencers" className="text-sm text-amber-600 hover:text-amber-500">← Influencer&apos;lar</Link>

      {/* Header */}
      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{influencer.full_name}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
            {influencer.instagram_handle && <span>IG: {influencer.instagram_handle}</span>}
            {influencer.tiktok_handle && <span>TT: {influencer.tiktok_handle}</span>}
            {influencer.city && <span>{influencer.district ? `${influencer.district}, ` : ''}{influencer.city}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {influencer.looyaal_score !== null && (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-center">
              <p className="text-2xl font-bold text-amber-600">{influencer.looyaal_score}</p>
              <p className="text-xs text-amber-500">Skor</p>
            </div>
          )}
        </div>
      </div>

      {/* Status pipeline */}
      <div className="mt-6 flex items-center gap-1">
        {statusFlow.filter(s => s !== 'rejected').map((stage, i) => (
          <button
            key={stage}
            onClick={() => updateStatus(stage)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
              influencer.status === stage
                ? 'bg-amber-600 text-white'
                : statusFlow.indexOf(influencer.status) > i
                ? 'bg-amber-100 text-amber-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {statusLabels[stage]}
          </button>
        ))}
        <button
          onClick={() => updateStatus('rejected')}
          className={`rounded-md px-2 py-1.5 text-xs font-medium ${influencer.status === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-600'}`}
        >
          Reddet
        </button>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Takipçi</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{influencer.follower_count ? `${(influencer.follower_count / 1000).toFixed(1)}K` : '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Etkileşim</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{influencer.avg_engagement_rate ? `%${influencer.avg_engagement_rate}` : '—'}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Getirilen Müşteri</p>
          <p className="mt-1 text-xl font-bold text-green-600">{totalCustomers}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Oluşturulan Gelir</p>
          <p className="mt-1 text-xl font-bold text-green-600">₺{totalRevenue}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button onClick={() => setShowOutreach(!showOutreach)} className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
          {showOutreach ? 'Kapat' : 'Mesaj Gönder'}
        </button>
        <button onClick={() => setShowDealForm(!showDealForm)} className="rounded-md border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50">
          {showDealForm ? 'Kapat' : 'İş Birliği Oluştur'}
        </button>
      </div>

      {/* Outreach templates */}
      {showOutreach && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">Mesaj Şablonları</h3>
          <div className="mt-3 space-y-2">
            {outreachTemplates.map((t, i) => (
              <button
                key={i}
                onClick={() => setOutreachText(t.text.replace('{name}', influencer.full_name || '').replace(/{shop_name}/g, 'Mağazanız'))}
                className={`block w-full rounded-lg border p-3 text-left text-sm ${outreachText === t.text ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <p className="font-medium text-gray-900">{t.label}</p>
                <p className="mt-1 text-xs text-gray-500">{t.text.slice(0, 80)}...</p>
              </button>
            ))}
          </div>
          <textarea
            value={outreachText}
            onChange={(e) => setOutreachText(e.target.value)}
            rows={4}
            className="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none"
            placeholder="Mesaj metni..."
          />
          <p className="mt-2 text-xs text-gray-400">Bu mesajı kopyalayıp Instagram DM veya WhatsApp&apos;tan gönderebilirsiniz.</p>
          <button
            onClick={() => { navigator.clipboard.writeText(outreachText); alert('Mesaj kopyalandı!') }}
            disabled={!outreachText}
            className="mt-2 rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
          >
            Kopyala
          </button>
        </div>
      )}

      {/* Deal creation form */}
      {showDealForm && (
        <form onSubmit={createDeal} className="mt-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">Yeni İş Birliği</h3>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Anlaşma Türü</label>
              <select value={dealForm.deal_type} onChange={(e) => setDealForm({ ...dealForm, deal_type: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none">
                <option value="free_product">Bedava Ürün</option>
                <option value="paid">Ücretli</option>
                <option value="commission">Komisyon</option>
                <option value="barter">Takas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Değer (₺ veya %)</label>
              <input type="number" value={dealForm.deal_value} onChange={(e) => setDealForm({ ...dealForm, deal_value: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none" placeholder="500" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Açıklama</label>
              <input type="text" value={dealForm.deal_description} onChange={(e) => setDealForm({ ...dealForm, deal_description: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none" placeholder="Aylık sınırsız kahve + 1 post 2 story" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Post Sayısı</label>
              <input type="number" min="0" value={dealForm.required_posts} onChange={(e) => setDealForm({ ...dealForm, required_posts: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Story Sayısı</label>
              <input type="number" min="0" value={dealForm.required_stories} onChange={(e) => setDealForm({ ...dealForm, required_stories: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
              İş Birliği Oluştur
            </button>
          </div>
        </form>
      )}

      {/* Campaigns */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">İş Birlikleri</h2>
        {campaigns.length > 0 ? (
          <div className="mt-3 space-y-3">
            {campaigns.map((c) => (
              <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.deal_description || c.deal_type}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      {c.unique_code && <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono">{c.unique_code}</span>}
                      {c.deal_value && <span>₺{c.deal_value}</span>}
                      <span>{c.posts_delivered}/{c.required_posts ?? 0} post, {c.stories_delivered}/{c.required_stories ?? 0} story</span>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                {(c.new_customers > 0 || c.revenue_generated > 0) && (
                  <div className="mt-2 flex gap-4 text-xs">
                    <span className="text-green-600">{c.new_customers} yeni müşteri</span>
                    <span className="text-green-600">₺{c.revenue_generated} gelir</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-500">Henüz iş birliği yok.</p>
        )}
      </div>

      {/* Notes */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900">Notlar</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={saveNotes}
          rows={3}
          className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none"
          placeholder="İletişim notları, tercihler..."
        />
      </div>

      {/* Tags */}
      {influencer.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {influencer.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">{tag}</span>
          ))}
        </div>
      )}
    </div>
  )
}

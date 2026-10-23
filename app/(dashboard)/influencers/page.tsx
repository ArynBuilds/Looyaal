'use client'

import { createClient } from '@/lib/supabase/client'
import { LocationSelector } from '@/components/dashboard/location-selector'
import { TabBar } from '@/components/ui/tab-bar'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Influencer {
  id: string
  full_name: string | null
  instagram_handle: string | null
  tiktok_handle: string | null
  follower_count: number | null
  avg_engagement_rate: number | null
  looyaal_score: number | null
  locality_score: number | null
  accessibility_score: number | null
  impact_score: number | null
  free_coffee_score: number | null
  status: string
  city: string | null
  district: string | null
  tags: string[]
  created_at: string
}

const statusLabels: Record<string, { label: string; color: string }> = {
  discovered: { label: 'Keşfedildi', color: 'bg-gray-100 text-gray-600' },
  contacted: { label: 'İletişime Geçildi', color: 'bg-blue-100 text-blue-700' },
  negotiating: { label: 'Görüşülüyor', color: 'bg-yellow-100 text-yellow-700' },
  active: { label: 'Aktif', color: 'bg-green-100 text-green-700' },
  completed: { label: 'Tamamlandı', color: 'bg-purple-100 text-purple-700' },
  rejected: { label: 'Reddedildi', color: 'bg-red-100 text-red-600' },
}

const pipelineStages = ['discovered', 'contacted', 'negotiating', 'active', 'completed']

export default function InfluencersPage() {
  const [influencers, setInfluencers] = useState<Influencer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'pipeline' | 'list'>('pipeline')
  const [loading, setLoading] = useState(true)
  const [instagramConnected, setInstagramConnected] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    instagram_handle: '',
    tiktok_handle: '',
    city: '',
    district: '',
    follower_count: '',
    avg_engagement_rate: '',
    tags: '',
  })
  const supabase = createClient()

  useEffect(() => {
    loadInfluencers()
    // Check Instagram connection
    supabase.from('organizations').select('instagram_connected_at').single().then(({ data }) => {
      setInstagramConnected(!!data?.instagram_connected_at)
    })
  }, [])

  async function loadInfluencers() {
    const { data } = await supabase
      .from('influencers')
      .select('*')
      .order('looyaal_score', { ascending: false, nullsFirst: false })

    setInfluencers(data ?? [])
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('org_id').eq('id', user!.id).single()

    // Compute Looyaal score
    const followers = parseInt(formData.follower_count) || 0
    const engagement = parseFloat(formData.avg_engagement_rate) || 0
    const score = computeScore(followers, engagement, formData.city)

    const { error } = await supabase.from('influencers').insert({
      org_id: userData!.org_id,
      full_name: formData.full_name,
      instagram_handle: formData.instagram_handle || null,
      tiktok_handle: formData.tiktok_handle || null,
      city: formData.city || null,
      district: formData.district || null,
      follower_count: followers || null,
      avg_engagement_rate: engagement || null,
      looyaal_score: score,
      tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()) : [],
      status: 'discovered',
    })

    if (error) {
      alert(error.message)
      return
    }

    setFormData({ full_name: '', instagram_handle: '', tiktok_handle: '', city: '', district: '', follower_count: '', avg_engagement_rate: '', tags: '' })
    setShowForm(false)
    loadInfluencers()
  }

  function computeScore(followers: number, engagementRate: number, city: string): number {
    // Section 8.4: Looyaal Score (0-100)
    // Engagement Rate Score (40%)
    const erScore = Math.min((engagementRate / 5.0) * 100, 100)

    // Follower Count Score (20%)
    let fcScore = 20
    if (followers >= 1000 && followers < 5000) fcScore = 60
    else if (followers >= 5000 && followers < 10000) fcScore = 80
    else if (followers >= 10000 && followers < 50000) fcScore = 100
    else if (followers >= 50000 && followers < 100000) fcScore = 70
    else if (followers >= 100000) fcScore = 50

    // Locality Score (30%) — simplified without Instagram API
    let locScore = 0
    if (city) locScore = 40 // Has city = some locality

    // Content Relevance (10%) — simplified
    const crScore = 50 // Default lifestyle until we can check content

    return Math.round(erScore * 0.4 + fcScore * 0.2 + locScore * 0.3 + crScore * 0.1)
  }

  async function updateStatus(id: string, newStatus: string) {
    await supabase.from('influencers').update({
      status: newStatus,
      contacted_at: newStatus === 'contacted' ? new Date().toISOString() : undefined,
    }).eq('id', id)
    loadInfluencers()
  }

  const [discovering, setDiscovering] = useState(false)
  const [discoverResult, setDiscoverResult] = useState<string | null>(null)

  async function handleDiscover() {
    setDiscovering(true)
    setDiscoverResult(null)
    const res = await fetch('/api/influencers/discover', { method: 'POST' })
    if (res.ok) {
      const data = await res.json()
      setDiscoverResult(`${data.discovered} yeni influencer keşfedildi! (searched: ${data.searched}, hashtags: ${data.hashtags?.join(', ') || 'none'}, city: ${data.debug?.city || 'empty'}, district: ${data.debug?.district || 'empty'})`)
      loadInfluencers()
    } else {
      const err = await res.json().catch(() => ({ error: 'Keşif başarısız' }))
      setDiscoverResult(err.error || 'Keşif başarısız')
    }
    setDiscovering(false)
  }

  if (loading) return <p className="text-gray-500">Yükleniyor...</p>

  const discoveredCount = influencers.filter(i => i.status === 'discovered').length

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Influencer</h1>
          <p className="mt-1 text-sm text-gray-500">
            {influencers.length} influencer
            {discoveredCount > 0 && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{discoveredCount} yeni keşif</span>}
          </p>
        </div>
        <div className="flex gap-2">
          {!instagramConnected ? (
            // eslint-disable-next-line @next/next/no-html-link-for-pages -- OAuth redirect route, needs a full navigation
            <a href="/api/instagram/connect" className="rounded-md border border-pink-500 px-4 py-2 text-sm font-medium text-pink-600 hover:bg-pink-50">
              Instagram&apos;a Bağla
            </a>
          ) : (
            <>
              <span className="flex items-center gap-1.5 rounded-md bg-pink-50 px-3 py-2 text-xs font-medium text-pink-700">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2z"/></svg>
                Bağlı
              </span>
              <button
                onClick={handleDiscover}
                disabled={discovering}
                className="rounded-md border border-amber-500 px-4 py-2 text-sm font-medium text-amber-600 hover:bg-amber-50 disabled:opacity-50"
              >
                {discovering ? 'Keşfediliyor...' : 'Keşfet'}
              </button>
            </>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            {showForm ? 'İptal' : 'Influencer Ekle'}
          </button>
        </div>
      </div>

      {discoverResult && (
        <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
          {discoverResult}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">İsim *</label>
              <input type="text" value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instagram</label>
              <input type="text" value={formData.instagram_handle} onChange={(e) => setFormData({ ...formData, instagram_handle: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="@handle" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">TikTok</label>
              <input type="text" value={formData.tiktok_handle} onChange={(e) => setFormData({ ...formData, tiktok_handle: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="@handle" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Takipçi Sayısı</label>
              <input type="number" value={formData.follower_count} onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="15000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Etkileşim Oranı (%)</label>
              <input type="number" step="0.1" value={formData.avg_engagement_rate} onChange={(e) => setFormData({ ...formData, avg_engagement_rate: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="4.5" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Şehir</label>
              <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="İstanbul" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">İlçe</label>
              <input type="text" value={formData.district} onChange={(e) => setFormData({ ...formData, district: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="Kadıköy" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Etiketler (virgülle ayırın)</label>
              <input type="text" value={formData.tags} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" placeholder="kahve, yemek, lifestyle" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
              Ekle
            </button>
          </div>
        </form>
      )}

      {/* Tabs */}
      <div className="mt-6">
        <TabBar
          tabs={[{ id: 'pipeline', label: 'Pipeline' }, { id: 'list', label: 'Liste' }]}
          activeTab={activeTab}
          onChange={(t) => setActiveTab(t as 'pipeline' | 'list')}
        />
      </div>

      {/* Pipeline View */}
      {activeTab === 'pipeline' && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {pipelineStages.map((stage) => {
            const stageInfluencers = influencers.filter((i) => i.status === stage)
            const stageInfo = statusLabels[stage]
            return (
              <div key={stage} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stageInfo?.color}`}>
                    {stageInfo?.label}
                  </span>
                  <span className="text-xs text-gray-400">{stageInfluencers.length}</span>
                </div>
                <div className="space-y-2">
                  {stageInfluencers.map((inf) => (
                    <Link
                      key={inf.id}
                      href={`/influencers/${inf.id}`}
                      className="block rounded-lg bg-white p-3 shadow-sm hover:shadow-md"
                    >
                      <p className="text-sm font-medium text-gray-900">{inf.full_name}</p>
                      <p className="text-xs text-gray-500">{inf.instagram_handle || inf.tiktok_handle}</p>
                      {(inf.free_coffee_score ?? inf.looyaal_score) !== null && (
                        <div className="mt-1">
                          <div className="flex items-center gap-1">
                            <div className="h-1.5 flex-1 rounded-full bg-gray-200">
                              <div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${inf.free_coffee_score ?? inf.looyaal_score}%` }} />
                            </div>
                            <span className="text-xs font-bold text-amber-600">{inf.free_coffee_score ?? inf.looyaal_score}</span>
                          </div>
                          {inf.accessibility_score != null && inf.impact_score != null && (
                            <div className="flex gap-1 mt-0.5">
                              <span className={`text-[9px] px-1 rounded ${inf.accessibility_score >= 60 ? 'bg-green-100 text-green-700' : inf.accessibility_score >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                {inf.accessibility_score >= 60 ? 'Kolay' : inf.accessibility_score >= 30 ? 'Orta' : 'Zor'}
                              </span>
                              <span className={`text-[9px] px-1 rounded ${inf.impact_score >= 60 ? 'bg-green-100 text-green-700' : inf.impact_score >= 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'}`}>
                                {inf.impact_score >= 60 ? 'Yüksek etki' : inf.impact_score >= 30 ? 'Orta etki' : 'Düşük etki'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                  {stageInfluencers.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">Boş</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
          {influencers.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {influencers.map((inf) => {
                const st = statusLabels[inf.status]
                return (
                  <Link key={inf.id} href={`/influencers/${inf.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">{inf.full_name}</p>
                      <p className="text-xs text-gray-500">
                        {inf.instagram_handle && `IG: ${inf.instagram_handle}`}
                        {inf.tiktok_handle && ` TT: ${inf.tiktok_handle}`}
                        {inf.follower_count && ` — ${(inf.follower_count / 1000).toFixed(1)}K takipçi`}
                        {inf.avg_engagement_rate && ` — %${inf.avg_engagement_rate} ER`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {(inf.free_coffee_score ?? inf.looyaal_score) !== null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold text-amber-600">{inf.free_coffee_score ?? inf.looyaal_score}</span>
                          {inf.accessibility_score != null && (
                            <span className={`text-[9px] px-1 rounded ${inf.accessibility_score >= 60 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {inf.accessibility_score >= 60 ? 'Kolay' : 'Orta'}
                            </span>
                          )}
                        </div>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st?.color}`}>
                        {st?.label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">Henüz influencer eklenmemiş.</p>
              <button onClick={() => setShowForm(true)} className="mt-2 text-sm font-medium text-amber-600 hover:text-amber-500">
                İlk influencer&apos;ınızı ekleyin
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

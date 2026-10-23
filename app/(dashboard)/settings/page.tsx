'use client'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth-context'
import { TabBar } from '@/components/ui/tab-bar'
import { motion } from 'motion/react'
import { Clock, Search, MessageSquare, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MenuItemsEditor } from '@/components/dashboard/menu-items-editor'
import { StaffManager } from '@/components/dashboard/staff-manager'

const tabs = [
  { id: 'org', label: 'İşletme' },
  { id: 'menu', label: 'Menü' },
  { id: 'staff', label: 'Personel' },
  { id: 'automation', label: 'Kampanya Otomasyonu' },
]

export default function SettingsPage() {
  const { org: authOrg } = useAuth()
  const searchParams = useSearchParams()
  // Honor ?tab=<id> so deep links from other pages land on the right tab.
  const initialTab = (() => {
    const t = searchParams.get('tab')
    return t && tabs.some(x => x.id === t) ? t : 'org'
  })()
  const [activeTab, setActiveTab] = useState(initialTab)
  const [org, setOrg] = useState({
    name: authOrg.name, slug: authOrg.slug, phone: '', email: '',
    city: '', address: '',
    min_discount: 5,
    max_discount: 30,
  })
  const [autoSettings, setAutoSettings] = useState({ master: false, influencer_discovery: false, review_reply: false, review_nudge: false })
  const [surprisePool, setSurprisePool] = useState<string[]>([])
  const [menuItemsList, setMenuItemsList] = useState<{ id: string; name: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('organizations').select('phone, email, city, address, min_discount, max_discount').eq('id', authOrg.id).single().then(({ data }) => {
      if (data) setOrg(prev => ({ ...prev, phone: data.phone || '', email: data.email || '', city: data.city || '', address: data.address || '', min_discount: data.min_discount ?? 5, max_discount: data.max_discount ?? 30 }))
    })
    supabase.from('auto_campaign_settings').select('type, is_enabled').eq('org_id', authOrg.id).then(({ data }) => {
      if (data) {
        const map: Record<string, boolean> = {}
        for (const s of data) map[s.type] = s.is_enabled
        setAutoSettings({
          master: map.master || false,
          influencer_discovery: map.influencer_discovery || false,
          review_reply: map.review_reply || false,
          review_nudge: map.review_nudge || false,
        })
      }
    })
    supabase.from('organizations').select('surprise_pool').eq('id', authOrg.id).single().then(({ data }) => {
      if (data?.surprise_pool) setSurprisePool(data.surprise_pool)
    })
    supabase.from('menu_items').select('id, name').eq('org_id', authOrg.id).order('name').then(({ data }) => {
      if (data) setMenuItemsList(data)
    })
  }, [])

  async function saveOrg(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setMessage(null)
    const { error } = await supabase.from('organizations').update({ name: org.name, phone: org.phone, email: org.email, city: org.city, address: org.address }).eq('id', authOrg.id)
    setMessage(error ? error.message : 'Kaydedildi.'); setSaving(false)
  }

  async function toggleAutoCampaign(type: string, enabled: boolean) {
    await supabase.from('auto_campaign_settings').upsert({ org_id: authOrg.id, type, is_enabled: enabled }, { onConflict: 'org_id,type' })
    setAutoSettings({ ...autoSettings, [type]: enabled })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ayarlar</h1>
      <p className="mt-1 text-sm text-gray-500">İşletme ve otomasyon ayarları</p>
      <div className="mt-4"><TabBar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} /></div>
      <div className="mt-6 max-w-2xl">
        {message && <div className={`mb-4 rounded-lg p-3 text-sm ${message === 'Kaydedildi.' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{message}</div>}

        {activeTab === 'org' && (
          <motion.form onSubmit={saveOrg} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div><label className="block text-sm font-medium text-gray-700">İşletme Adı</label><input type="text" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">E-posta</label><input type="email" value={org.email} onChange={(e) => setOrg({ ...org, email: e.target.value })} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Telefon</label><input type="text" value={org.phone} onChange={(e) => setOrg({ ...org, phone: e.target.value })} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700">Şehir</label><input type="text" value={org.city} onChange={(e) => setOrg({ ...org, city: e.target.value })} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Adres</label><input type="text" value={org.address} onChange={(e) => setOrg({ ...org, address: e.target.value })} className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500" /></div>
            </div>
            <p className="text-xs text-gray-400">Marka rengi ve PWA tasarimi icin PWA Tasarim sekmesini kullanin.</p>
            <div className="flex justify-end"><motion.button type="submit" disabled={saving} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-shadow hover:shadow-md">{saving ? 'Kaydediliyor...' : 'Kaydet'}</motion.button></div>
          </motion.form>
        )}




        {activeTab === 'menu' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <MenuItemsEditor />
          </motion.div>
        )}

        {activeTab === 'staff' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <StaffManager />
          </motion.div>
        )}

        {activeTab === 'automation' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Kampanya Otomasyonu</p>
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-amber-600" /><div><p className="text-sm font-medium text-gray-900">Otomatik Kampanyalar</p><p className="text-xs text-gray-500">Ölü saat, geri kazanım ve doğum günü kampanyalarını AI otomatik yönetir</p></div></div>
              <button onClick={() => toggleAutoCampaign('master', !autoSettings.master)} className={`relative h-6 w-11 rounded-full transition-colors ${autoSettings.master ? 'bg-amber-600' : 'bg-gray-300'}`}>
                <motion.div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" animate={{ left: autoSettings.master ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
              </button>
            </div>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-6 mb-2">Influencer</p>
            {[
              { type: 'influencer_discovery', label: 'Otomatik Keşif', desc: 'Bölgenizdeki influencer\'ları günlük otomatik keşfeder', Icon: Search },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3"><item.Icon className="w-5 h-5 text-amber-600" /><div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div></div>
                <button onClick={() => toggleAutoCampaign(item.type, !autoSettings[item.type as keyof typeof autoSettings])} className={`relative h-6 w-11 rounded-full transition-colors ${autoSettings[item.type as keyof typeof autoSettings] ? 'bg-amber-600' : 'bg-gray-300'}`}>
                  <motion.div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" animate={{ left: autoSettings[item.type as keyof typeof autoSettings] ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                </button>
              </div>
            ))}

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-6 mb-2">Google Yorumlar</p>
            {[
              { type: 'review_reply', label: 'Otomatik Yanıt', desc: 'Yeni yorumlara yapay zeka ile otomatik yanıt oluşturur', Icon: MessageSquare },
              { type: 'review_nudge', label: 'Yorum İste', desc: 'Müşterilerden Google yorumu ister (3+ ziyaret sonrası)', Icon: Star },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3"><item.Icon className="w-5 h-5 text-amber-600" /><div><p className="text-sm font-medium text-gray-900">{item.label}</p><p className="text-xs text-gray-500">{item.desc}</p></div></div>
                <button onClick={() => toggleAutoCampaign(item.type, !autoSettings[item.type as keyof typeof autoSettings])} className={`relative h-6 w-11 rounded-full transition-colors ${autoSettings[item.type as keyof typeof autoSettings] ? 'bg-amber-600' : 'bg-gray-300'}`}>
                  <motion.div className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm" animate={{ left: autoSettings[item.type as keyof typeof autoSettings] ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} />
                </button>
              </div>
            ))}

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-6 mb-2">Indirim Sinirlari</p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Indirim (%)</label>
                <input type="range" min={0} max={30} step={1} value={org.min_discount || 5}
                  onChange={(e) => setOrg({ ...org, min_discount: parseInt(e.target.value) })}
                  className="mt-2 w-full accent-amber-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>%0</span>
                  <span className="text-amber-600 font-medium">%{org.min_discount || 5}</span>
                  <span>%30</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Otomatik kampanyalarda kullanilacak en dusuk indirim orani</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Maksimum Indirim (%)</label>
                <input type="range" min={5} max={50} step={1} value={org.max_discount || 30}
                  onChange={(e) => setOrg({ ...org, max_discount: parseInt(e.target.value) })}
                  className="mt-2 w-full accent-amber-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>%5</span>
                  <span className="text-amber-600 font-medium">%{org.max_discount || 30}</span>
                  <span>%50</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Otomatik kampanyalarda kullanilacak en yuksek indirim orani</p>
              </div>
              <div className="flex justify-end">
                <button onClick={async () => {
                  setSaving(true)
                  await fetch('/api/org', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ min_discount: org.min_discount || 5, max_discount: org.max_discount || 30 }) })
                  setSaving(false)
                }} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 transition-shadow hover:shadow-md">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-6 mb-2">Surpriz Oduller</p>
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
              <p className="text-sm text-gray-600">Musterilere surpriz olarak verilecek urunleri secin. Secim yapilmazsa bonus puan verilir.</p>
              {menuItemsList.length === 0 ? (
                <p className="text-xs text-gray-400">Henuz menu ogesi eklenmemis. Once Menu sekmesinden urunlerinizi ekleyin.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {menuItemsList.map(item => {
                    const selected = surprisePool.includes(item.name)
                    return (
                      <button key={item.id} type="button" onClick={() => {
                        setSurprisePool(prev => selected ? prev.filter(n => n !== item.name) : [...prev, item.name])
                      }}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium border transition-colors ${selected ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        {selected && <span className="mr-1">✓</span>}{item.name}
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="flex justify-end">
                <button onClick={async () => {
                  setSaving(true)
                  await fetch('/api/org', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ surprise_pool: surprisePool }) })
                  setSaving(false)
                  setMessage('Surpriz havuzu kaydedildi')
                  setTimeout(() => setMessage(null), 2000)
                }} className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}

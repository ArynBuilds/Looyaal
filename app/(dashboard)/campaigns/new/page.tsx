'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const campaignTypes = [
  { value: 'custom', label: 'Özel Kampanya', desc: 'Kendi kampanyanızı oluşturun' },
]

const offerTypes = [
  { value: 'discount_percent', label: 'Yüzde İndirim (%)' },
  { value: 'discount_fixed', label: 'Sabit İndirim (₺)' },
  { value: 'bogo', label: 'Al 1 Öde 1' },
  { value: 'free_item', label: 'Bedava Ürün' },
]

const segments = [
  { value: 'all', label: 'Tüm Müşteriler' },
  { value: 'champion', label: 'Şampiyonlar (En sadık)' },
  { value: 'loyal', label: 'Sadık Müşteriler' },
  { value: 'new', label: 'Yeni Müşteriler' },
  { value: 'at_risk', label: 'Risk Altında' },
  { value: 'lost', label: 'Kayıp Müşteriler' },
  { value: 'promising', label: 'Umut Veren' },
]

export default function NewCampaignPage() {
  const router = useRouter()

  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'custom',
    target_segment: 'all',
    channel: 'push',
    message_template: '',
    offer_type: 'discount_percent',
    offer_value: '',
    scheduleMode: 'now' as 'now' | 'later',
    scheduled_date: '',
    scheduled_time: '',
  })
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Validate: if Planla mode selected, date is required and must be in future
    if (form.scheduleMode === 'later') {
      if (!form.scheduled_date) {
        alert('Planla modunu seçtiniz. Lütfen gönderim tarihi girin.')
        return
      }
      const scheduledAt = new Date(`${form.scheduled_date}T${form.scheduled_time || '09:00'}`)
      if (scheduledAt.getTime() <= Date.now()) {
        alert('Gönderim zamanı geçmişte olamaz. Lütfen ileri bir tarih/saat seçin.')
        return
      }
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('users').select('org_id').eq('id', user!.id).single()

    const { error } = await supabase.from('campaigns').insert({
      org_id: userData!.org_id,
      name: form.name,
      type: form.type,
      target_segment: form.target_segment,
      channel: form.channel,
      message_template: form.message_template,
      offer_type: form.offer_type,
      offer_value: form.offer_value ? parseFloat(form.offer_value) : null,
      status: form.scheduleMode === 'later' && form.scheduled_date ? 'scheduled' : 'draft',
      scheduled_at: form.scheduleMode === 'later' && form.scheduled_date
        ? new Date(`${form.scheduled_date}T${form.scheduled_time || '09:00'}`).toISOString()
        : null,
      ai_generated: false,
    })

    if (error) {
      alert(error.message)
      setSaving(false)
      return
    }

    router.push('/campaigns')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Yeni Kampanya</h1>
      <p className="mt-1 text-sm text-gray-500">Kampanya oluşturun ve müşterilerinize ulaşın</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        {/* Campaign type */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700">Kampanya Türü</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {campaignTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value })}
                className={`rounded-lg border p-3 text-left text-sm ${
                  form.type === t.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-medium text-gray-900">{t.label}</p>
                <p className="text-xs text-gray-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Target & Offer */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hedef Segment</label>
              <select
                value={form.target_segment}
                onChange={(e) => setForm({ ...form, target_segment: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none"
              >
                {segments.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teklif Türü</label>
              <select
                value={form.offer_type}
                onChange={(e) => setForm({ ...form, offer_type: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none"
              >
                {offerTypes.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {form.offer_type === 'discount_percent' ? 'İndirim Oranı (%)' :
                 form.offer_type === 'discount_fixed' ? 'İndirim Tutarı (₺)' :
                 'Değer'}
              </label>
              <input
                type="number"
                value={form.offer_value}
                onChange={(e) => setForm({ ...form, offer_value: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none"
                placeholder={form.offer_type === 'discount_percent' ? '20' : '50'}
              />
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700">Kampanya Mesajı</h2>

          <textarea
            value={form.message_template}
            onChange={(e) => setForm({ ...form, message_template: e.target.value })}
            rows={3}
            className="mt-3 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none"
            placeholder="Müşteriye gönderilecek mesaj..."
          />
          <p className="mt-1 text-xs text-gray-400">{form.message_template.length}/160 karakter</p>
        </div>

        {/* Scheduling */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Gönderim Zamanı</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm({ ...form, scheduleMode: 'now' })}
              className={`rounded-lg border px-4 py-2 text-sm ${form.scheduleMode === 'now' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              Taslak Oluştur
            </button>
            <button type="button" onClick={() => setForm({ ...form, scheduleMode: 'later' })}
              className={`rounded-lg border px-4 py-2 text-sm ${form.scheduleMode === 'later' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              Planla
            </button>
          </div>
          {form.scheduleMode === 'now' && (
            <p className="mt-3 text-xs text-gray-400">
              Kampanya taslak olarak kaydedilecek. Göndermek için Kampanyalar listesinden bu kampanyaya tıklayıp detay sayfasında &quot;Gönder&quot; butonunu kullanin.
            </p>
          )}
          {form.scheduleMode === 'later' && (() => {
            const todayStr = new Date().toISOString().split('T')[0]
            const isToday = form.scheduled_date === todayStr
            const nowTimeStr = new Date().toTimeString().slice(0, 5)
            return (
              <div className="mt-3 flex gap-3">
                <input
                  type="date"
                  min={todayStr}
                  value={form.scheduled_date}
                  onChange={e => setForm({ ...form, scheduled_date: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none"
                />
                <input
                  type="time"
                  min={isToday ? nowTimeStr : undefined}
                  value={form.scheduled_time}
                  onChange={e => setForm({ ...form, scheduled_time: e.target.value })}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none"
                />
              </div>
            )
          })()}
        </div>

        {/* Campaign name & submit */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700">Kampanya Adı</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:outline-none"
              placeholder="Öğleden Sonra Fırsatı"
            />
          </div>
          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/campaigns')}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving || !form.name || !form.message_template}
              className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {saving ? 'Kaydediliyor...' : form.scheduleMode === 'later' ? 'Planla' : 'Taslak Oluştur'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

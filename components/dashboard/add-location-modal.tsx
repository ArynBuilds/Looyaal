'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface AddLocationModalProps {
  onClose: () => void
  onComplete: () => void
}

export function AddLocationModal({ onClose, onComplete }: AddLocationModalProps) {
  const [form, setForm] = useState({
    name: '', address: '', city: '', district: '', phone: '', opening_time: '07:00', closing_time: '23:00',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/locations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      onComplete()
    } else {
      const data = await res.json()
      setError(data.error || 'Sube eklenemedi')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Yeni Şube Ekle</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100 transition">
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>


        {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sube Adi *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                placeholder="Kadikoy Sube" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Sehir</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Istanbul" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ilce</label>
                <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Kadikoy" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Adres</label>
              <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Telefon</label>
              <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="+90 5XX XXX XX XX" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Acilis</label>
                <input type="time" value={form.opening_time} onChange={(e) => setForm({ ...form, opening_time: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Kapanis</label>
                <input type="time" value={form.closing_time} onChange={(e) => setForm({ ...form, closing_time: e.target.value })}
                  className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
              </div>
            </div>
          </div>


          <div className="mt-5 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
              Iptal
            </button>
            <button type="submit" disabled={loading || !form.name.trim()} className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition disabled:opacity-50">
              {loading ? 'Ekleniyor...' : 'Şube Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

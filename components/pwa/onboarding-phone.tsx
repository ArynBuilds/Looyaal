'use client'

import { useState } from 'react'
import { useTheme } from './theme-provider'

interface OnboardingPhoneProps {
  orgSlug: string
  onBack: () => void
  onSuccess: (customer: { id: string; phone: string; full_name: string | null }) => void
}

export function OnboardingPhone({ orgSlug, onBack, onSuccess }: OnboardingPhoneProps) {
  const theme = useTheme()
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const fullPhone = '+90' + phone.replace(/\s/g, '')
    if (fullPhone.length < 13) { setError('Gecerli bir numara girin'); return }
    setLoading(true); setError(null)
    try {
      const res = await fetch(`/api/public/${orgSlug}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone, fullName: name.trim() || undefined }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Giris yapilamadi')
        setLoading(false)
        return
      }
      const { customer } = await res.json()
      setLoading(false)
      onSuccess(customer)
    } catch {
      setError('Baglanti hatasi')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg, #0f0f0f)' }}>
      <div className="flex-1 flex flex-col px-7 pt-14">
        <div className="flex items-center gap-3 animate-[fadeInUp_0.5s_ease-out_forwards]">
          <button onClick={onBack} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <p className="text-white/40 text-sm font-medium">{theme.name}</p>
        </div>

        <div className="mt-10 animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0">
          <h2 className="text-xl font-bold text-white">Telefon numaraniz</h2>
          <p className="mt-2 text-white/30 text-sm">Sadakat kartiniz telefon numaraniza baglanir.</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="mt-8 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0">
            <label className="text-white/25 text-[11px] font-medium tracking-wider uppercase">Telefon</label>
            <div className="mt-2 rounded-xl px-4 py-3.5 flex items-center gap-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-white/40 text-sm font-medium">+90</span>
              <div className="w-px h-5 bg-white/10" />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/[^\d\s]/g, ''))}
                placeholder="555 123 45 67"
                className="flex-1 bg-transparent text-white text-sm font-medium tracking-wide outline-none placeholder:text-white/20"
                autoFocus
              />
            </div>
          </div>

          <div className="mt-4 animate-[fadeInUp_0.5s_ease-out_0.3s_forwards] opacity-0">
            <label className="text-white/25 text-[11px] font-medium tracking-wider uppercase">
              Adiniz <span className="text-white/15">(istege bagli)</span>
            </label>
            <div className="mt-2 rounded-xl px-4 py-3.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Adinizi girin"
                className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/20"
              />
            </div>
          </div>

          <p className="mt-4 text-white/15 text-xs animate-[fadeInUp_0.5s_ease-out_0.4s_forwards] opacity-0">
            Numaraniz yalnizca sadakat kartiniz icin kullanilir.
          </p>

          <div className="flex-1" />

          <div className="mt-5 pb-10">
            <button
              type="submit"
              disabled={loading || phone.replace(/\s/g, '').length < 10}
              className="w-full py-3.5 rounded-xl bg-amber-600 text-white font-semibold text-sm disabled:opacity-50 animate-[fadeInUp_0.5s_ease-out_0.4s_forwards] opacity-0"
            >
              {loading ? 'Giris yapiliyor...' : 'Devam Et'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

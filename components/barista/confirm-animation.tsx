'use client'

import { useEffect } from 'react'

interface ConfirmAnimationProps {
  type?: 'stamp' | 'reward' | 'subscription' | 'campaign'
  onComplete: () => void
}

export function ConfirmAnimation({ type = 'stamp', onComplete }: ConfirmAnimationProps) {
  useEffect(() => {
    if ('vibrate' in navigator) navigator.vibrate([50, 50, 100])
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  const titles: Record<string, string> = {
    stamp: 'Puan verildi!',
    reward: 'Odul onaylandi!',
    subscription: 'Abonelik kullanildi!',
    campaign: 'Kampanya onaylandi!',
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
      {/* Stamp-in circle — exact same animation as customer sees */}
      <div style={{ animation: 'stampIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
        <div className="w-24 h-24 rounded-full bg-amber-600 flex items-center justify-center" style={{ boxShadow: '0 0 60px rgba(217,119,6,0.15), 0 0 120px rgba(217,119,6,0.08)' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <p className="mt-6 text-xl font-bold text-white" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s forwards', opacity: 0 }}>
        {titles[type] || 'Onaylandi!'}
      </p>

      <p className="mt-2 text-sm text-white/30" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}>
        Taramaya devam edebilirsiniz
      </p>

      <style>{`
        @keyframes stampIn { 0% { opacity:0; transform:scale(0) rotate(-90deg); } 70% { transform:scale(1.1) rotate(5deg); } 100% { opacity:1; transform:scale(1) rotate(0deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}

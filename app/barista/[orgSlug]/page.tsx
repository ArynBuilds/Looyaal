'use client'

import { useCallback, useState } from 'react'
import { Scanner } from '@/components/barista/scanner'
import { StampConfirm } from '@/components/barista/stamp-confirm'
import { ConfirmAnimation } from '@/components/barista/confirm-animation'
import { RecentList } from '@/components/barista/recent-list'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { useParams } from 'next/navigation'

type Screen = 'scanning' | 'verifying' | 'confirming' | 'success' | 'error'

interface VerifyData {
  tokenId: string
  type: string
  customer: { id: string; name: string; visits: number }
  stamps: number
  stampsRequired: number
  payload: Record<string, string>
  offerDetails?: { title: string; offer_type: string; offer_value: number | null; free_item_name: string | null } | null
}

export default function BaristaPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>()
  const [screen, setScreen] = useState<Screen>('scanning')
  const [verifyData, setVerifyData] = useState<VerifyData | null>(null)
  const [scannedToken, setScannedToken] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleScan = useCallback(async (data: string) => {
    if (screen !== 'scanning') return
    setScreen('verifying')

    try {
      // Decode base64 QR payload
      const decoded = JSON.parse(atob(data))
      const token = decoded.t

      const res = await fetch('/api/barista/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      if (!res.ok) {
        const err = await res.json()
        setErrorMsg(err.error || 'Gecersiz QR kod')
        setScreen('error')
        return
      }

      const result = await res.json()
      setVerifyData(result)
      setScannedToken(token)
      setScreen('confirming')
    } catch {
      setErrorMsg('QR kod okunamadi')
      setScreen('error')
    }
  }, [screen])

  async function handleConfirm(drinkName?: string, menuItemId?: string) {
    if (!scannedToken) return

    const res = await fetch('/api/barista/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: scannedToken, drinkName, menuItemId }),
    })

    if (res.ok) {
      setScreen('success')
    } else {
      const err = await res.json()
      setErrorMsg(err.error || 'Onaylama basarisiz')
      setScreen('error')
    }
  }

  return (
    <div className="p-4">
      {screen === 'scanning' && (
        <>
          <Scanner onScan={handleScan} />
          <RecentList />
        </>
      )}

      {screen === 'verifying' && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {screen === 'confirming' && verifyData && (
        <>
          {verifyData.type === 'stamp' && (
            <StampConfirm
              customerName={verifyData.customer.name}
              stamps={verifyData.stamps}
              stampsRequired={verifyData.stampsRequired}
              orgSlug={orgSlug}
              onConfirm={(drink, menuItemId) => handleConfirm(drink, menuItemId)}
              onCancel={() => setScreen('scanning')}
              offerDetails={verifyData.offerDetails}
            />
          )}

          {(verifyData.type === 'reward' || verifyData.type === 'subscription' || verifyData.type === 'campaign') && (
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center text-white font-bold">
                  {verifyData.customer.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{verifyData.customer.name}</p>
                  <p className="text-xs text-white/40 capitalize">{verifyData.type}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setScreen('scanning')} className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-sm">
                  Iptal
                </button>
                <button onClick={() => handleConfirm()} className="flex-1 py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold">
                  Onayla
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {screen === 'success' && (
        <ConfirmAnimation onComplete={() => setScreen('scanning')} />
      )}

      {screen === 'error' && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
          <p className="text-sm text-red-400 text-center">{errorMsg}</p>
          <button
            onClick={() => setScreen('scanning')}
            className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/60 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Tekrar Dene
          </button>
        </div>
      )}
    </div>
  )
}

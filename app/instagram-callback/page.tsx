'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function InstagramCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Facebook returns token in URL fragment: #access_token=...&long_lived_token=...&state=...
    const hash = window.location.hash.substring(1) // remove #
    const params = new URLSearchParams(hash)

    const accessToken = params.get('long_lived_token') || params.get('access_token')
    const state = params.get('state')

    if (!accessToken) {
      // Check for error in query params
      const searchParams = new URLSearchParams(window.location.search)
      const errorMsg = searchParams.get('error_description') || searchParams.get('error') || 'Token alınamadı'
      setError(errorMsg)
      setStatus('error')
      return
    }

    // Send token to server
    fetch('/api/instagram/save-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, state }),
    })
      .then(res => {
        if (res.ok) {
          setStatus('success')
          setTimeout(() => router.push('/influencers?instagram=connected'), 1500)
        } else {
          return res.json().then(data => {
            setError(data.error || 'Bağlantı başarısız')
            setStatus('error')
          })
        }
      })
      .catch(() => {
        setError('Bağlantı hatası')
        setStatus('error')
      })
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        {status === 'loading' && (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-200 border-t-amber-500 mx-auto" />
            <p className="mt-4 text-sm text-gray-600">Instagram bağlanıyor...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">Instagram bağlandı!</p>
            <p className="mt-1 text-xs text-gray-500">Yönlendiriliyorsunuz...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </div>
            <p className="mt-4 text-sm font-medium text-gray-900">Bağlantı başarısız</p>
            <p className="mt-1 text-xs text-red-500">{error}</p>
            <button onClick={() => router.push('/influencers')} className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
              Geri Dön
            </button>
          </>
        )}
      </div>
    </div>
  )
}

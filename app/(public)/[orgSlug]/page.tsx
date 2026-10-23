'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useConfetti, useHaptic } from '@/components/pwa/confetti'
// ── LOCKED: Onboarding components — never change these ──
import { OnboardingSplash } from '@/components/pwa/onboarding-splash'
import { OnboardingWelcome } from '@/components/pwa/onboarding-welcome'
import { OnboardingPhone } from '@/components/pwa/onboarding-phone'
import { OnboardingStamp } from '@/components/pwa/onboarding-stamp'
import { InstallAndroid } from '@/components/pwa/install-android'
import { InstallIOS } from '@/components/pwa/install-ios'
import { ThemeProvider } from '@/components/pwa/theme-provider'
// ── PWA v2 ──
import { TokenProvider } from '@/components/pwa-v2/token-provider'
import { PwaShell } from '@/components/pwa-v2/pwa-shell'
import { DEFAULT_CONFIG, type PwaConfig } from '@/lib/pwa-tokens'

interface OrgInfo {
  id: string
  name: string
  slug: string
  logo_url: string | null
  banner_url: string | null
  primary_color: string
  city: string | null
  address: string | null
}

interface CustomerData {
  id: string
  phone: string
  full_name: string | null
  total_visits?: number
  total_stamps?: number
}

type Screen = 'loading' | 'splash' | 'welcome' | 'phone' | 'stamp' | 'install' | 'app'

// Persist customer session across browser → standalone PWA transition
function saveCustomerSession(orgId: string, customer: CustomerData) {
  const key = `looyaal_${orgId}_customer`
  const value = JSON.stringify(customer)
  try { localStorage.setItem(key, value) } catch { /* quota */ }
  try { document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=31536000;SameSite=Lax` } catch { /* */ }
}

function loadCustomerSession(orgId: string): CustomerData | null {
  const key = `looyaal_${orgId}_customer`
  try {
    const ls = localStorage.getItem(key)
    if (ls) return JSON.parse(ls)
  } catch { /* */ }
  try {
    const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${key}=([^;]+)`))
    if (match) {
      const data = JSON.parse(decodeURIComponent(match[1]))
      try { localStorage.setItem(key, JSON.stringify(data)) } catch { /* */ }
      return data
    }
  } catch { /* */ }
  return null
}

function clearCustomerSession(orgId: string) {
  const key = `looyaal_${orgId}_customer`
  try { localStorage.removeItem(key) } catch { /* */ }
  try { document.cookie = `${key}=;path=/;max-age=0` } catch { /* */ }
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function CustomerPWA({
  params: paramsPromise,
}: {
  params: Promise<{ orgSlug: string }>
}) {
  const [params, setParams] = useState<{ orgSlug: string } | null>(null)
  const searchParams = useSearchParams()
  const locationId = searchParams.get('loc')

  const [org, setOrg] = useState<OrgInfo | null>(null)
  const [screen, setScreen] = useState<Screen>('loading')
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [stamped, setStamped] = useState(false)
  const [rewardEarned, setRewardEarned] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stampsRequired, setStampsRequired] = useState(10)
  const [rewardName, setRewardName] = useState('Bedava Kahve')
  const [pwaConfig, setPwaConfig] = useState<PwaConfig>(DEFAULT_CONFIG)

  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null)
  const isNewCustomer = useRef(false)

  useConfetti(rewardEarned)
  useHaptic(stamped)

  // Request notification permission on first touch/click (iOS requires user gesture)
  useEffect(() => {
    if (screen !== 'app' || !customer?.id || !org?.id) return
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted') {
      subscribeToPush(customer.id, org.id)
      return
    }
    if (Notification.permission === 'denied') return
    const handler = () => subscribeToPush(customer.id, org.id)
    document.addEventListener('click', handler, { once: true })
    document.addEventListener('touchstart', handler, { once: true })
    return () => {
      document.removeEventListener('click', handler)
      document.removeEventListener('touchstart', handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, customer?.id, org?.id])

  // Capture beforeinstallprompt for Android
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      deferredPromptRef.current = e as BeforeInstallPromptEvent
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    paramsPromise.then(setParams)
  }, [paramsPromise])

  useEffect(() => {
    if (!params) return
    loadOrg()
  }, [params])

  async function loadOrg() {
    const res = await fetch(`/api/public/${params!.orgSlug}/info`)
    if (!res.ok) { setError('Isletme bulunamadi'); return }
    const data = await res.json()
    setOrg(data)

    // Load PWA config from theme API
    try {
      const themeRes = await fetch(`/api/public/${params!.orgSlug}/theme`)
      if (themeRes.ok) {
        const themeData = await themeRes.json()
        if (themeData.config) {
          setPwaConfig({ ...DEFAULT_CONFIG, ...themeData.config })
        }
      }
    } catch { /* use defaults */ }

    // Dynamic manifest
    const existing = document.querySelector('link[rel="manifest"]')
    if (existing) existing.remove()
    const link = document.createElement('link')
    link.rel = 'manifest'
    link.href = `/api/public/${params!.orgSlug}/manifest`
    document.head.appendChild(link)

    // Load loyalty program info
    try {
      const cardRes = await fetch(`/api/public/${params!.orgSlug}/card?customerId=preview`)
      if (cardRes.ok) {
        const cardData = await cardRes.json()
        if (cardData.stamps_required) setStampsRequired(cardData.stamps_required)
        if (cardData.reward_name) setRewardName(cardData.reward_name)
      }
    } catch { /* use defaults */ }

    // Check saved customer
    const savedCustomer = loadCustomerSession(data.id)
    if (savedCustomer) {
      // Validate the session still exists on server. If the customer was
      // deleted during a migration or the session is stale (PWA reinstall
      // while logged in), the API returns 404 — clear the stale session
      // and send them through registration again.
      try {
        const check = await fetch(`/api/public/${params!.orgSlug}/card?customerId=${savedCustomer.id}`)
        if (check.status === 404 || check.status === 400) {
          clearCustomerSession(data.id)
          isNewCustomer.current = true
          setScreen('splash')
          return
        }
      } catch { /* network error — fall through to load session anyway */ }

      setCustomer(savedCustomer)
      isNewCustomer.current = false
      setScreen('splash')
    } else {
      isNewCustomer.current = true
      setScreen('splash')
    }
  }

  const handleSplashComplete = useCallback(() => {
    if (isNewCustomer.current) {
      setScreen('welcome')
    } else {
      setScreen('app')
    }
  }, [])

  function handleLoginSuccess(cust: { id: string; phone: string; full_name: string | null }) {
    setCustomer(cust)
    saveCustomerSession(org!.id, cust)
    // Don't ask for notifications during onboarding — ask when PWA app screen loads
    setScreen('stamp')
  }

  function handleInstall() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isAndroid = /Android/.test(navigator.userAgent)
    if (isAndroid && deferredPromptRef.current) {
      setScreen('install')
    } else if (isIOS) {
      setScreen('install')
    } else {
      setScreen('app')
    }
  }

  async function subscribeToPush(customerId: string, orgId: string) {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.log('[push] Not supported:', { sw: 'serviceWorker' in navigator, pm: 'PushManager' in window })
        return
      }
      const reg = await navigator.serviceWorker.register('/sw.js')
      const perm = await Notification.requestPermission()
      console.log('[push] Permission:', perm)
      if (perm !== 'granted') return
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      console.log('[push] VAPID key present:', !!vapidKey, vapidKey?.substring(0, 10))

      // Always unsubscribe any existing subscription first. Without this,
      // reinstalling the PWA keeps the old (dead) subscription from the
      // browser cache and pushes silently fail.
      const existing = await reg.pushManager.getSubscription()
      if (existing) {
        try { await existing.unsubscribe() } catch { /* ignore */ }
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })
      console.log('[push] Subscription endpoint:', sub.endpoint.substring(0, 50))
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, orgId, subscription: sub.toJSON() }),
      })
      console.log('[push] Subscribe API response:', res.status)
    } catch (err) {
      console.error('[push] Error:', err)
    }
  }

  // Stamps are awarded via barista scan only (Puan Kazan → QR → barista confirms)
  // First-time registration gives 1 free stamp via OTP verify API

  function handleLogout() {
    if (org) clearCustomerSession(org.id)
    setCustomer(null)
    isNewCustomer.current = true
    setScreen('welcome')
  }

  if (error && !org) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (screen === 'loading' || !org || !params) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">looyaal</h1>
          <div className="mt-3 h-0.5 w-10 mx-auto rounded-full bg-amber-600 animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider orgSlug={params.orgSlug}>
      {/* ── LOCKED: Onboarding flow — these screens never change ── */}
      {screen === 'splash' && (
        <OnboardingSplash onComplete={handleSplashComplete} />
      )}
      {screen === 'welcome' && (
        <OnboardingWelcome
          stampsRequired={stampsRequired}
          rewardName={rewardName}
          onContinue={() => setScreen('phone')}
        />
      )}
      {screen === 'phone' && (
        <OnboardingPhone
          orgSlug={params.orgSlug}
          onBack={() => setScreen('welcome')}
          onSuccess={handleLoginSuccess}
        />
      )}
      {screen === 'stamp' && (
        <OnboardingStamp
          stampsRequired={stampsRequired}
          rewardName={rewardName}
          onInstall={handleInstall}
          onSkip={() => setScreen('app')}
        />
      )}
      {screen === 'install' && (
        /Android/.test(navigator.userAgent) ? (
          <InstallAndroid
            deferredPrompt={deferredPromptRef.current}
            onInstalled={() => setScreen('app')}
            onSkip={() => setScreen('app')}
          />
        ) : (
          <InstallIOS onDone={() => setScreen('app')} />
        )
      )}

      {/* ── PWA v2: Main App ── */}
      {screen === 'app' && (
        <div style={{ height: '100dvh', width: '100%', background: pwaConfig.color_mode === 'light' ? '#f0f0ee' : '#09090b' }}>
          <TokenProvider config={pwaConfig}>
            <PwaShell
              orgSlug={params.orgSlug}
              customerId={customer?.id || null}
              customerName={customer?.full_name || 'Misafir'}
              customerPhone={customer?.phone || ''}
              onLogout={handleLogout}
            />
          </TokenProvider>
        </div>
      )}
    </ThemeProvider>
  )
}

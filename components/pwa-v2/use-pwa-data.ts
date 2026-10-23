'use client'

// Data fetching hook for PWA v2
// Fetches loyalty card, menu, campaigns, visits from existing APIs

import { useState, useEffect, useCallback } from 'react'

interface LoyaltyData {
  currentStamps: number
  totalRequired: number
  rewardName: string
  cardsCompleted: number
}

interface VisitData {
  date: string
  location: string
}

interface CampaignData {
  id: string
  name: string
  description?: string
  discount_text?: string
  valid_until?: string
  type?: string
  claimed?: boolean
}

interface MenuItemData {
  id: string
  name: string
  price: number
  photoUrl?: string | null
  category?: string
  is_featured?: boolean
}

interface ShopData {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  bannerUrl: string | null
  city: string
  address?: string
  openingTime?: string
  closingTime?: string
}

export interface PwaData {
  shop: ShopData
  loyalty: LoyaltyData
  personalizedDeals: CampaignData[]
  campaigns: CampaignData[]
  menuItems: MenuItemData[]
  visits: VisitData[]
  activeChallenge: { id: string; type: string; title: string; description: string; targetCount: number; currentCount: number; rewardType: string; rewardValue: number; daysRemaining: number; expiresAt?: string | null } | null
  streak: number
  longestStreak: number
  streakActive: boolean
  graceAvailable: boolean
  completedChallenges: number
  totalVisits: number
  totalRewards: number
  memberSince: string
  loading: boolean
  error: string | null
  // Actions
  refreshLoyalty: () => void
  refreshCampaigns: () => void
  refreshPersonalized: () => void
  generateQr: (type: string, campaignId?: string) => Promise<{ token: string; qrPayload: string; expiresAt: string } | null>
  pollQrStatus: (token: string) => Promise<boolean>
  claimCampaign: (campaignId: string) => Promise<boolean>
  trackNotificationClick: (notificationId: string) => void
}

export function usePwaData(orgSlug: string, customerId: string | null): PwaData {
  const [shop, setShop] = useState<ShopData>({ id: '', name: '', slug: orgSlug, logoUrl: null, bannerUrl: null, city: '' })
  const [loyalty, setLoyalty] = useState<LoyaltyData>({ currentStamps: 0, totalRequired: 10, rewardName: 'Bedava Kahve', cardsCompleted: 0 })
  const [personalizedDeals, setPersonalizedDeals] = useState<CampaignData[]>([])
  const [campaigns, setCampaigns] = useState<CampaignData[]>([])
  const [menuItems, setMenuItems] = useState<MenuItemData[]>([])
  const [visits, setVisits] = useState<VisitData[]>([])
  const [totalVisits, setTotalVisits] = useState(0)
  const [totalRewards, setTotalRewards] = useState(0)
  const [memberSince, setMemberSince] = useState('')
  const [longestStreak, setLongestStreak] = useState(0)
  const [streakActive, setStreakActive] = useState(false)
  const [graceAvailable, setGraceAvailable] = useState(false)
  const [completedChallenges, setCompletedChallenges] = useState(0)
  const [activeChallenge, setActiveChallenge] = useState<PwaData['activeChallenge']>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch shop info
  useEffect(() => {
    fetch(`/api/public/${orgSlug}/info`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setShop({
            id: data.id,
            name: data.name,
            slug: data.slug,
            logoUrl: data.logo_url,
            bannerUrl: data.banner_url || null,
            city: data.city || '',
            address: data.address,
            openingTime: data.opening_time,
            closingTime: data.closing_time,
          })
        }
      })
      .catch(() => setError('Shop bilgileri yuklenemedi'))
  }, [orgSlug])

  // Fetch loyalty card
  const refreshLoyalty = useCallback(() => {
    if (!customerId) return
    fetch(`/api/public/${orgSlug}/card?customerId=${customerId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.card) {
          setLoyalty({
            currentStamps: data.card.current_stamps || 0,
            totalRequired: data.card.loyalty_programs?.stamps_required || 10,
            rewardName: data.card.loyalty_programs?.name || 'Bedava Kahve',
            cardsCompleted: data.card.cards_completed || 0,
          })
          setTotalRewards(data.card.cards_completed || 0)
        }
        if (data?.customer) {
          setTotalVisits(data.customer.total_visits || 0)
          if (data.customer.created_at) {
            const d = new Date(data.customer.created_at)
            const months = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik']
            setMemberSince(`${months[d.getMonth()]} ${d.getFullYear()}`)
          }
          // Fetch recent visits for activity timeline
          fetch(`/api/public/${orgSlug}/visits?customerId=${customerId}&limit=5`, { cache: 'no-store' })
            .then(r => r.ok ? r.json() : [])
            .then(visitData => {
              if (Array.isArray(visitData)) {
                setVisits(visitData.map((v: { visited_at: string; location_name?: string }) => ({
                  date: new Date(v.visited_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }),
                  location: v.location_name || '',
                })))
              }
            })
            .catch(() => {})
        }
      })
      .catch(() => setError('Sadakat bilgileri yuklenemedi'))
  }, [orgSlug, customerId])

  // Fetch active campaigns for this org (personalized if customerId available)
  const refreshCampaigns = useCallback(() => {
    const url = customerId
      ? `/api/public/${orgSlug}/campaigns?customerId=${customerId}`
      : `/api/public/${orgSlug}/campaigns`
    fetch(url, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setCampaigns(Array.isArray(data) ? data : [])
      })
      .catch(() => setError('Kampanyalar yuklenemedi'))
  }, [orgSlug, customerId])

  // Fetch personalized deals (Sana Ozel) from notification_queue
  const refreshPersonalized = useCallback(() => {
    if (!customerId) return
    fetch(`/api/public/${orgSlug}/offers?customerId=${customerId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (!Array.isArray(data)) { setPersonalizedDeals([]); return }
        // Map customer_offers API shape → CampaignData shape
        const now = new Date().getTime()
        const mapped: CampaignData[] = data
          .filter((o: Record<string, unknown>) => {
            // Client-side expiry check: even if the API returned it before
            // expiry, don't show if it's since expired (avoids stale cards
            // lingering on screen between re-fetches)
            const exp = o.expires_at as string | null | undefined
            return !exp || new Date(exp).getTime() > now
          })
          .map((o: Record<string, unknown>) => {
            let discountText = ''
            if (o.offer_type === 'discount_percent' && o.offer_value) {
              const item = o.applies_to_item as string | null | undefined
              discountText = item
                ? `${item} %${o.offer_value} indirim`
                : `%${o.offer_value} indirim`
            }
            else if (o.offer_type === 'free_item') discountText = `Bedava ${o.free_item_name || 'ikram'}`
            else if (o.offer_type === 'double_stamp') discountText = '2x puan'

            return {
              id: o.id as string,
              name: (o.title as string) || '',
              description: (o.description as string) || undefined,
              discount_text: discountText || undefined,
              valid_until: (o.expires_at as string) || undefined,
              type: (o.type as string) || undefined,
            }
          })
        setPersonalizedDeals(mapped)
      })
      .catch(() => { /* silent — sana ozel is optional */ })
  }, [orgSlug, customerId])

  // Fetch menu
  useEffect(() => {
    fetch(`/api/public/${orgSlug}/menu`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setMenuItems(Array.isArray(data) ? data.map((d: Record<string, unknown>) => ({
          id: d.id as string,
          name: d.name as string,
          price: d.price as number,
          photoUrl: d.image_url as string || null,
          category: d.category as string || undefined,
          is_featured: d.is_featured as boolean || false,
        })) : [])
      })
      .catch(() => setError('Menu yuklenemedi'))
  }, [orgSlug])

  // Initial load
  useEffect(() => {
    if (!customerId) { setLoading(false); return }
    Promise.all([refreshLoyalty(), refreshCampaigns(), refreshPersonalized()])
      .finally(() => setLoading(false))
  }, [customerId, refreshLoyalty, refreshCampaigns, refreshPersonalized])

  // Fetch streak data from API (replaces hardcoded calculation)
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    if (!customerId) return
    fetch(`/api/public/${orgSlug}/streak?customerId=${customerId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setStreak(data.currentStreak || 0)
          setLongestStreak(data.longestStreak || 0)
          setStreakActive(data.streakActive || false)
          setGraceAvailable(data.graceAvailable || false)
          setCompletedChallenges(data.completedChallenges || 0)
        }
      })
      .catch(() => {})
  }, [customerId, orgSlug])

  // Fetch active challenge
  const refreshChallenge = useCallback(() => {
    if (!customerId) return
    fetch(`/api/public/${orgSlug}/challenges?customerId=${customerId}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(data => setActiveChallenge(data?.challenge || null))
      .catch(() => {})
  }, [customerId, orgSlug])

  useEffect(() => { refreshChallenge() }, [refreshChallenge])

  // Re-fetch all dynamic data every 5 min so expired/completed/removed items
  // disappear without requiring an app restart. The 30s expiry interval catches
  // offers/campaigns that expire between re-fetches so cards vanish within 30s
  // of expiry even if the PWA is sitting open on screen.
  //
  // Also re-fetch on visibility change (user returns to the app after
  // backgrounding it). On mobile, setInterval timers are suspended while the
  // app is in the background — without this, a customer who backgrounds the
  // PWA for 20 min and comes back would still see stale/expired cards until
  // the next interval tick.
  useEffect(() => {
    if (!customerId) return

    const refetchAll = () => {
      refreshPersonalized()
      refreshCampaigns()
      refreshLoyalty()
      refreshChallenge()
    }

    const checkExpiry = () => {
      const now = new Date().getTime()
      setPersonalizedDeals(prev => {
        const filtered = prev.filter(d => !d.valid_until || new Date(d.valid_until).getTime() > now)
        return filtered.length === prev.length ? prev : filtered
      })
      setCampaigns(prev => {
        const filtered = prev.filter(d => !d.valid_until || new Date(d.valid_until).getTime() > now)
        return filtered.length === prev.length ? prev : filtered
      })
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkExpiry()
        refetchAll()
      }
    }

    const refetchInterval = setInterval(refetchAll, 5 * 60 * 1000)
    const expiryInterval = setInterval(checkExpiry, 30 * 1000)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      clearInterval(refetchInterval)
      clearInterval(expiryInterval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [customerId, refreshPersonalized, refreshCampaigns, refreshLoyalty, refreshChallenge])

  // Generate QR code
  const generateQr = async (type: string, campaignId?: string) => {
    if (!customerId) return null
    try {
      const res = await fetch(`/api/public/${orgSlug}/qr/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, type, campaignId }),
      })
      if (res.ok) return await res.json()
    } catch { /* silent */ }
    return null
  }

  // Poll QR status
  const pollQrStatus = async (token: string) => {
    try {
      const res = await fetch(`/api/public/${orgSlug}/qr/status?token=${token}`)
      if (res.ok) {
        const data = await res.json()
        return data.used === true
      }
    } catch { /* silent */ }
    return false
  }

  // Track notification click (for AI learning)
  const trackNotificationClick = (notificationId: string) => {
    if (!customerId) return
    fetch(`/api/push/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId, customerId, clickedAt: new Date().toISOString() }),
    }).catch(() => { /* silent */ })
  }

  // Claim campaign
  const claimCampaign = async (campaignId: string) => {
    if (!customerId) return false
    try {
      const res = await fetch(`/api/public/${orgSlug}/campaign/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, campaignId }),
      })
      return res.ok
    } catch { /* silent */ }
    return false
  }

  return {
    shop,
    loyalty,
    personalizedDeals,
    campaigns,
    menuItems,
    visits,
    activeChallenge,
    streak,
    longestStreak,
    streakActive,
    graceAvailable,
    completedChallenges,
    totalVisits,
    totalRewards,
    memberSince: memberSince || 'Mart 2026',
    loading,
    error,
    refreshLoyalty,
    refreshCampaigns,
    refreshPersonalized,
    generateQr,
    pollQrStatus,
    claimCampaign,
    trackNotificationClick,
  }
}

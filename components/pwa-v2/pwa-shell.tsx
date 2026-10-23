'use client'

// PWA Shell — Main container: fetches data, manages tabs, renders nav, handles QR overlay

import { useState, useEffect, useRef, useCallback } from 'react'
import { useConfig } from './token-provider'
import { NAV_VARIANTS } from './variant-renderer'
import type { NavTab } from './variants/nav-types'
import { TabKartim } from './tab-kartim'
import { TabMagaza } from './tab-magaza'
import { TabProfil } from './tab-profil'
import { NAV_TABS } from './variants/nav-types'
import { SinglePage } from './single-page'
import { QrOverlay } from './qr-overlay'
import { usePwaData, type PwaData } from './use-pwa-data'

interface PwaShellProps {
  orgSlug: string
  customerId: string | null
  customerName: string
  customerPhone: string
  onLogout: () => void
}

// Static props version for preview (mock data, no API calls)
interface PwaShellStaticProps {
  shopName: string
  logoUrl: string | null
  bannerUrl: string | null
  city: string
  address?: string
  openingTime?: string
  closingTime?: string
  customerId: string | null
  customerName: string
  customerPhone: string
  currentStamps: number
  totalRequired: number
  rewardName: string
  streak: number
  totalVisits: number
  totalStamps: number
  totalRewards: number
  lastVisits: { date: string; location: string }[]
  memberSince: string
  personalizedDeals?: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  campaigns: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  menuItems: { id: string; name: string; price: number; photoUrl?: string | null; category?: string; is_featured?: boolean }[]
  onLogout: () => void
}

// Detect if props are static (preview) or dynamic (real app)
function isStaticProps(props: PwaShellProps | PwaShellStaticProps): props is PwaShellStaticProps {
  return 'shopName' in props
}

export function PwaShell(props: PwaShellProps | PwaShellStaticProps) {
  const config = useConfig()
  const [activeTab, setActiveTab] = useState<NavTab>('kartim')
  const [qrOverlay, setQrOverlay] = useState<{ title: string; subtitle?: string; type: 'stamp' | 'campaign' | 'offer' | 'reward'; campaignId?: string; offerId?: string; redemptionId?: string } | null>(null)

  // Deep link: ?tab=magaza&offer=X etc.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab')
    const offerId = params.get('offer')
    if (tab === 'magaza' || tab === 'profil' || tab === 'kartim') {
      setActiveTab(tab as NavTab)
    }
    // If offer deep link, always go to Magaza where Sana Ozel shows offers
    if (offerId) {
      setActiveTab('magaza')
    }
  }, [])

  const isSinglePage = config.layout === 'single-page'
  const Nav = NAV_VARIANTS[config.variant_nav || 'nav-bottom-bar']

  // For preview mode — use static props directly
  if (isStaticProps(props)) {
    return <PwaShellInner
      shopName={props.shopName}
      logoUrl={props.logoUrl}
      bannerUrl={props.bannerUrl}
      city={props.city}
      address={props.address}
      openingTime={props.openingTime}
      closingTime={props.closingTime}
      customerName={props.customerName}
      customerPhone={props.customerPhone}
      currentStamps={props.currentStamps}
      totalRequired={props.totalRequired}
      rewardName={props.rewardName}
      streak={props.streak}
      longestStreak={0}
      graceAvailable={false}
      totalVisits={props.totalVisits}
      totalStamps={props.totalStamps}
      totalRewards={props.totalRewards}
      lastVisits={props.lastVisits}
      memberSince={props.memberSince}
      personalizedDeals={props.personalizedDeals || []}
      campaigns={props.campaigns}
      menuItems={props.menuItems}
      onLogout={props.onLogout}
      isSinglePage={isSinglePage}
      Nav={Nav}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onStampPress={() => {}}
      onCampaignPress={() => {}}
      qrOverlay={null}
      onCloseQr={() => {}}
    />
  }

  // Dynamic mode — fetch real data
  return <PwaShellDynamic
    orgSlug={props.orgSlug}
    customerId={props.customerId}
    customerName={props.customerName}
    customerPhone={props.customerPhone}
    onLogout={props.onLogout}
    isSinglePage={isSinglePage}
    Nav={Nav}
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    qrOverlay={qrOverlay}
    setQrOverlay={setQrOverlay}
  />
}

function PwaShellDynamic({ orgSlug, customerId, customerName, customerPhone, onLogout, isSinglePage, Nav, activeTab, setActiveTab, qrOverlay, setQrOverlay }: {
  orgSlug: string
  customerId: string | null
  customerName: string
  customerPhone: string
  onLogout: () => void
  isSinglePage: boolean
  Nav: typeof NAV_VARIANTS[string]
  activeTab: NavTab
  setActiveTab: (t: NavTab) => void
  qrOverlay: { title: string; subtitle?: string; type: 'stamp' | 'campaign' | 'offer' | 'reward'; campaignId?: string; offerId?: string; redemptionId?: string } | null
  setQrOverlay: (v: { title: string; subtitle?: string; type: 'stamp' | 'campaign' | 'offer' | 'reward'; campaignId?: string; offerId?: string; redemptionId?: string } | null) => void
}) {
  const data = usePwaData(orgSlug, customerId)
  if (data.loading) {
    return (
      <div style={{ width: '100%', height: '100%', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid var(--color-brand)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const handleStampPress = async () => {
    const isFull = data.loyalty.currentStamps >= data.loyalty.totalRequired
    if (isFull) {
      const res = await fetch(`/api/public/${orgSlug}/reward/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
        cache: 'no-store',
      })
      if (!res.ok) return
      const { redemptionId, rewardName } = await res.json()
      setQrOverlay({ title: rewardName || 'Bedava kahveni al!', type: 'reward', redemptionId })
    } else {
      setQrOverlay({ title: 'Puan Kazan', type: 'stamp' })
    }
  }

  const handleCampaignPress = (campaign: { id: string; name: string; discount_text?: string; type?: string }) => {
    // Offers from customer_offers have a type field (goal_gradient, reengagement, etc.)
    // Regular campaigns don't have a type field or have type like 'seasonal', 'custom'
    const isOffer = campaign.type && ['goal_gradient', 'birthday', 'reengagement', 'hero_offer', 'challenge_reward', 'dead_hour_targeted'].includes(campaign.type)

    if (isOffer) {
      setQrOverlay({
        title: campaign.name,
        subtitle: campaign.discount_text,
        type: 'offer',
        offerId: campaign.id,
      })
    } else {
      setQrOverlay({
        title: campaign.name,
        subtitle: campaign.discount_text,
        type: 'campaign',
        campaignId: campaign.id,
      })
    }
  }

  const handleQrConfirmed = () => {
    setQrOverlay(null)
    data.refreshLoyalty()
    data.refreshCampaigns()
    data.refreshPersonalized()
  }

  const handleNotificationSettings = async () => {
    if (!customerId) return
    try {
      const res = await fetch(`/api/public/${orgSlug}/customer/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })
      if (res.ok) {
        const data = await res.json()
        alert(data.push_opted_in ? 'Bildirimler açıldı' : 'Bildirimler kapatıldı')
      } else {
        alert('Bir hata oluştu')
      }
    } catch {
      alert('Bir hata oluştu')
    }
  }

  const handleDeleteAccount = async () => {
    if (!customerId) return
    if (!window.confirm('Hesabinizi silmek istediginizden emin misiniz? Bu islem geri alinamaz.')) return
    try {
      const res = await fetch(`/api/public/${orgSlug}/customer/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })
      if (res.ok) {
        localStorage.removeItem('customerId')
        localStorage.removeItem('customerPhone')
        localStorage.removeItem('customerName')
        onLogout()
      } else alert('Bir hata olustu')
    } catch { alert('Bir hata olustu') }
  }

  return (
    <>
      <PwaShellInner
        orgSlug={orgSlug}
        shopName={data.shop.name}
        logoUrl={data.shop.logoUrl}
        bannerUrl={data.shop.bannerUrl}
        city={data.shop.city}
        address={data.shop.address}
        openingTime={data.shop.openingTime}
        closingTime={data.shop.closingTime}
        customerName={customerName}
        customerPhone={customerPhone}
        currentStamps={data.loyalty.currentStamps}
        totalRequired={data.loyalty.totalRequired}
        rewardName={data.loyalty.rewardName}
        streak={data.streak}
        longestStreak={data.longestStreak}
        graceAvailable={data.graceAvailable}
        totalVisits={data.totalVisits}
        totalStamps={data.loyalty.currentStamps}
        totalRewards={data.totalRewards}
        lastVisits={data.visits}
        memberSince={data.memberSince}
        personalizedDeals={data.personalizedDeals}
        campaigns={data.campaigns}
        menuItems={data.menuItems}
        activeChallenge={data.activeChallenge}
        completedChallenges={data.completedChallenges}
        onLogout={onLogout}
        onNotificationSettings={handleNotificationSettings}
        onDeleteAccount={handleDeleteAccount}
        isSinglePage={isSinglePage}
        Nav={Nav}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onStampPress={handleStampPress}
        onCampaignPress={handleCampaignPress}
        qrOverlay={qrOverlay}
        onCloseQr={() => setQrOverlay(null)}
      />
      {qrOverlay && customerId && (
        <QrOverlay
          title={qrOverlay.title}
          subtitle={qrOverlay.subtitle}
          orgSlug={orgSlug}
          customerId={customerId}
          type={qrOverlay.type}
          campaignId={qrOverlay.campaignId}
          offerId={qrOverlay.offerId}
          redemptionId={qrOverlay.redemptionId}
          onConfirmed={handleQrConfirmed}
          onClose={() => setQrOverlay(null)}
        />
      )}
    </>
  )
}

// Inner shell — shared between static and dynamic modes
function PwaShellInner({
  orgSlug, shopName, logoUrl, bannerUrl, city, address, openingTime, closingTime,
  customerName, customerPhone,
  currentStamps, totalRequired, rewardName,
  streak, longestStreak, graceAvailable, totalVisits, totalStamps, totalRewards, lastVisits, memberSince,
  personalizedDeals, campaigns, menuItems, activeChallenge, completedChallenges, onLogout,
  onNotificationSettings, onDeleteAccount,
  isSinglePage, Nav, activeTab, setActiveTab,
  onStampPress, onCampaignPress,
  qrOverlay, onCloseQr,
}: {
  orgSlug?: string
  shopName: string; logoUrl: string | null; bannerUrl: string | null; city: string
  address?: string; openingTime?: string; closingTime?: string
  customerName: string; customerPhone: string
  currentStamps: number; totalRequired: number; rewardName: string
  streak: number; longestStreak?: number; graceAvailable?: boolean; totalVisits: number; totalStamps: number; totalRewards: number
  lastVisits: { date: string; location: string }[]; memberSince: string
  personalizedDeals?: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  campaigns: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  menuItems: { id: string; name: string; price: number; photoUrl?: string | null; category?: string; is_featured?: boolean }[]
  activeChallenge?: PwaData['activeChallenge']
  completedChallenges?: number
  onLogout: () => void
  onNotificationSettings?: () => void
  onDeleteAccount?: () => void
  isSinglePage: boolean
  Nav: typeof NAV_VARIANTS[string]
  activeTab: NavTab; setActiveTab: (t: NavTab) => void
  onStampPress: () => void
  onCampaignPress: (c: { id: string; name: string; discount_text?: string }) => void
  qrOverlay: unknown; onCloseQr: () => void
}) {
  const innerConfig = useConfig()
  const variantNav = innerConfig.variant_nav || 'nav-bottom-bar'
  const navIsFloating = variantNav === 'nav-floating-island' || variantNav === 'nav-minimal-dots'

  // Swipe support (hooks must run before the single-page early return)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const navTabs = NAV_TABS
  const tabOrder: NavTab[] = navTabs.map(t => t.id)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    if (Math.abs(diff) < 50) return // too small
    const currentIdx = tabOrder.indexOf(activeTab)
    if (diff > 0 && currentIdx < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIdx + 1]) // swipe left → next tab
    } else if (diff < 0 && currentIdx > 0) {
      setActiveTab(tabOrder[currentIdx - 1]) // swipe right → prev tab
    }
  }, [activeTab, setActiveTab])

  if (isSinglePage) {
    return (
      <div className="pwa-root" style={{ width: '100%', minHeight: '100%', overflowY: 'auto', background: 'var(--color-bg)', containerType: 'inline-size' }}>
        <SinglePage
          shopName={shopName} logoUrl={logoUrl} bannerUrl={bannerUrl} city={city}
          address={address} openingTime={openingTime} closingTime={closingTime}
          currentStamps={currentStamps} totalRequired={totalRequired} rewardName={rewardName}
          streak={streak} totalVisits={totalVisits} totalRewards={totalRewards}
          lastVisits={lastVisits} memberSince={memberSince}
          campaigns={campaigns} menuItems={menuItems}
          customerName={customerName} customerPhone={customerPhone}
          totalStamps={totalStamps} onLogout={onLogout}
        />
      </div>
    )
  }

  return (
    <div className="pwa-root" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)', overflow: 'hidden', containerType: 'inline-size' }}>
      {/* Global animations */}
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes staggerIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .tab-content { animation: fadeIn 0.2s ease-out; }
        .card-animate { animation: fadeSlideIn 0.3s ease-out both; }
        .stagger-1 { animation: staggerIn 0.3s ease-out 0.05s both; }
        .stagger-2 { animation: staggerIn 0.3s ease-out 0.1s both; }
        .stagger-3 { animation: staggerIn 0.3s ease-out 0.15s both; }
        .stagger-4 { animation: staggerIn 0.3s ease-out 0.2s both; }
      `}</style>

      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ flex: 1, overflowY: 'auto', paddingBottom: isSinglePage ? 0 : navIsFloating ? 90 : 70, WebkitOverflowScrolling: 'touch', overscrollBehavior: 'none' }}
      >
        {activeTab === 'kartim' && (
          <div key="kartim" className="tab-content">
            <TabKartim
              shopName={shopName} logoUrl={logoUrl} bannerUrl={bannerUrl} city={city}
              currentStamps={currentStamps} totalRequired={totalRequired} rewardName={rewardName}
              streak={streak} longestStreak={longestStreak || 0} graceAvailable={graceAvailable || false}
              totalVisits={totalVisits} totalRewards={totalRewards}
              lastVisits={lastVisits} memberSince={memberSince}
              onStampPress={onStampPress}
              doubleStampExpiry={personalizedDeals?.find(d => d.type === 'goal_gradient')?.valid_until || null}
            />
          </div>
        )}
        {activeTab === 'magaza' && (
          <div key="magaza" className="tab-content">
            <TabMagaza
              orgSlug={orgSlug}
              shopName={shopName} logoUrl={logoUrl} bannerUrl={bannerUrl} city={city}
              address={address} openingTime={openingTime} closingTime={closingTime}
              personalizedDeals={personalizedDeals}
              campaigns={campaigns} menuItems={menuItems}
              activeChallenge={activeChallenge}
              onCampaignPress={onCampaignPress}
            />
          </div>
        )}
        {activeTab === 'profil' && (
          <div key="profil" className="tab-content">
            <TabProfil
              name={customerName} phone={customerPhone}
              totalVisits={totalVisits} totalStamps={totalStamps}
              totalRewards={totalRewards} longestStreak={longestStreak}
              completedChallenges={completedChallenges}
              onLogout={onLogout}
              onNotificationSettings={onNotificationSettings}
              onDeleteAccount={onDeleteAccount}
            />
          </div>
        )}
      </div>
      <Nav activeTab={activeTab} onTabChange={setActiveTab} shopName={shopName} tabs={navTabs} />
    </div>
  )
}

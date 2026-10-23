'use client'

import { useState, useEffect } from 'react'
import { ScopedTokenProvider } from '@/components/pwa-v2/token-provider'
import { PwaShell } from '@/components/pwa-v2/pwa-shell'
import { type PwaConfig, DEFAULT_CONFIG, CONFIG_OPTIONS } from '@/lib/pwa-tokens'
import { mapAnswersToVariants } from '@/lib/variant-mapper'
import { STAMP_VARIANTS, HEADER_VARIANTS, MENU_VARIANTS, SANA_OZEL_VARIANTS } from '@/components/pwa-v2/variant-renderer'
import { StampMinimal01 } from '@/components/pwa-v2/variants/stamp-minimal-01'
import { StampMinimal02 } from '@/components/pwa-v2/variants/stamp-minimal-02'
import { StampMinimal03 } from '@/components/pwa-v2/variants/stamp-minimal-03'
import { StampMinimal04 } from '@/components/pwa-v2/variants/stamp-minimal-04'
import { StampRealistic01 } from '@/components/pwa-v2/variants/stamp-realistic-01'
import { StampRealistic02 } from '@/components/pwa-v2/variants/stamp-realistic-02'
import { StampRealistic03 } from '@/components/pwa-v2/variants/stamp-realistic-03'
import { StampPlayful01 } from '@/components/pwa-v2/variants/stamp-playful-01'
import { StampPlayful02 } from '@/components/pwa-v2/variants/stamp-playful-02'
import { StampPlayful03 } from '@/components/pwa-v2/variants/stamp-playful-03'
import { StampGoldCard } from '@/components/pwa-v2/variants/stamp-gold-card'
import { StampCoffeeCup } from '@/components/pwa-v2/variants/stamp-coffee-cup'
import { StampNeonGlow } from '@/components/pwa-v2/variants/stamp-neon-glow'

import { StampPassport } from '@/components/pwa-v2/variants/stamp-passport'
import { HeaderPhoto01 } from '@/components/pwa-v2/variants/header-photo-01'
import { HeaderPhoto02 } from '@/components/pwa-v2/variants/header-photo-02'
import { HeaderPhoto03 } from '@/components/pwa-v2/variants/header-photo-03'
import { HeaderLogo01 } from '@/components/pwa-v2/variants/header-logo-01'
import { HeaderLogo02 } from '@/components/pwa-v2/variants/header-logo-02'
import { HeaderLogo03 } from '@/components/pwa-v2/variants/header-logo-03'
import { HeaderMinimal01 } from '@/components/pwa-v2/variants/header-minimal-01'
import { HeaderMinimal02 } from '@/components/pwa-v2/variants/header-minimal-02'
import { HeaderGradient01 } from '@/components/pwa-v2/variants/header-gradient-01'
import { HeaderGradient02 } from '@/components/pwa-v2/variants/header-gradient-02'
import { MenuCompactList } from '@/components/pwa-v2/variants/menu-compact-list'
import { MenuPhotoCards } from '@/components/pwa-v2/variants/menu-photo-cards'

import { MenuCategorySections } from '@/components/pwa-v2/variants/menu-category-sections'
import { MenuMinimalRows } from '@/components/pwa-v2/variants/menu-minimal-rows'
import { MenuFeaturedHero } from '@/components/pwa-v2/variants/menu-featured-hero'
import { MenuPillTags } from '@/components/pwa-v2/variants/menu-pill-tags'
import { MenuNumberedList } from '@/components/pwa-v2/variants/menu-numbered-list'
import { MenuSplitPrice } from '@/components/pwa-v2/variants/menu-split-price'
import { MenuIconRows } from '@/components/pwa-v2/variants/menu-icon-rows'
import { CampaignBanner01 } from '@/components/pwa-v2/variants/campaign-banner-01'
import { CampaignBanner02 } from '@/components/pwa-v2/variants/campaign-banner-02'

import { CampaignCard01 } from '@/components/pwa-v2/variants/campaign-card-01'
import { CampaignInline01 } from '@/components/pwa-v2/variants/campaign-inline-01'

import { CampaignCountdown01 } from '@/components/pwa-v2/variants/campaign-countdown-01'
import { CampaignSplit01 } from '@/components/pwa-v2/variants/campaign-split-01'
import { CampaignNeon01 } from '@/components/pwa-v2/variants/campaign-neon-01'
import { CampaignTicket01 } from '@/components/pwa-v2/variants/campaign-ticket-01'
import { CampaignFullbleed01 } from '@/components/pwa-v2/variants/campaign-fullbleed-01'
import { CampaignMosaic01 } from '@/components/pwa-v2/variants/campaign-mosaic-01'
import { SanaOzel01 } from '@/components/pwa-v2/variants/sana-ozel-01'
import { SanaOzel02 } from '@/components/pwa-v2/variants/sana-ozel-02'
import { SanaOzel03 } from '@/components/pwa-v2/variants/sana-ozel-03'
import { SanaOzel04 } from '@/components/pwa-v2/variants/sana-ozel-04'
import { SanaOzel05 } from '@/components/pwa-v2/variants/sana-ozel-05'
import { SanaOzel06 } from '@/components/pwa-v2/variants/sana-ozel-06'
import { SanaOzel07 } from '@/components/pwa-v2/variants/sana-ozel-07'
import { SanaOzel08 } from '@/components/pwa-v2/variants/sana-ozel-08'
import { SanaOzel09 } from '@/components/pwa-v2/variants/sana-ozel-09'
import { SanaOzel10 } from '@/components/pwa-v2/variants/sana-ozel-10'
import { MenuStackedImages } from '@/components/pwa-v2/variants/menu-stacked-images'
import { MenuCollapsible } from '@/components/pwa-v2/variants/menu-collapsible'
import { MenuPhotoGridLarge } from '@/components/pwa-v2/variants/menu-photo-grid-large'
import { MenuPhotoRows } from '@/components/pwa-v2/variants/menu-photo-rows'
import { MenuPhotoMosaic } from '@/components/pwa-v2/variants/menu-photo-mosaic'
import { ProfileCard01 } from '@/components/pwa-v2/variants/profile-card-01'
import { ProfileMinimal01 } from '@/components/pwa-v2/variants/profile-minimal-01'
import { ProfileHero01 } from '@/components/pwa-v2/variants/profile-hero-01'
import { ProfileSplit01 } from '@/components/pwa-v2/variants/profile-split-01'
import { NavBottomBar } from '@/components/pwa-v2/variants/nav-bottom-bar'
import { NavFloatingIsland } from '@/components/pwa-v2/variants/nav-floating-island'

import { ChallengeCard01 } from '@/components/pwa-v2/variants/challenge-card-01'
import { ChallengeBanner01 } from '@/components/pwa-v2/variants/challenge-banner-01'
import { ChallengeTicket01 } from '@/components/pwa-v2/variants/challenge-ticket-01'
import { ChallengeGlass01 } from '@/components/pwa-v2/variants/challenge-glass-01'
import { ChallengeMinimal01 } from '@/components/pwa-v2/variants/challenge-minimal-01'
import { ActivityTimeline01 } from '@/components/pwa-v2/variants/activity-timeline-01'
import { ActivityCompact01 } from '@/components/pwa-v2/variants/activity-compact-01'
import { ActivityStreak01 } from '@/components/pwa-v2/variants/activity-streak-01'
import { ActivityMinimal01 } from '@/components/pwa-v2/variants/activity-minimal-01'
import { ActivityAchievement01 } from '@/components/pwa-v2/variants/activity-achievement-01'
import { NavMinimalDots } from '@/components/pwa-v2/variants/nav-minimal-dots'
import { NavTabPills } from '@/components/pwa-v2/variants/nav-tab-pills'

// === Designkit explore wave — new variants for the gallery section ===
// Stamp v2 reworks (12 — minimal-03/04 v2 removed as too-close-to-original)
import { StampMinimal01V2 } from '@/components/pwa-v2/variants/stamp-minimal-01-v2'
import { StampMinimal02V2 } from '@/components/pwa-v2/variants/stamp-minimal-02-v2'
import { StampRealistic01V2 } from '@/components/pwa-v2/variants/stamp-realistic-01-v2'
import { StampRealistic03V2 } from '@/components/pwa-v2/variants/stamp-realistic-03-v2'
import { StampPlayful01V2 } from '@/components/pwa-v2/variants/stamp-playful-01-v2'
import { StampPlayful02V2 } from '@/components/pwa-v2/variants/stamp-playful-02-v2'
import { StampPlayful03V2 } from '@/components/pwa-v2/variants/stamp-playful-03-v2'
import { StampCoffeeCupV2 } from '@/components/pwa-v2/variants/stamp-coffee-cup-v2'
import { StampNeonGlowV2 } from '@/components/pwa-v2/variants/stamp-neon-glow-v2'
import { StampPassportV2 } from '@/components/pwa-v2/variants/stamp-passport-v2'
// Header v2 reworks (4 — photo trio + gradient hero) + creative (6 — atmosphere/sky removed)
import { HeaderMarquee } from '@/components/pwa-v2/variants/header-marquee'
import { HeaderStampCrown } from '@/components/pwa-v2/variants/header-stamp-crown'
import { HeaderLiquid } from '@/components/pwa-v2/variants/header-liquid'
import { HeaderVertical } from '@/components/pwa-v2/variants/header-vertical'
// Menu (8 net new)
import { MenuDayDrift } from '@/components/pwa-v2/variants/menu-day-drift'
import { MenuStoryStream } from '@/components/pwa-v2/variants/menu-story-stream'
import { MenuSwipeStack } from '@/components/pwa-v2/variants/menu-swipe-stack'
import { MenuMosaicWall } from '@/components/pwa-v2/variants/menu-mosaic-wall'
import { MenuConversation } from '@/components/pwa-v2/variants/menu-conversation'
import { MenuCarouselTrays } from '@/components/pwa-v2/variants/menu-carousel-trays'
import { MenuMagazineSpread } from '@/components/pwa-v2/variants/menu-magazine-spread'
// Challenges (5 net new)
import { ChallengeXpBar } from '@/components/pwa-v2/variants/challenge-xp-bar'
import { ChallengeStepMap } from '@/components/pwa-v2/variants/challenge-step-map'
import { ChallengeCalendarGrid } from '@/components/pwa-v2/variants/challenge-calendar-grid'
import { ChallengeHabitTracker } from '@/components/pwa-v2/variants/challenge-habit-tracker'
import { ChallengeCountdownCoin } from '@/components/pwa-v2/variants/challenge-countdown-coin'
// Campaigns (3 net new)
import { CampaignFrontPage } from '@/components/pwa-v2/variants/campaign-front-page'
import { CampaignCouponStack } from '@/components/pwa-v2/variants/campaign-coupon-stack'
import { CampaignProductShowcase } from '@/components/pwa-v2/variants/campaign-product-showcase'
// Sana Özel (8 net new)
import { SanaOzelRevealScratch } from '@/components/pwa-v2/variants/sana-ozel-reveal-scratch'
import { SanaOzelWhyYou } from '@/components/pwa-v2/variants/sana-ozel-why-you'
import { SanaOzelCountdown } from '@/components/pwa-v2/variants/sana-ozel-countdown'
import { SanaOzelStack } from '@/components/pwa-v2/variants/sana-ozel-stack'
import { SanaOzelSpotlight } from '@/components/pwa-v2/variants/sana-ozel-spotlight'
import { SanaOzelConversation } from '@/components/pwa-v2/variants/sana-ozel-conversation'
import { SanaOzelTimeline } from '@/components/pwa-v2/variants/sana-ozel-timeline'
import { SanaOzelGift } from '@/components/pwa-v2/variants/sana-ozel-gift'

const MOCK_STAMP = { current: 4, total: 10, rewardName: 'Bedava Kahve' }
const MOCK_HEADER = { shopName: 'Kahve Dukkani', logoUrl: null, bannerUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=300&fit=crop', city: 'Istanbul, Kadikoy' }
const MOCK_PROFILE = { name: 'Ayse Yilmaz', phone: '+90 532 *** ** 48', totalVisits: 23, totalStamps: 4, totalRewards: 2, onLogout: () => {} }
const MOCK_ACTIVITY = {
  streak: 3,
  totalVisits: 23,
  totalRewards: 2,
  lastVisits: [
    { date: 'Bugun 09:15', location: 'Kadikoy Sube' },
    { date: 'Dun 14:30', location: 'Kadikoy Sube' },
    { date: '19 Mart 11:00', location: 'Besiktas Sube' },
    { date: '17 Mart 09:45', location: 'Kadikoy Sube' },
  ],
  memberSince: 'Mart 2026',
}
const MOCK_CAMPAIGNS = { campaigns: [
  { id: '1', name: 'americano %20 indirim', description: 'Arin, 14:00-16:00 arasi americano\'da %20 indirim. Kahve Dukkani\'nda seni bekliyoruz.', discount_text: 'americano %20 indirim', valid_until: new Date(Date.now() + 2 * 3600000).toISOString(), type: 'dead_hour_targeted' },
  { id: '2', name: 'Seni ozledik! %15 indirim', description: 'Bir cappuccino molasi ne dersin? Tum siparisinde %15 indirim.', discount_text: '%15 indirim', valid_until: new Date(Date.now() + 7 * 86400000).toISOString(), type: 'reengagement' },
  { id: '3', name: 'Sana ozel %30 indirim', description: 'Sana ozel %30 indirim. Seni bekliyoruz.', discount_text: '%30 indirim', valid_until: new Date(Date.now() + 14 * 86400000).toISOString(), type: 'hero_offer' },
] }
const MOCK_CHALLENGE = {
  title: 'Yeni bir sey dene!',
  description: 'Bu hafta 2 farkli icecek dene, bonus puan kazan!',
  targetCount: 2,
  currentCount: 1,
  daysRemaining: 5,
  expiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
  rewardValue: 1,
  rewardType: 'bonus_stamp',
}
const MOCK_CHALLENGE_EMPTY = {
  title: '',
  description: '',
  targetCount: 0,
  currentCount: 0,
  daysRemaining: 0,
  rewardValue: 0,
  rewardType: 'bonus_stamp',
  isEmpty: true,
}
const MOCK_MENU = { items: [
  { id: '1', name: 'Latte', price: 70, category: 'Sicak Icecekler' },
  { id: '2', name: 'Cold Brew', price: 85, category: 'Soguk Icecekler' },
  { id: '3', name: 'Americano', price: 55, category: 'Sicak Icecekler' },
  { id: '4', name: 'Mocha', price: 80, category: 'Sicak Icecekler' },
  { id: '5', name: 'Cheesecake', price: 95, category: 'Tatlilar' },
  { id: '6', name: 'Croissant', price: 45, category: 'Tatlilar' },
] }

export default function PreviewPage() {
  const [mounted, setMounted] = useState(false)
  const [config, setConfig] = useState<PwaConfig>(DEFAULT_CONFIG)
  const [extractUrl, setExtractUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractResult, setExtractResult] = useState<{ config: Record<string, unknown>; confidence: Record<string, number>; raw: Record<string, unknown> } | null>(null)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [extractedName, setExtractedName] = useState('')

  useEffect(() => { setMounted(true) }, [])

  // Update a field and re-run variant mapper
  const update = <K extends keyof PwaConfig>(key: K, value: PwaConfig[K]) => {
    setConfig(prev => {
      const updated = { ...prev, [key]: value }
      // Re-run variant mapper when design-affecting fields change
      const designFields: (keyof PwaConfig)[] = ['shop_style', 'stamp_feel', 'has_product_photos', 'layout', 'logo_url', 'banner_url']
      if (designFields.includes(key)) {
        const variants = mapAnswersToVariants(updated)
        return { ...updated, ...variants }
      }
      return updated
    })
  }

  async function handleExtract() {
    if (!extractUrl.trim()) return
    setExtracting(true)
    setExtractError(null)
    setExtractResult(null)
    try {
      const res = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extractUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        setExtractResult({ config: data.config || {}, confidence: data.confidence || {}, raw: data.raw || {} })
        const c = data.config || {}

        // Build full config from extraction
        const extracted: Partial<PwaConfig> = {
          ...(c.brand_color && { brand_color: c.brand_color }),
          ...(c.shop_style && { shop_style: c.shop_style }),
          ...(c.shape && { shape: c.shape }),
          ...(c.stamp_feel && { stamp_feel: c.stamp_feel }),
          ...(c.font_personality && { font_personality: c.font_personality }),
          ...(c.density && { density: c.density }),
          ...(c.language && { language: c.language }),
          ...(c.layout && { layout: c.layout }),
          ...(typeof c.has_product_photos === 'boolean' && { has_product_photos: c.has_product_photos }),
          ...(c.logo_url && { logo_url: c.logo_url }),
          ...(c.banner_url && { banner_url: c.banner_url }),
          ...(c._layout_hints && { _layout_hints: c._layout_hints }),
        }

        // Merge with defaults, then run variant mapper (exactly like onboarding save)
        const merged = { ...DEFAULT_CONFIG, ...extracted }
        const variants = mapAnswersToVariants(merged)
        const finalConfig = { ...merged, ...variants }

        setConfig(finalConfig)
        if (c.name) setExtractedName(c.name)
      } else {
        const err = await res.json().catch(() => ({ error: 'Failed' }))
        setExtractError(err.error || 'Extraction failed')
      }
    } catch {
      setExtractError('Connection error')
    }
    setExtracting(false)
  }

  if (!mounted) return null

  return (
    <div style={{ minHeight: '100vh', background: '#09090b', color: 'white', fontFamily: 'Inter, sans-serif' }}>
      {/* Controls bar */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#18181b', borderBottom: '1px solid #27272a', padding: '12px 20px' }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#a1a1aa' }}>PWA v2 — Component Preview Gallery</h1>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Brand Color */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: '#71717a' }}>Renk</span>
            <input type="color" value={config.brand_color} onChange={e => update('brand_color', e.target.value)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #3f3f46', cursor: 'pointer' }} />
          </label>

          {/* Color Mode */}
          <ControlGroup label="Mod" options={CONFIG_OPTIONS.color_mode} value={config.color_mode} onChange={v => update('color_mode', v)} />

          {/* Shape */}
          <ControlGroup label="Sekil" options={CONFIG_OPTIONS.shape} value={config.shape} onChange={v => update('shape', v)} />

          {/* Shop Style */}
          <ControlGroup label="Stil" options={CONFIG_OPTIONS.shop_style} value={config.shop_style} onChange={v => update('shop_style', v)} />

          {/* Font */}
          <ControlGroup label="Font" options={CONFIG_OPTIONS.font_personality} value={config.font_personality} onChange={v => update('font_personality', v)} />

          {/* Density */}
          <ControlGroup label="Yogunluk" options={CONFIG_OPTIONS.density} value={config.density} onChange={v => update('density', v)} />
        </div>

        {/* === Variant pickers — pulls every registered variant ID directly from variant-renderer === */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, paddingTop: 12, borderTop: '1px solid #27272a' }}>
          <VariantPicker label="Stamp" value={config.variant_stamp || ''} options={Object.keys(STAMP_VARIANTS)} onChange={v => update('variant_stamp', v)} />
          <VariantPicker label="Header" value={config.variant_header || ''} options={Object.keys(HEADER_VARIANTS)} onChange={v => update('variant_header', v)} />
          <VariantPicker label="Menu" value={config.variant_menu || ''} options={Object.keys(MENU_VARIANTS)} onChange={v => update('variant_menu', v)} />
          <VariantPicker label="Sana Özel" value={config.variant_sana_ozel || ''} options={Object.keys(SANA_OZEL_VARIANTS)} onChange={v => update('variant_sana_ozel', v)} />
        </div>
      </div>

      {/* === URL EXTRACTION TESTER === */}
      <div style={{ padding: '24px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e4e4e7', marginBottom: 4 }}>Website Extraction Tester</h2>
          <p style={{ fontSize: 12, color: '#71717a', marginBottom: 16 }}>Paste a URL — Playwright renders the page and extracts design tokens</p>

          {/* URL Input */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={extractUrl}
              onChange={e => setExtractUrl(e.target.value)}
              placeholder="ornek: starbucks.com.tr"
              onKeyDown={e => e.key === 'Enter' && handleExtract()}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 8, background: '#18181b', border: '1px solid #27272a', color: 'white', fontSize: 14, outline: 'none' }}
            />
            <button
              onClick={handleExtract}
              disabled={extracting || !extractUrl.trim()}
              style={{ padding: '10px 20px', borderRadius: 8, background: extracting ? '#27272a' : '#d97706', color: 'white', fontSize: 13, fontWeight: 600, border: 'none', cursor: extracting ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
            >
              {extracting ? 'Analiz ediliyor...' : 'Analiz Et'}
            </button>
          </div>

          {extractError && <p style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{extractError}</p>}

          {extractResult && (
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {/* Left: Extracted fields with confidence */}
              <div style={{ flex: 1, minWidth: 300 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', marginBottom: 12 }}>Extracted Fields</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {([
                    { key: 'brand_color', label: 'Marka Rengi' },
                    { key: 'shop_style', label: 'Mekan Tarzi' },
                    { key: 'shape', label: 'Sekil' },
                    { key: 'font_personality', label: 'Font' },
                    { key: 'density', label: 'Yogunluk' },
                    { key: 'stamp_feel', label: 'Kart Stili' },
                    { key: 'language', label: 'Dil' },
                    { key: 'layout', label: 'Yapi' },
                    { key: 'has_product_photos', label: 'Urun Foto' },
                    { key: 'logo_url', label: 'Logo' },
                    { key: 'banner_url', label: 'Banner' },
                  ] as const).map(field => {
                    const value = extractResult.config[field.key]
                    const conf = extractResult.confidence[field.key] as number || 0
                    const detected = value !== undefined && value !== null
                    return (
                      <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 6, background: '#18181b', border: '1px solid #27272a' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: detected ? (conf > 0.7 ? '#22c55e' : '#eab308') : '#ef4444', flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: '#71717a', width: 90, flexShrink: 0 }}>{field.label}</span>
                        <span style={{ fontSize: 12, color: detected ? '#e4e4e7' : '#52525b', flex: 1 }}>
                          {detected ? String(value) : 'Algılanamadı'}
                        </span>
                        {detected && <span style={{ fontSize: 10, color: conf > 0.7 ? '#22c55e' : '#eab308' }}>{Math.round(conf * 100)}%</span>}
                      </div>
                    )
                  })}
                </div>

                {/* Manual controls for low confidence / missing fields */}
                <p style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', marginTop: 20, marginBottom: 12 }}>Ayarla / Degistir</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#71717a', width: 70, flexShrink: 0 }}>Renk</span>
                    <input type="color" value={config.brand_color} onChange={e => update('brand_color', e.target.value)} style={{ width: 28, height: 28, borderRadius: 4, border: '1px solid #27272a', cursor: 'pointer' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#71717a', width: 70, flexShrink: 0 }}>Tarzi</span>
                    {(['premium', 'craft', 'cozy', 'modern'] as const).map(s => (
                      <button key={s} onClick={() => update('shop_style', s)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', fontSize: 10, cursor: 'pointer', background: config.shop_style === s ? '#d97706' : '#27272a', color: config.shop_style === s ? 'white' : '#a1a1aa' }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#71717a', width: 70, flexShrink: 0 }}>Sekil</span>
                    {(['round', 'smooth'] as const).map(s => (
                      <button key={s} onClick={() => update('shape', s)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', fontSize: 10, cursor: 'pointer', background: config.shape === s ? '#d97706' : '#27272a', color: config.shape === s ? 'white' : '#a1a1aa' }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#71717a', width: 70, flexShrink: 0 }}>Font</span>
                    {(['traditional', 'clean', 'bold'] as const).map(s => (
                      <button key={s} onClick={() => update('font_personality', s)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', fontSize: 10, cursor: 'pointer', background: config.font_personality === s ? '#d97706' : '#27272a', color: config.font_personality === s ? 'white' : '#a1a1aa' }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#71717a', width: 70, flexShrink: 0 }}>Kart</span>
                    {(['realistic', 'minimal', 'playful'] as const).map(s => (
                      <button key={s} onClick={() => update('stamp_feel', s)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', fontSize: 10, cursor: 'pointer', background: config.stamp_feel === s ? '#d97706' : '#27272a', color: config.stamp_feel === s ? 'white' : '#a1a1aa' }}>{s}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: '#71717a', width: 70, flexShrink: 0 }}>Yapi</span>
                    {(['tabs', 'single-page'] as const).map(s => (
                      <button key={s} onClick={() => update('layout', s)} style={{ padding: '3px 8px', borderRadius: 4, border: 'none', fontSize: 10, cursor: 'pointer', background: config.layout === s ? '#d97706' : '#27272a', color: config.layout === s ? 'white' : '#a1a1aa' }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Live phone preview with extracted config */}
              <div style={{ flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#a1a1aa', marginBottom: 12 }}>Canli Onizleme</p>
                <div style={{
                  width: 280,
                  height: 560,
                  borderRadius: 32,
                  border: '3px solid #27272a',
                  overflow: 'hidden',
                  position: 'relative',
                }}>
                  <style>{`
                    .extract-preview nav { position: absolute !important; }
                    .extract-preview *::-webkit-scrollbar { display: none; }
                    .extract-preview * { scrollbar-width: none; }
                  `}</style>
                  <ScopedTokenProvider
                    config={config}
                    className="extract-preview"
                    style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
                  >
                    <PwaShell
                      shopName={extractedName || 'Kafe Adi'}
                      logoUrl={extractResult.config.logo_url as string || null}
                      bannerUrl={extractResult.config.banner_url as string || null}
                      city="Istanbul"
                      customerId="preview"
                      customerName="Ayse Yilmaz"
                      customerPhone="+90 532 *** ** 48"
                      currentStamps={4}
                      totalRequired={10}
                      rewardName="Bedava Kahve"
                      streak={2}
                      totalVisits={15}
                      totalStamps={4}
                      totalRewards={1}
                      lastVisits={[
                        { date: 'Bugun 09:15', location: 'Kadikoy' },
                        { date: 'Dun 14:30', location: 'Kadikoy' },
                      ]}
                      memberSince="Mart 2026"
                      campaigns={[
                        { id: '1', name: 'Ölü Saat', description: '14-16 arasi', discount_text: '%25' },
                      ]}
                      menuItems={[
                        { id: '1', name: 'Latte', price: 70, category: 'Sicak' },
                        { id: '2', name: 'Cold Brew', price: 85, category: 'Soguk' },
                        { id: '3', name: 'Americano', price: 55, category: 'Sicak' },
                        { id: '4', name: 'Cheesecake', price: 95, category: 'Tatli' },
                      ]}
                      onLogout={() => {}}
                    />
                  </ScopedTokenProvider>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: '#27272a', margin: '20px 0 32px' }} />

      {/* === FULL PWA PREVIEW — Claude's personal picks === */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#e4e4e7', marginBottom: 4 }}>Full PWA Preview</h2>
          <p style={{ fontSize: 12, color: '#71717a', marginBottom: 16 }}>Claude&apos;s picks: premium + soft + traditional + balanced + blue brand</p>

          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {/* Phone frame */}
            <div style={{
              width: 320,
              height: 640,
              borderRadius: 32,
              border: '4px solid #27272a',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
            }}>
              {/* Override fixed positioning + hide scrollbar in phone frame */}
              <style>{`
                .phone-preview nav { position: absolute !important; }
                .phone-preview > div > div { height: 100% !important; max-height: 640px !important; }
                .phone-preview *::-webkit-scrollbar { display: none; }
                .phone-preview * { scrollbar-width: none; }
              `}</style>

              <ScopedTokenProvider
                config={{
                  ...config,
                  shop_style: 'premium',
                  shape: 'smooth',
                  brand_color: '#2563eb',
                  font_personality: 'traditional',
                  density: 'balanced',
                  stamp_feel: 'realistic',
                  layout: 'tabs',
                  variant_stamp: 'stamp-gold-card',
                  variant_activity: 'activity-achievement-01',
                  variant_header: 'header-photo-01',
                  variant_menu: 'menu-numbered-list',
                  variant_campaign: 'campaign-ticket-01',
                  variant_profile: 'profile-split-01',
                  variant_nav: 'nav-tab-pills',
                }}
                className="phone-preview"
                style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
              >
                <PwaShell
                  shopName="Mavi Fincan"
                  logoUrl={null}
                  bannerUrl="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=300&fit=crop"
                  city="Istanbul, Kadikoy"
                  address="Moda Caddesi No:42"
                  openingTime="08:00"
                  closingTime="22:00"
                  customerId="preview"
                  customerName="Ayse Yilmaz"
                  customerPhone="+90 532 *** ** 48"
                  currentStamps={7}
                  totalRequired={10}
                  rewardName="Bedava Kahve"
                  streak={3}
                  totalVisits={47}
                  totalStamps={7}
                  totalRewards={4}
                  lastVisits={[
                    { date: 'Bugun 09:15', location: 'Kadikoy Sube' },
                    { date: 'Dun 14:30', location: 'Kadikoy Sube' },
                    { date: '19 Mart 11:00', location: 'Besiktas Sube' },
                    { date: '17 Mart 09:45', location: 'Kadikoy Sube' },
                  ]}
                  memberSince="Ocak 2026"
                  campaigns={[
                    { id: '1', name: 'Ölü Saat Fırsatı', description: '14:00-16:00 arasi', discount_text: '%25', valid_until: '30.04.2026' },
                    { id: '2', name: 'Yeni Üye Hediyesi', description: 'İlk kahven bizden', discount_text: 'Bedava', valid_until: '31.03.2026' },
                  ]}
                  menuItems={[
                    { id: '1', name: 'Latte', price: 70, category: 'Sicak' },
                    { id: '2', name: 'Cold Brew', price: 85, category: 'Soguk' },
                    { id: '3', name: 'Americano', price: 55, category: 'Sicak' },
                    { id: '4', name: 'Mocha', price: 80, category: 'Sicak' },
                    { id: '5', name: 'Cheesecake', price: 95, category: 'Tatli' },
                  ]}
                  onLogout={() => {}}
                />
              </ScopedTokenProvider>
            </div>

            {/* iPhone 14 Pro frame */}
            <div style={{
              width: 280,
              height: 607,
              borderRadius: 40,
              border: '3px solid #1a1a1a',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative',
              background: '#000',
            }}>
              {/* Dynamic Island */}
              <div style={{
                position: 'absolute',
                top: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 84,
                height: 24,
                borderRadius: 20,
                background: '#000',
                zIndex: 100,
              }} />
              {/* Status bar */}
              <div style={{
                position: 'absolute',
                top: 6,
                left: 20,
                right: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 99,
                pointerEvents: 'none',
              }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: 'white' }}>9:41</span>
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  <svg width="12" height="9" viewBox="0 0 16 12" fill="white"><path d="M1 8.5h2v3H1zM5 6h2v5.5H5zM9 3.5h2v8H9zM13 1h2v10.5h-2z"/></svg>
                  <svg width="11" height="9" viewBox="0 0 15 12" fill="white"><path d="M7.5 3.5A5.5 5.5 0 0 1 13 7l1.5-1.5A7.5 7.5 0 0 0 7.5 1.5 7.5 7.5 0 0 0 .5 5.5L2 7a5.5 5.5 0 0 1 5.5-3.5z"/><path d="M7.5 6.5A3 3 0 0 1 10.5 8l1.5-1.5A5 5 0 0 0 7.5 4.5 5 5 0 0 0 3 6.5L4.5 8a3 3 0 0 1 3-1.5z"/><circle cx="7.5" cy="10" r="1.5"/></svg>
                  <svg width="18" height="9" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2" stroke="white" strokeWidth="1"/><rect x="22.5" y="3.5" width="2" height="5" rx="1" fill="white" opacity="0.4"/><rect x="2" y="2" width="14" height="8" rx="1" fill="white"/></svg>
                </div>
              </div>
              {/* Home indicator */}
              <div style={{
                position: 'absolute',
                bottom: 6,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 96,
                height: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.3)',
                zIndex: 100,
              }} />
              {/* App content */}
              <style>{`
                .iphone-preview nav { position: absolute !important; }
                .iphone-preview *::-webkit-scrollbar { display: none; }
                .iphone-preview * { scrollbar-width: none; }
              `}</style>
              <ScopedTokenProvider
                config={{
                  ...config,
                  shop_style: 'premium',
                  shape: 'smooth',
                  brand_color: '#2563eb',
                  font_personality: 'traditional',
                  density: 'balanced',
                  stamp_feel: 'realistic',
                  layout: 'tabs',
                  variant_stamp: 'stamp-gold-card',
                  variant_activity: 'activity-achievement-01',
                  variant_header: 'header-photo-01',
                  variant_menu: 'menu-numbered-list',
                  variant_campaign: 'campaign-ticket-01',
                  variant_profile: 'profile-split-01',
                  variant_nav: 'nav-tab-pills',
                }}
                className="iphone-preview"
                style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative', borderRadius: 37 }}
              >
                <PwaShell
                  shopName="Mavi Fincan"
                  logoUrl={null}
                  bannerUrl="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=300&fit=crop"
                  city="Istanbul, Kadikoy"
                  address="Moda Caddesi No:42"
                  openingTime="08:00"
                  closingTime="22:00"
                  customerId="preview"
                  customerName="Ayse Yilmaz"
                  customerPhone="+90 532 *** ** 48"
                  currentStamps={7}
                  totalRequired={10}
                  rewardName="Bedava Kahve"
                  streak={3}
                  totalVisits={47}
                  totalStamps={7}
                  totalRewards={4}
                  lastVisits={[
                    { date: 'Bugun 09:15', location: 'Kadikoy Sube' },
                    { date: 'Dun 14:30', location: 'Kadikoy Sube' },
                    { date: '19 Mart 11:00', location: 'Besiktas Sube' },
                    { date: '17 Mart 09:45', location: 'Kadikoy Sube' },
                  ]}
                  memberSince="Ocak 2026"
                  campaigns={[
                    { id: '1', name: 'Ölü Saat Fırsatı', description: '14:00-16:00 arasi', discount_text: '%25', valid_until: '30.04.2026' },
                    { id: '2', name: 'Yeni Üye Hediyesi', description: 'İlk kahven bizden', discount_text: 'Bedava', valid_until: '31.03.2026' },
                  ]}
                  menuItems={[
                    { id: '1', name: 'Latte', price: 70, category: 'Sicak' },
                    { id: '2', name: 'Cold Brew', price: 85, category: 'Soguk' },
                    { id: '3', name: 'Americano', price: 55, category: 'Sicak' },
                    { id: '4', name: 'Mocha', price: 80, category: 'Sicak' },
                    { id: '5', name: 'Cheesecake', price: 95, category: 'Tatli' },
                  ]}
                  onLogout={() => {}}
                />
              </ScopedTokenProvider>
            </div>

            {/* My picks explanation */}
            <div style={{ maxWidth: 280, fontSize: 12, color: '#a1a1aa' }}>
              <p style={{ fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>Seçimlerim:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <PickRow label="Stil" value="Premium" />
                <PickRow label="Sekil" value="Soft (12px radius)" />
                <PickRow label="Renk" value="#2563eb (mavi)" />
                <PickRow label="Font" value="Traditional (Playfair)" />
                <PickRow label="Yogunluk" value="Balanced" />
                <PickRow label="Kart" value="Gold Card" />
                <PickRow label="Aktivite" value="Achievement badges" />
                <PickRow label="Header" value="Photo bottom-aligned" />
                <PickRow label="Menu" value="Numbered editorial" />
                <PickRow label="Kampanya" value="Ticket coupon" />
                <PickRow label="Profil" value="Split layout" />
                <PickRow label="Nav" value="Tab pills" />
              </div>
              <p style={{ marginTop: 12, fontSize: 11, color: '#52525b' }}>
                Tap the tabs in the phone to switch between Kartim, Magaza, and Profil.
              </p>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: '#27272a', margin: '20px 0 32px' }} />
      </div>

      {/* Variant sections */}
      <div style={{ padding: '0 20px 24px', maxWidth: 1200, margin: '0 auto' }}>

        {/* === STAMP CARDS === */}
        <SectionTitle title="Puan Kartlari" count={24} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="stamp-minimal-01" label="Minimal — Classic grid" config={config}>
            <StampMinimal01 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-minimal-02" label="Minimal — Vertical bars" config={config}>
            <StampMinimal02 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-minimal-03" label="Minimal — Dot row + line" config={config}>
            <StampMinimal03 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-minimal-04" label="Minimal — Segmented bar" config={config}>
            <StampMinimal04 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-realistic-01" label="Realistic — Embossed" config={config}>
            <StampRealistic01 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-realistic-02" label="Realistic — Punch card" config={config}>
            <StampRealistic02 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-realistic-03" label="Realistic — Split card" config={config}>
            <StampRealistic03 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-playful-01" label="Playful — Bouncy cups" config={config}>
            <StampPlayful01 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-playful-02" label="Playful — Scroll strip" config={config}>
            <StampPlayful02 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-playful-03" label="Playful — Step nodes" config={config}>
            <StampPlayful03 {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-gold-card" label="Gold — Premium credit card" config={config}>
            <StampGoldCard {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-coffee-cup" label="Coffee Cup — Filling up" config={config}>
            <StampCoffeeCup {...MOCK_STAMP} />
          </VariantCard>
          <VariantCard name="stamp-neon-glow" label="Neon — Glow outlines" config={config}>
            <StampNeonGlow {...MOCK_STAMP} />
          </VariantCard>

          <VariantCard name="stamp-passport" label="Passport — Date stamps" config={config}>
            <StampPassport {...MOCK_STAMP} />
          </VariantCard>
          {/* === Designkit v2 reworks === */}
          <VariantCard name="stamp-minimal-01-v2" label="v2 — Minimal hero number" config={config}><StampMinimal01V2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-minimal-02-v2" label="v2 — Giant brand number" config={config}><StampMinimal02V2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-realistic-01-v2" label="v2 — Letterpress paper" config={config}><StampRealistic01V2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-realistic-03-v2" label="v2 — Wax-seal almanac" config={config}><StampRealistic03V2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-playful-01-v2" label="v2 — 3D bouncy circles" config={config}><StampPlayful01V2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-playful-02-v2" label="v2 — Sticker book" config={config}><StampPlayful02V2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-playful-03-v2" label="v2 — Confetti hero" config={config}><StampPlayful03V2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-coffee-cup-v2" label="v2 — Filling cup + steam" config={config}><StampCoffeeCupV2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-neon-glow-v2" label="v2 — Open Late neon" config={config}><StampNeonGlowV2 {...MOCK_STAMP} /></VariantCard>
          <VariantCard name="stamp-passport-v2" label="v2 — Travel passport" config={config}><StampPassportV2 {...MOCK_STAMP} /></VariantCard>
        </div>

        {/* Placeholder sections for future variants */}
        <SectionTitle title="Header" count={14} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="header-photo-01" label="Photo — Bottom aligned" config={config}>
            <HeaderPhoto01 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-photo-02" label="Photo — Centered overlay" config={config}>
            <HeaderPhoto02 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-photo-03" label="Photo — Split layout" config={config}>
            <HeaderPhoto03 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-logo-01" label="Logo — Compact row" config={config}>
            <HeaderLogo01 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-logo-02" label="Logo — Large centered" config={config}>
            <HeaderLogo02 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-logo-03" label="Logo — Pill + underline" config={config}>
            <HeaderLogo03 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-minimal-01" label="Minimal — Monogram" config={config}>
            <HeaderMinimal01 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-minimal-02" label="Minimal — Brand dot" config={config}>
            <HeaderMinimal02 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-gradient-01" label="Gradient — Full brand" config={config}>
            <HeaderGradient01 {...MOCK_HEADER} />
          </VariantCard>
          <VariantCard name="header-gradient-02" label="Gradient — Card + strip" config={config}>
            <HeaderGradient02 {...MOCK_HEADER} />
          </VariantCard>
          {/* === Designkit v2 reworks === */}
          {/* === Creative directions === */}
          <VariantCard name="header-marquee" label="Marquee — scrolling ribbon" config={config}><HeaderMarquee {...MOCK_HEADER} /></VariantCard>
          <VariantCard name="header-stamp-crown" label="Stamp Crown — loyalty seals" config={config}><HeaderStampCrown {...MOCK_HEADER} /></VariantCard>
          <VariantCard name="header-liquid" label="Liquid — animated wave" config={config}><HeaderLiquid {...MOCK_HEADER} /></VariantCard>
          <VariantCard name="header-vertical" label="Vertical — magazine wordmark" config={config}><HeaderVertical {...MOCK_HEADER} /></VariantCard>
        </div>

        <SectionTitle title="Menu" count={21} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="menu-compact-list" label="Compact list" config={config}>
            <MenuCompactList {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-photo-cards" label="Photo cards grid" config={config}>
            <MenuPhotoCards {...MOCK_MENU} />
          </VariantCard>

          <VariantCard name="menu-category-sections" label="Category sections" config={config}>
            <MenuCategorySections {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-minimal-rows" label="Minimal dotted rows" config={config}>
            <MenuMinimalRows {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-featured-hero" label="Featured hero + list" config={config}>
            <MenuFeaturedHero {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-pill-tags" label="Pill tags flow" config={config}>
            <MenuPillTags {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-numbered-list" label="Numbered editorial" config={config}>
            <MenuNumberedList {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-split-price" label="Split name/price" config={config}>
            <MenuSplitPrice {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-icon-rows" label="Icon rows" config={config}>
            <MenuIconRows {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-stacked-images" label="Stacked full-bleed images" config={config}>
            <MenuStackedImages {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-collapsible" label="Collapsible categories (30+ items)" config={config}>
            <MenuCollapsible items={[
              { id: '1', name: 'Latte', price: 70, category: 'Sicak Icecekler' },
              { id: '2', name: 'Cappuccino', price: 65, category: 'Sicak Icecekler' },
              { id: '3', name: 'Americano', price: 55, category: 'Sicak Icecekler' },
              { id: '4', name: 'Mocha', price: 80, category: 'Sicak Icecekler' },
              { id: '5', name: 'Turk Kahvesi', price: 45, category: 'Sicak Icecekler' },
              { id: '6', name: 'Cold Brew', price: 85, category: 'Soguk Icecekler' },
              { id: '7', name: 'Iced Latte', price: 75, category: 'Soguk Icecekler' },
              { id: '8', name: 'Frappe', price: 90, category: 'Soguk Icecekler' },
              { id: '9', name: 'Cheesecake', price: 95, category: 'Tatlilar' },
              { id: '10', name: 'Brownie', price: 70, category: 'Tatlilar' },
              { id: '11', name: 'Tiramisu', price: 85, category: 'Tatlilar' },
              { id: '12', name: 'Croissant', price: 45, category: 'Atistirmalik' },
              { id: '13', name: 'Sandvic', price: 65, category: 'Atistirmalik' },
            ]} />
          </VariantCard>
          <VariantCard name="menu-photo-grid-large" label="Photo — Large single column" config={config}>
            <MenuPhotoGridLarge {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-photo-rows" label="Photo — Thumbnail rows" config={config}>
            <MenuPhotoRows {...MOCK_MENU} />
          </VariantCard>
          <VariantCard name="menu-photo-mosaic" label="Photo — Alternating mosaic" config={config}>
            <MenuPhotoMosaic {...MOCK_MENU} />
          </VariantCard>
          {/* === Designkit explore wave === */}
          <VariantCard name="menu-day-drift" label="Day Drift — time-of-day chips" config={config}><MenuDayDrift {...MOCK_MENU} /></VariantCard>
          <VariantCard name="menu-story-stream" label="Story Stream — editorial feed" config={config}><MenuStoryStream {...MOCK_MENU} /></VariantCard>
          <VariantCard name="menu-swipe-stack" label="Swipe Stack — Tinder shortlist" config={config}><MenuSwipeStack {...MOCK_MENU} /></VariantCard>
          <VariantCard name="menu-mosaic-wall" label="Mosaic Wall — Pinterest grid" config={config}><MenuMosaicWall {...MOCK_MENU} /></VariantCard>
          <VariantCard name="menu-conversation" label="Conversation — chat bubbles" config={config}><MenuConversation {...MOCK_MENU} /></VariantCard>
          <VariantCard name="menu-carousel-trays" label="Carousel Trays — swipe rails" config={config}><MenuCarouselTrays {...MOCK_MENU} /></VariantCard>
          <VariantCard name="menu-magazine-spread" label="Magazine Spread — alternating" config={config}><MenuMagazineSpread {...MOCK_MENU} /></VariantCard>
        </div>

        <SectionTitle title="Kampanya Kartlari" count={13} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="campaign-banner-01" label="Banner — Accent strip" config={config}>
            <CampaignBanner01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="campaign-banner-02" label="Banner — Full gradient" config={config}>
            <CampaignBanner02 {...MOCK_CAMPAIGNS} />
          </VariantCard>

          <VariantCard name="campaign-card-01" label="Card — Icon + text" config={config}>
            <CampaignCard01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="campaign-inline-01" label="Inline — Dot rows" config={config}>
            <CampaignInline01 {...MOCK_CAMPAIGNS} />
          </VariantCard>

          <VariantCard name="campaign-countdown-01" label="Countdown — Urgency" config={config}>
            <CampaignCountdown01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="campaign-split-01" label="Split — Discount block" config={config}>
            <CampaignSplit01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="campaign-neon-01" label="Neon — Glow outlines" config={config}>
            <CampaignNeon01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="campaign-ticket-01" label="Ticket — Coupon tear-off" config={config}>
            <CampaignTicket01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="campaign-fullbleed-01" label="Fullbleed — Stacked hero blocks" config={config}>
            <CampaignFullbleed01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="campaign-mosaic-01" label="Mosaic — Large + small grid" config={config}>
            <CampaignMosaic01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          {/* === Designkit explore wave === */}
          <VariantCard name="campaign-front-page" label="Front Page — newspaper editorial" config={config}><CampaignFrontPage {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="campaign-coupon-stack" label="Coupon Stack — wallet of deals" config={config}><CampaignCouponStack {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="campaign-product-showcase" label="Product Showcase — e-commerce" config={config}><CampaignProductShowcase {...MOCK_CAMPAIGNS} /></VariantCard>
        </div>

        <SectionTitle title="Sana Ozel (Kişisel Fırsatlar)" count={18} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="sana-ozel-01" label="Sparkle glow cards" config={config}>
            <SanaOzel01 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-02" label="Gradient banner" config={config}>
            <SanaOzel02 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-03" label="Icon list in card" config={config}>
            <SanaOzel03 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-04" label="Minimal dot rows" config={config}>
            <SanaOzel04 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-05" label="Urgency circle badge" config={config}>
            <SanaOzel05 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-06" label="Split block" config={config}>
            <SanaOzel06 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-07" label="Neon glow" config={config}>
            <SanaOzel07 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-08" label="Gift ticket" config={config}>
            <SanaOzel08 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-09" label="Frosted glass overlay" config={config}>
            <SanaOzel09 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          <VariantCard name="sana-ozel-10" label="Mosaic grid" config={config}>
            <SanaOzel10 {...MOCK_CAMPAIGNS} />
          </VariantCard>
          {/* === Designkit explore wave === */}
          <VariantCard name="sana-ozel-reveal-scratch" label="Reveal Scratch — tap to uncover" config={config}><SanaOzelRevealScratch {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="sana-ozel-why-you" label="Why-You — explains AI reasoning" config={config}><SanaOzelWhyYou {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="sana-ozel-countdown" label="Countdown — live ticking" config={config}><SanaOzelCountdown {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="sana-ozel-stack" label="Stack — swipeable deck" config={config}><SanaOzelStack {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="sana-ozel-spotlight" label="Spotlight — VIP ticket" config={config}><SanaOzelSpotlight {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="sana-ozel-conversation" label="Conversation — chat reveal" config={config}><SanaOzelConversation {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="sana-ozel-timeline" label="Timeline — offer roadmap" config={config}><SanaOzelTimeline {...MOCK_CAMPAIGNS} /></VariantCard>
          <VariantCard name="sana-ozel-gift" label="Gift Box — tap to open" config={config}><SanaOzelGift {...MOCK_CAMPAIGNS} /></VariantCard>
        </div>

        <SectionTitle title="Gorevler (Challenge Cards)" count={10} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="challenge-card-01" label="Card — bordered with progress bar" config={config}>
            <ChallengeCard01 {...MOCK_CHALLENGE} />
          </VariantCard>
          <VariantCard name="challenge-banner-01" label="Banner — full width accent" config={config}>
            <ChallengeBanner01 {...MOCK_CHALLENGE} />
          </VariantCard>
          <VariantCard name="challenge-ticket-01" label="Ticket — perforated edge" config={config}>
            <ChallengeTicket01 {...MOCK_CHALLENGE} />
          </VariantCard>
          <VariantCard name="challenge-glass-01" label="Glass — frosted overlay" config={config}>
            <ChallengeGlass01 {...MOCK_CHALLENGE} />
          </VariantCard>
          <VariantCard name="challenge-minimal-01" label="Minimal — clean text" config={config}>
            <ChallengeMinimal01 {...MOCK_CHALLENGE} />
          </VariantCard>
          <VariantCard name="challenge-card-01-empty" label="Card — empty state" config={config}>
            <ChallengeCard01 {...MOCK_CHALLENGE_EMPTY} />
          </VariantCard>
          {/* === Designkit explore wave === */}
          <VariantCard name="challenge-xp-bar" label="XP Bar — game-style progress" config={config}><ChallengeXpBar {...MOCK_CHALLENGE} /></VariantCard>
          <VariantCard name="challenge-step-map" label="Step Map — visual stepper" config={config}><ChallengeStepMap {...MOCK_CHALLENGE} /></VariantCard>
          <VariantCard name="challenge-calendar-grid" label="Calendar Grid — week visual" config={config}><ChallengeCalendarGrid {...MOCK_CHALLENGE} /></VariantCard>
          <VariantCard name="challenge-habit-tracker" label="Habit Tracker — todo checkboxes" config={config}><ChallengeHabitTracker {...MOCK_CHALLENGE} /></VariantCard>
          <VariantCard name="challenge-countdown-coin" label="Countdown Coin — circular ring" config={config}><ChallengeCountdownCoin {...MOCK_CHALLENGE} /></VariantCard>
        </div>

        <SectionTitle title="Kart Aktivite" count={5} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="activity-timeline-01" label="Timeline — Streak + dot timeline" config={config}>
            <ActivityTimeline01 {...MOCK_ACTIVITY} />
          </VariantCard>
          <VariantCard name="activity-compact-01" label="Compact — Stats header + visit list" config={config}>
            <ActivityCompact01 {...MOCK_ACTIVITY} />
          </VariantCard>
          <VariantCard name="activity-streak-01" label="Streak — Week days + big number" config={config}>
            <ActivityStreak01 {...MOCK_ACTIVITY} />
          </VariantCard>
          <VariantCard name="activity-minimal-01" label="Minimal — Big numbers + text list" config={config}>
            <ActivityMinimal01 {...MOCK_ACTIVITY} />
          </VariantCard>
          <VariantCard name="activity-achievement-01" label="Achievement — Milestone badges" config={config}>
            <ActivityAchievement01 {...MOCK_ACTIVITY} />
          </VariantCard>
        </div>

        <SectionTitle title="Profil" count={4} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          <VariantCard name="profile-card-01" label="Card — Avatar + stats grid" config={config}>
            <ProfileCard01 {...MOCK_PROFILE} />
          </VariantCard>
          <VariantCard name="profile-minimal-01" label="Minimal — Compact inline" config={config}>
            <ProfileMinimal01 {...MOCK_PROFILE} />
          </VariantCard>
          <VariantCard name="profile-hero-01" label="Hero — Brand gradient header" config={config}>
            <ProfileHero01 {...MOCK_PROFILE} />
          </VariantCard>
          <VariantCard name="profile-split-01" label="Split — Avatar left, stats right" config={config}>
            <ProfileSplit01 {...MOCK_PROFILE} />
          </VariantCard>
        </div>

        <SectionTitle title="Navigasyon" count={4} />
        <p style={{ fontSize: 11, color: '#52525b', marginBottom: 12 }}>Nav variants shown inside phone frames (position: fixed replaced with absolute for preview)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {([
            { name: 'nav-bottom-bar', label: 'Bottom Bar', C: NavBottomBar },
            { name: 'nav-floating-island', label: 'Floating Island', C: NavFloatingIsland },
            { name: 'nav-minimal-dots', label: 'Minimal Dots', C: NavMinimalDots },


            { name: 'nav-tab-pills', label: 'Tab Pills', C: NavTabPills },

          ] as const).map(({ name, label, C }) => (
            <div key={name} style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
              <div style={{ padding: '6px 12px', background: '#18181b', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa' }}>{label}</span>
                <span style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace' }}>{name}</span>
              </div>
              <ScopedTokenProvider config={config} style={{
                position: 'relative',
                height: 120,
                background: 'var(--color-bg)',
                overflow: 'hidden',
              }}>
                {/* Override fixed positioning to absolute for preview */}
                <style>{`
                  [data-nav="${name}"] nav { position: absolute !important; }
                `}</style>
                <div data-nav={name}>
                  <C activeTab="kartim" onTabChange={() => {}} onQrPress={() => {}} />
                </div>
              </ScopedTokenProvider>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// === Helper Components ===

function VariantPicker({ label, options, value, onChange }: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      <span style={{ color: '#71717a', minWidth: 64 }}>{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ padding: '4px 8px', borderRadius: 6, background: '#18181b', border: '1px solid #3f3f46', color: '#e4e4e7', fontSize: 11, cursor: 'pointer', minWidth: 200 }}
      >
        <option value="">— mapper default —</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}

function ControlGroup<T extends string>({ label, options, value, onChange }: {
  label: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
      <span style={{ color: '#71717a' }}>{label}</span>
      <div style={{ display: 'flex', gap: 2 }}>
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '3px 8px',
              borderRadius: 6,
              border: 'none',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              transition: '150ms ease',
              background: value === opt ? '#d97706' : '#27272a',
              color: value === opt ? 'white' : '#a1a1aa',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </label>
  )
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 32, marginBottom: 12 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#e4e4e7' }}>{title}</h2>
      <span style={{ fontSize: 11, color: '#71717a', background: '#27272a', padding: '2px 8px', borderRadius: 10 }}>{count} variant</span>
    </div>
  )
}

function VariantCard({ name, label, config, children }: {
  name: string
  label: string
  config: PwaConfig
  children: React.ReactNode
}) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid #27272a', overflow: 'hidden' }}>
      {/* Label */}
      <div style={{ padding: '6px 12px', background: '#18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa' }}>{label}</span>
        <span style={{ fontSize: 10, color: '#52525b', fontFamily: 'monospace' }}>{name}</span>
      </div>
      {/* Scoped preview */}
      <ScopedTokenProvider config={config} style={{ padding: 16, background: 'var(--color-bg)' }}>
        {children}
      </ScopedTokenProvider>
    </div>
  )
}

function EmptySection({ text }: { text: string }) {
  return (
    <div style={{ padding: 24, borderRadius: 12, border: '1px dashed #27272a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ fontSize: 13, color: '#52525b' }}>{text}</p>
    </div>
  )
}

function PickRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: '#71717a' }}>{label}</span>
      <span style={{ color: '#e4e4e7', fontWeight: 500 }}>{value}</span>
    </div>
  )
}

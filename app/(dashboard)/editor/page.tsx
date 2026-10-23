'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { createClient } from '@/lib/supabase/client'
import { ImageUpload } from '@/components/dashboard/image-upload'
import { ScopedTokenProvider } from '@/components/pwa-v2/token-provider'
import { PwaShell } from '@/components/pwa-v2/pwa-shell'
import { STAMP_VARIANTS, HEADER_VARIANTS, MENU_VARIANTS, CAMPAIGN_VARIANTS, SANA_OZEL_VARIANTS, ACTIVITY_VARIANTS, PROFILE_VARIANTS, NAV_VARIANTS, CHALLENGE_VARIANTS } from '@/components/pwa-v2/variant-renderer'
import { type PwaConfig, DEFAULT_CONFIG, CONFIG_OPTIONS } from '@/lib/pwa-tokens'
import { mapAnswersToVariants } from '@/lib/variant-mapper'
import { ChevronLeft, Save, ChevronDown, Check, Globe, ImageIcon, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { getSchematic } from '@/lib/variant-schematics'

// Variant display names
const VARIANT_LABELS: Record<string, string> = {
  'stamp-minimal-01': 'Minimal — Grid', 'stamp-minimal-02': 'Minimal — Bars', 'stamp-minimal-03': 'Minimal — Dots',
  'stamp-minimal-04': 'Minimal — Segmented', 'stamp-realistic-01': 'Gercekci — Embossed', 'stamp-realistic-02': 'Gercekci — Punch Card',
  'stamp-realistic-03': 'Gercekci — Split', 'stamp-playful-01': 'Eglenceli — Cups', 'stamp-playful-02': 'Eglenceli — Strip',
  'stamp-playful-03': 'Eglenceli — Steps', 'stamp-gold-card': 'Gold Card', 'stamp-coffee-cup': 'Coffee Cup',
  'stamp-neon-glow': 'Neon Glow', 'stamp-passport': 'Passport',
  'header-photo-01': 'Foto — Alt', 'header-photo-02': 'Foto — Orta', 'header-photo-03': 'Foto — Split',
  'header-logo-01': 'Logo — Satir', 'header-logo-02': 'Logo — Buyuk', 'header-logo-03': 'Logo — Pill',
  'header-minimal-01': 'Minimal — Monogram', 'header-minimal-02': 'Minimal — Dot',
  'header-gradient-01': 'Gradient — Full', 'header-gradient-02': 'Gradient — Kart',
  'menu-compact-list': 'Kompakt Liste', 'menu-photo-cards': 'Foto Kartlar', 'menu-category-sections': 'Kategoriler',
  'menu-minimal-rows': 'Minimal Satirlar', 'menu-featured-hero': 'Hero + Liste', 'menu-pill-tags': 'Pill Etiketler',
  'menu-numbered-list': 'Numarali', 'menu-split-price': 'Split Fiyat', 'menu-icon-rows': 'Ikon Satirlar',
  'menu-stacked-images': 'Yigin Gorseller', 'menu-collapsible': 'Katlanir', 'menu-photo-grid-large': 'Buyuk Foto',
  'menu-photo-rows': 'Foto Satirlar', 'menu-photo-mosaic': 'Foto Mozaik',
  'campaign-banner-01': 'Banner — Serit', 'campaign-banner-02': 'Banner — Gradient', 'campaign-card-01': 'Kart — Ikon',
  'campaign-inline-01': 'Inline — Dot', 'campaign-countdown-01': 'Geri Sayim', 'campaign-split-01': 'Split',
  'campaign-neon-01': 'Neon Glow', 'campaign-ticket-01': 'Kupon', 'campaign-fullbleed-01': 'Fullbleed', 'campaign-mosaic-01': 'Mozaik',
  'sana-ozel-01': 'Sparkle Glow', 'sana-ozel-02': 'Gradient Banner', 'sana-ozel-03': 'Ikon Liste',
  'sana-ozel-04': 'Minimal Dot', 'sana-ozel-05': 'Acil Daire', 'sana-ozel-06': 'Split Blok',
  'sana-ozel-07': 'Neon Glow', 'sana-ozel-08': 'Hediye Kupon', 'sana-ozel-09': 'Buzlu Cam', 'sana-ozel-10': 'Mozaik Grid',
  'activity-timeline-01': 'Timeline', 'activity-compact-01': 'Kompakt', 'activity-streak-01': 'Streak',
  'activity-minimal-01': 'Minimal', 'activity-achievement-01': 'Basarimlar',
  'profile-card-01': 'Kart', 'profile-minimal-01': 'Minimal', 'profile-hero-01': 'Hero', 'profile-split-01': 'Split',
  'nav-bottom-bar': 'Alt Bar', 'nav-floating-island': 'Ada', 'nav-minimal-dots': 'Noktalar', 'nav-tab-pills': 'Pill Sekmeler',
  'challenge-card-01': 'Kart', 'challenge-banner-01': 'Banner', 'challenge-minimal-01': 'Minimal',
  'challenge-ticket-01': 'Kupon', 'challenge-glass-01': 'Cam',
}

const SECTIONS = [
  { key: 'variant_stamp', label: 'Puan Karti', variants: STAMP_VARIANTS },
  { key: 'variant_header', label: 'Header', variants: HEADER_VARIANTS },
  { key: 'variant_menu', label: 'Menu', variants: MENU_VARIANTS },
  { key: 'variant_campaign', label: 'Kampanya', variants: CAMPAIGN_VARIANTS },
  { key: 'variant_sana_ozel', label: 'Sana Ozel', variants: SANA_OZEL_VARIANTS },
  { key: 'variant_activity', label: 'Aktivite', variants: ACTIVITY_VARIANTS },
  { key: 'variant_profile', label: 'Profil', variants: PROFILE_VARIANTS },
  { key: 'variant_nav', label: 'Navigasyon', variants: NAV_VARIANTS },
  { key: 'variant_challenge', label: 'Gorev Karti', variants: CHALLENGE_VARIANTS },
] as const

export default function EditorPage() {
  const { org } = useAuth()
  const router = useRouter()
  const supabase = createClient()
  const [config, setConfig] = useState<PwaConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [extractUrl, setExtractUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractSuccess, setExtractSuccess] = useState(false)

  // Real org data for preview
  const [orgData, setOrgData] = useState({ name: '', city: '', address: '', logo_url: null as string | null, banner_url: null as string | null, slug: '' })
  const [campaigns, setCampaigns] = useState<{ id: string; name: string; description?: string; discount_text?: string }[]>([])
  const [menuItems, setMenuItems] = useState<{ id: string; name: string; price: number; category?: string }[]>([])

  async function updateOrgAsset(field: 'logo_url' | 'banner_url', url: string | null) {
    setOrgData(prev => ({ ...prev, [field]: url }))
    if (org?.id) await supabase.from('organizations').update({ [field]: url }).eq('id', org.id)
    setConfig(prev => ({ ...prev, [field]: url }))
  }

  // Load current config + real data
  useEffect(() => {
    fetch('/api/org')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          if (data.pwa_config) setConfig({ ...DEFAULT_CONFIG, ...data.pwa_config })
          setOrgData({
            name: data.name || '',
            city: data.city || '',
            address: data.address || '',
            logo_url: data.logo_url || null,
            banner_url: data.banner_url || null,
            slug: data.slug || '',
          })
          // Fetch campaigns
          if (data.slug) {
            fetch(`/api/public/${data.slug}/campaigns`)
              .then(r => r.ok ? r.json() : [])
              .then(c => setCampaigns(Array.isArray(c) ? c : []))
            // Fetch menu
            fetch(`/api/public/${data.slug}/menu`)
              .then(r => r.ok ? r.json() : [])
              .then(m => setMenuItems(Array.isArray(m) ? m.map((i: Record<string, unknown>) => ({
                id: i.id as string, name: i.name as string, price: i.price as number, category: i.category as string
              })) : []))
          }
        }
        setLoading(false)
      })
  }, [])

  // Update a token field + re-run variant mapper
  const updateToken = <K extends keyof PwaConfig>(key: K, value: PwaConfig[K]) => {
    setConfig(prev => {
      const updated = { ...prev, [key]: value }
      const designFields: (keyof PwaConfig)[] = ['shop_style', 'stamp_feel', 'has_product_photos', 'layout', 'logo_url', 'banner_url']
      if (designFields.includes(key)) {
        const variants = mapAnswersToVariants(updated)
        return { ...updated, ...variants }
      }
      return updated
    })
  }

  // Update a variant directly
  const updateVariant = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // Save
  const save = async () => {
    setSaving(true)
    await fetch('/api/org', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pwa_config: config, primary_color: config.brand_color }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // Extract from URL
  const handleExtract = async () => {
    if (!extractUrl.trim()) return
    setExtracting(true)
    setExtractSuccess(false)
    try {
      const res = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: extractUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        const c = data.config || {}
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
        const merged = { ...config, ...extracted }
        const variants = mapAnswersToVariants(merged)
        setConfig({ ...merged, ...variants })

        // Update org data so preview shows extracted logo/banner
        const logoUrl = c.logo_url || data.brand?.logoUrl || null
        const bannerUrl = c.banner_url || null
        if (logoUrl || bannerUrl) {
          setOrgData(prev => ({
            ...prev,
            ...(logoUrl && { logo_url: logoUrl }),
            ...(bannerUrl && { banner_url: bannerUrl }),
            ...(c.name && { name: c.name }),
          }))
          // Save logo/banner to org immediately so real PWA uses them
          fetch('/api/org', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...(logoUrl && { logo_url: logoUrl }),
              ...(bannerUrl && { banner_url: bannerUrl }),
              ...(c.brand_color && { primary_color: c.brand_color }),
            }),
          })
        }

        setExtractSuccess(true)
        setTimeout(() => setExtractSuccess(false), 3000)
      }
    } catch { /* silent */ }
    setExtracting(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex h-full gap-6 p-6">
      <style>{`
        .editor-left-panel::-webkit-scrollbar { display: none; }
        .editor-left-panel { scrollbar-width: none; }
      `}</style>
      {/* Left panel — controls */}
      <div className="w-[768px] flex-shrink-0 rounded-xl border border-gray-200 bg-white overflow-y-auto shadow-sm editor-left-panel">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-5 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Uygulamam</h1>
            <p className="text-xs text-gray-500 mt-0.5">PWA tasariminizi duzenleyin</p>
          </div>
          <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 shadow-sm">
            {saving ? '...' : saved ? <><Check size={14} /> Kaydedildi</> : <><Save size={14} /> Kaydet</>}
          </button>
        </div>

        {/* Brand assets */}
        <div className="px-5 py-4 border-b border-gray-100">
          <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Marka Görselleri</h2>
              <p className="text-xs text-gray-500 mt-0.5">Logo ve kapak görselinizi yan yana yükleyin</p>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <ImageUpload
                  value={orgData.logo_url}
                  onChange={(url) => updateOrgAsset('logo_url', url)}
                  preset="logo"
                  aspect="square"
                  label="Logo"
                />
              </div>

              <div className="w-44 flex-shrink-0">
                <ImageUpload
                  value={orgData.banner_url}
                  onChange={(url) => updateOrgAsset('banner_url', url)}
                  preset="banner"
                  aspect="banner"
                  label="Kapak (16:9)"
                />
              </div>
            </div>

            {/* Smart hint — menu item photos live in a separate tab */}
            <Link
              href="/settings?tab=menu"
              className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 hover:bg-amber-100 hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight">Menü ürün görselleri</p>
                  <p className="text-xs text-amber-800/80 mt-0.5 leading-snug">Menü ürünlerinizin görsellerini eklemek için Menü ayarlarına git.</p>
                </div>
              </div>
              <ArrowRight size={16} className="flex-shrink-0 text-amber-700" />
            </Link>
          </section>
        </div>

        {/* Website extractor */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Web Sitesinden Al</p>
          <div className="flex gap-2">
            <input
              value={extractUrl}
              onChange={e => setExtractUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleExtract()}
              placeholder="site.com"
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <button
              onClick={handleExtract}
              disabled={extracting || !extractUrl.trim()}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm ${
                extractSuccess ? 'bg-green-600 text-white' : 'bg-amber-600 text-white hover:bg-amber-700'
              } disabled:opacity-50`}
            >
              {extracting ? '...' : extractSuccess ? <><Check size={14} /> Tamam</> : <><Globe size={14} /> Analiz</>}
            </button>
          </div>
          {extractSuccess && <p className="text-xs text-green-600 mt-2">Tum parametreler guncellendi</p>}
        </div>

        {/* Global token controls */}
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Genel</p>

          {/* Color */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500 w-14">Renk</span>
            <input type="color" value={config.brand_color} onChange={e => updateToken('brand_color', e.target.value)} className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer" />
            <input value={config.brand_color} onChange={e => updateToken('brand_color', e.target.value)} className="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm font-mono w-24 shadow-sm focus:border-amber-500 focus:outline-none" />
          </div>

          {/* Shape */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500 w-14">Sekil</span>
            <div className="flex gap-1.5">
              {CONFIG_OPTIONS.shape.map(s => (
                <button key={s} onClick={() => updateToken('shape', s)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${config.shape === s ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{s === 'round' ? 'Yuvarlak' : 'Duzgun'}</button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500 w-14">Font</span>
            <div className="flex gap-1.5">
              {CONFIG_OPTIONS.font_personality.map(f => (
                <button key={f} onClick={() => updateToken('font_personality', f)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${config.font_personality === f ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {{ traditional: 'Serif', clean: 'Temiz', bold: 'Kalin' }[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-500 w-14">Yogun</span>
            <div className="flex gap-1.5">
              {CONFIG_OPTIONS.density.map(d => (
                <button key={d} onClick={() => updateToken('density', d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${config.density === d ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {d === 'balanced' ? 'Dengeli' : 'Yogun'}
                </button>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 w-14">Yapi</span>
            <div className="flex gap-1.5">
              {(['tabs', 'single-page'] as const).map(l => (
                <button key={l} onClick={() => updateToken('layout', l)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${config.layout === l ? 'bg-amber-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {l === 'tabs' ? 'Sekmeli' : 'Tek Sayfa'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Component sections */}
        <div className="px-5 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bilesenler</p>

          {SECTIONS.map(section => {
            const currentVariant = (config as unknown as Record<string, string>)[section.key] || ''
            const isOpen = openSection === section.key
            const variantNames = Object.keys(section.variants)

            return (
              <div key={section.key} className="mb-1">
                {/* Section header */}
                <button
                  onClick={() => setOpenSection(isOpen ? null : section.key)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full ${currentVariant ? 'bg-amber-500' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium text-gray-700">{section.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{VARIANT_LABELS[currentVariant] || currentVariant}</span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Variant picker (expanded) — schematic grid */}
                {isOpen && (
                  <div className="px-3 pb-3 grid grid-cols-3 gap-2">
                    {variantNames.map(name => {
                      const isActive = currentVariant === name
                      return (
                        <button
                          key={name}
                          onClick={() => updateVariant(section.key, name)}
                          className={`p-1.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-amber-50 ring-2 ring-amber-500'
                              : 'bg-gray-50 ring-1 ring-transparent hover:ring-gray-300'
                          }`}
                          title={VARIANT_LABELS[name] || name}
                        >
                          {getSchematic(name)}
                          <p className={`mt-1.5 text-[10px] font-medium leading-tight truncate ${isActive ? 'text-amber-700' : 'text-gray-600'}`}>
                            {VARIANT_LABELS[name] || name.replace(/^[a-z-]+(?=\d|[a-z]{4,})/, '')}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Right panel — live preview */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Phone frame */}
        <div className="w-[300px] h-[600px] rounded-[32px] border-[4px] border-gray-800 shadow-2xl relative" style={{ overflow: 'hidden' }}>
          <style>{`
            .editor-preview nav { position: absolute !important; }
            .editor-preview *::-webkit-scrollbar { display: none; }
            .editor-preview * { scrollbar-width: none; }
            .editor-preview .pwa-root { overflow-y: auto !important; max-height: 600px !important; }
          `}</style>
          <ScopedTokenProvider
            config={config}
            className="editor-preview"
            style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
          >
            <PwaShell
              shopName={orgData.name || org?.name || 'Kafe'}
              logoUrl={orgData.logo_url || config.logo_url || null}
              bannerUrl={orgData.banner_url || config.banner_url || null}
              city={orgData.city || 'Istanbul'}
              address={orgData.address || undefined}
              customerId="preview"
              customerName="Ayse Yilmaz"
              customerPhone="+90 532 *** ** 48"
              currentStamps={4}
              totalRequired={10}
              rewardName="Bedava Kahve"
              streak={3}
              totalVisits={23}
              totalStamps={4}
              totalRewards={2}
              lastVisits={[
                { date: 'Bugun 09:15', location: orgData.city || 'Kadikoy' },
                { date: 'Dun 14:30', location: orgData.city || 'Kadikoy' },
              ]}
              memberSince="Mart 2026"
              personalizedDeals={[
                { id: 'sana-1', name: 'Latte %20 indirim', description: 'Sadece senin icin', discount_text: '%20' },
                { id: 'sana-2', name: 'Americano hediye', description: 'Seni ozledik!', discount_text: 'Bedava' },
              ]}
              campaigns={campaigns.length > 0 ? campaigns : [
                { id: 'mock', name: 'Ornek Kampanya', description: 'Kampanya ekleyin', discount_text: '' },
              ]}
              menuItems={menuItems.length > 0 ? menuItems : [
                { id: 'mock', name: 'Menu bos', price: 0, category: 'Menu ekleyin' },
              ]}
              onLogout={() => {}}
            />
          </ScopedTokenProvider>
        </div>

        {/* Tap the nav in the phone to switch tabs */}
        <p className="text-xs text-gray-400 mt-3">Sekmeleri değiştirmek için telefondaki navigasyona dokunun</p>
      </div>
    </div>
  )
}

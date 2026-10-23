'use client'

import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { OnboardingLayout, OnboardingButton, OptionCard } from '@/components/onboarding/onboarding-layout'
import { PwaPreview } from '@/components/onboarding/pwa-preview'
import { type PwaConfig, DEFAULT_CONFIG } from '@/lib/pwa-tokens'
import { mapAnswersToVariants } from '@/lib/variant-mapper'

// Real steps (excluding loading states)
type Step = 'register' | 'url' | 'extracting' | 'color' | 'logo' | 'banner' | 'style' | 'shape' | 'stamp' | 'photos' | 'font' | 'density' | 'language' | 'layout' | 'location' | 'done'

// Steps for progress bar (excludes register, extracting, done)
const PROGRESS_STEPS = ['url', 'color', 'logo', 'banner', 'style', 'shape', 'stamp', 'photos', 'font', 'density', 'language', 'layout', 'location']
const TOTAL_STEPS = PROGRESS_STEPS.length

function getStepNum(step: Step): number {
  const idx = PROGRESS_STEPS.indexOf(step)
  return idx >= 0 ? idx + 1 : 0
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#F5ECE2]"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E6D4BE] border-t-[#FB3806]" /></div>}>
      <OnboardingContent />
    </Suspense>
  )
}

function OnboardingContent() {
  const [step, setStep] = useState<Step>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [registerError, setRegisterError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const [brandUrl, setBrandUrl] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extracted, setExtracted] = useState(false) // true if URL extraction was done
  const [layoutHints, setLayoutHints] = useState<PwaConfig['_layout_hints'] | undefined>(undefined)

  const [brandColor, setBrandColor] = useState('#FB3806')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [bannerUrl, setBannerUrl] = useState<string | null>(null)
  const [shopStyle, setShopStyle] = useState<PwaConfig['shop_style']>('premium')
  const [shape, setShape] = useState<PwaConfig['shape']>('smooth')
  const [stampFeel, setStampFeel] = useState<PwaConfig['stamp_feel']>('minimal')
  const [hasPhotos, setHasPhotos] = useState(false)
  const [fontPersonality, setFontPersonality] = useState<PwaConfig['font_personality']>('clean')
  const [density, setDensity] = useState<PwaConfig['density']>('balanced')
  const [language, setLanguage] = useState<PwaConfig['language']>('tr')
  const [layout, setLayout] = useState<PwaConfig['layout']>('tabs')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [estimatedCustomers, setEstimatedCustomers] = useState('')
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const initializedRef = useRef(false)

  const supabase = createClient()
  const router = useRouter()

  const stepNum = getStepNum(step)

  // Navigation
  const goTo = (s: Step) => setStep(s)
  const nextStep = (current: Step): Step => {
    const order: Step[] = ['url', 'color', 'logo', 'banner', 'style', 'shape', 'stamp', 'photos', 'font', 'density', 'language', 'layout', 'location']
    const idx = order.indexOf(current)
    return idx >= 0 && idx < order.length - 1 ? order[idx + 1] : 'location'
  }
  const prevStep = (current: Step): Step => {
    const order: Step[] = ['url', 'color', 'logo', 'banner', 'style', 'shape', 'stamp', 'photos', 'font', 'density', 'language', 'layout', 'location']
    const idx = order.indexOf(current)
    return idx > 0 ? order[idx - 1] : 'url'
  }
  const goNext = () => setStep(nextStep(step))
  const goBack = () => setStep(prevStep(step))

  // First run shows the one-time owner account step; afterwards owners log in.
  // Logged-in owners resume their in-progress design from localStorage.
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        const res = await fetch('/api/setup')
        const { needsSetup } = res.ok ? await res.json() : { needsSetup: false }
        if (needsSetup) setStep('register')
        else window.location.replace('/login')
        return
      }
      setUserId(user.id)

      const { data: userData } = await supabase
        .from('users')
        .select('org_id, organizations(onboarding_completed)')
        .eq('id', user.id)
        .single()
      const org = userData?.organizations as unknown as { onboarding_completed: boolean } | null

      if (org?.onboarding_completed) {
        window.location.replace('/hub')
        return
      }

      // Resume mid-flow from localStorage if we have it
      try {
        const raw = localStorage.getItem(`looyaal_onboarding_${user.id}`)
        if (raw) {
          const saved = JSON.parse(raw) as Record<string, unknown>
          if (typeof saved.businessName === 'string') setBusinessName(saved.businessName)
          if (typeof saved.brandUrl === 'string') setBrandUrl(saved.brandUrl)
          if (typeof saved.extracted === 'boolean') setExtracted(saved.extracted)
          if (saved.layoutHints) setLayoutHints(saved.layoutHints as PwaConfig['_layout_hints'])
          if (typeof saved.brandColor === 'string') setBrandColor(saved.brandColor)
          if (saved.logoUrl === null || typeof saved.logoUrl === 'string') setLogoUrl(saved.logoUrl as string | null)
          if (saved.bannerUrl === null || typeof saved.bannerUrl === 'string') setBannerUrl(saved.bannerUrl as string | null)
          if (saved.shopStyle) setShopStyle(saved.shopStyle as PwaConfig['shop_style'])
          if (saved.shape) setShape(saved.shape as PwaConfig['shape'])
          if (saved.stampFeel) setStampFeel(saved.stampFeel as PwaConfig['stamp_feel'])
          if (typeof saved.hasPhotos === 'boolean') setHasPhotos(saved.hasPhotos)
          if (saved.fontPersonality) setFontPersonality(saved.fontPersonality as PwaConfig['font_personality'])
          if (saved.density) setDensity(saved.density as PwaConfig['density'])
          if (saved.language) setLanguage(saved.language as PwaConfig['language'])
          if (saved.layout) setLayout(saved.layout as PwaConfig['layout'])
          if (typeof saved.city === 'string') setCity(saved.city)
          if (typeof saved.address === 'string') setAddress(saved.address)
          if (typeof saved.estimatedCustomers === 'string') setEstimatedCustomers(saved.estimatedCustomers)
          if (typeof saved.step === 'string' && PROGRESS_STEPS.includes(saved.step)) {
            setStep(saved.step as Step)
            initializedRef.current = true
            return
          }
        }
      } catch { /* corrupted JSON or storage disabled — fall through */ }

      setStep('url')
      initializedRef.current = true
    })
  }, [supabase.auth])

  // Persist in-progress design to localStorage so bailing mid-flow doesn't lose progress
  useEffect(() => {
    if (!initializedRef.current || !userId) return
    if (step === 'register' || step === 'extracting' || step === 'done') return
    try {
      localStorage.setItem(`looyaal_onboarding_${userId}`, JSON.stringify({
        step,
        businessName, brandUrl, extracted, layoutHints,
        brandColor, logoUrl, bannerUrl, shopStyle, shape, stampFeel, hasPhotos,
        fontPersonality, density, language, layout,
        city, address, estimatedCustomers,
      }))
    } catch { /* quota exceeded — skip */ }
  }, [step, userId, businessName, brandUrl, extracted, layoutHints, brandColor, logoUrl, bannerUrl, shopStyle, shape, stampFeel, hasPhotos, fontPersonality, density, language, layout, city, address, estimatedCustomers])

  // Pre-filled hint text
  const hint = (field: string) => extracted ? `Sitenizden algılandı — değiştirebilirsiniz.` : undefined

  // Register
  async function handleRegister() {
    if (!email || !password || !fullName || !businessName) return
    setRegistering(true)
    setRegisterError(null)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, orgName: businessName }),
      })
      if (!res.ok) {
        const data = await res.json()
        setRegisterError(data.error || 'Kayıt başarısız')
        setRegistering(false)
        return
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setRegisterError(error.message)
        setRegistering(false)
        return
      }
      setRegistering(false)
      setStep('url')
    } catch {
      setRegisterError('Bağlantı hatası')
      setRegistering(false)
    }
  }

  // Brand extraction
  async function extractBrand() {
    if (!brandUrl.trim()) { goNext(); return }
    setStep('extracting')
    setExtracting(true)
    try {
      const res = await fetch('/api/brand/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: brandUrl }),
      })
      if (res.ok) {
        const data = await res.json()
        const c = data.config || {}
        if (c.brand_color) setBrandColor(c.brand_color)
        if (c.logo_url || data.brand?.logoUrl) setLogoUrl(c.logo_url || data.brand?.logoUrl)
        if (c.banner_url) setBannerUrl(c.banner_url)
        if (c.name && !businessName) setBusinessName(c.name)
        if (c.shop_style) setShopStyle(c.shop_style)
        if (c.shape) setShape(c.shape)
        if (c.stamp_feel) setStampFeel(c.stamp_feel)
        if (c.font_personality) setFontPersonality(c.font_personality)
        if (c.density) setDensity(c.density)
        if (c.language) setLanguage(c.language)
        if (c.layout) setLayout(c.layout)
        if (typeof c.has_product_photos === 'boolean') setHasPhotos(c.has_product_photos)
        if (c._layout_hints) setLayoutHints(c._layout_hints)
        setExtracted(true)
      }
    } catch { /* silent */ }
    setExtracting(false)
    setStep('color')
  }

  // Save
  async function completeOnboarding() {
    setSaving(true)
    const answers: Partial<PwaConfig> = {
      shop_style: shopStyle, shape, brand_color: brandColor, logo_url: logoUrl,
      banner_url: bannerUrl, stamp_feel: stampFeel, has_product_photos: hasPhotos,
      font_personality: fontPersonality, density, language, layout, color_mode: 'dark',
      _layout_hints: layoutHints,
    }
    const variants = mapAnswersToVariants(answers)
    const pwaConfig: Partial<PwaConfig> = { ...answers, ...variants }

    const res = await fetch('/api/org', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: businessName || undefined,
        primary_color: brandColor,
        logo_url: logoUrl,
        city: city || undefined,
        address: address || undefined,
        source_url: brandUrl || undefined,
        pwa_config: pwaConfig,
        onboarding_completed: true,
        estimated_daily_customers: estimatedCustomers ? parseInt(estimatedCustomers) : undefined,
      }),
    })

    if (res.ok) {
      if (userId) try { localStorage.removeItem(`looyaal_onboarding_${userId}`) } catch { /* storage disabled */ }
      setSaving(false)
      setStep('done')
      return
    }

    // Fallback
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase.from('users').select('org_id').eq('id', user.id).single()
        if (userData) {
          await supabase.from('organizations').update({
            name: businessName || undefined, primary_color: brandColor, logo_url: logoUrl,
            city: city || undefined, address: address || undefined, source_url: brandUrl || undefined,
            pwa_config: pwaConfig, onboarding_completed: true,
            estimated_daily_customers: estimatedCustomers ? parseInt(estimatedCustomers) : undefined,
          }).eq('id', userData.org_id)
        }
      }
    } catch { /* silent */ }
    if (userId) try { localStorage.removeItem(`looyaal_onboarding_${userId}`) } catch { /* storage disabled */ }
    setSaving(false)
    setStep('done')
  }

  // Live PWA preview config (recomputes on every answer change)
  const answers: Partial<PwaConfig> = {
    brand_color: brandColor,
    logo_url: logoUrl,
    banner_url: bannerUrl,
    shop_style: shopStyle,
    shape,
    stamp_feel: stampFeel,
    has_product_photos: hasPhotos,
    font_personality: fontPersonality,
    density,
    language,
    layout,
  }
  const variants = mapAnswersToVariants(answers)
  const livePwaConfig: PwaConfig = { ...DEFAULT_CONFIG, ...answers, ...variants } as PwaConfig
  const previewEl = (
    <PwaPreview
      config={livePwaConfig}
      shopName={businessName}
      logoUrl={logoUrl}
      bannerUrl={bannerUrl}
      city={city}
    />
  )

  // Clicking the logo during onboarding signs the user out and returns to
  // the login page. Without this, a half-finished signup leaves a live session — and
  // /login auto-bounces logged-in users to /hub, so the user gets pulled
  // right back into the same half-finished onboarding when they try to log out
  // by clicking Giriş Yap. Sign-out makes the abort gesture mean what it looks like.
  const handleLogoClick = useCallback(async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }, [supabase, router])
  // Memoized so its identity is stable across renders. If this were a plain inline
  // function, every keystroke would re-create it, React would treat <Layout> as a new
  // component type, and remount the subtree — which drops focus from inputs mid-typing.
  const Layout = useCallback(
    (props: React.ComponentProps<typeof OnboardingLayout>) => (
      <OnboardingLayout onLogoClick={handleLogoClick} {...props} />
    ),
    [handleLogoClick]
  )

  // === RENDERS ===

  // Step 0: Register
  if (step === 'register') return (
    <Layout step={0} totalSteps={TOTAL_STEPS} title="Looyaal'a Hoşgeldiniz" subtitle="İşletmeniz için sadakat uygulaması oluşturun. 1 dakika içerisinde hazır.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Adınız Soyadınız"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
        <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="İşletme adı"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="E-posta" type="email"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Şifre (en az 8 karakter)" type="password"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
        {registerError && <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center' }}>{typeof registerError === 'string' ? registerError : 'Kayıt başarısız'}</p>}
      </div>
      <div style={{ marginTop: 24 }}>
        <OnboardingButton label="Hesap Oluştur" onClick={handleRegister} loading={registering} disabled={!email || !password || !fullName || !businessName} />
      </div>
    </Layout>
  )

  // Step 1: URL
  if (step === 'url') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Web siteniz var mı?" subtitle="Varsa girin — renk, logo ve stil otomatik algılansın.">
      <input value={brandUrl} onChange={e => setBrandUrl(e.target.value)} placeholder="örnek: kahvedukkanim.com"
        onKeyDown={e => e.key === 'Enter' && extractBrand()}
        style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <div style={{ flex: 1 }}><OnboardingButton label="Atla" onClick={goNext} variant="secondary" /></div>
        <div style={{ flex: 2 }}><OnboardingButton label="Analiz Et" onClick={extractBrand} disabled={!brandUrl.trim()} /></div>
      </div>
    </Layout>
  )

  // Loading: Extracting
  if (step === 'extracting') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Markanız analiz ediliyor..." subtitle="Logo, renkler ve stil algılanıyor.">
      <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: 40, height: 40, border: '3px solid #FB3806', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </Layout>
  )

  // Step 2: Color
  if (step === 'color') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Marka renginiz" subtitle={hint('color') || 'İşletmenizi en iyi temsil eden renk.'} onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
        <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width: 64, height: 64, borderRadius: 16, border: '2px solid #e5e5e5', cursor: 'pointer', background: 'none' }} />
        <input value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ padding: '10px 14px', borderRadius: 10, background: 'white', border: '1px solid #e5e5e5', color: '#71717a', fontSize: 14, fontFamily: 'monospace', width: 110 }} />
      </div>
      <div style={{ marginTop: 24, height: 48, borderRadius: 12, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'white', fontSize: 13, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{businessName || 'Önizleme'}</p>
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 3: Logo
  if (step === 'logo') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Logonuz" subtitle={logoUrl ? hint('logo') || 'Logonuz algılandı.' : 'Logonuzu yükleyin veya atlayın.'} onBack={goBack} preview={previewEl}>
      {logoUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <img src={logoUrl} alt="" style={{ width: 80, height: 80, borderRadius: 16, objectFit: 'cover', border: '2px solid #e5e5e5' }} />
          <OnboardingButton label="Değiştir" onClick={() => setLogoUrl(null)} variant="secondary" />
        </div>
      ) : (
        <label style={{ display: 'block', padding: 40, borderRadius: 16, border: '2px dashed #d4d4d4', textAlign: 'center', cursor: 'pointer' }}>
          <p style={{ color: '#52525b', fontSize: 14 }}>Logo yüklemek için dokunun</p>
          <p style={{ color: '#a1a1aa', fontSize: 12, marginTop: 4 }}>PNG, JPG — maks 2MB</p>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const form = new FormData()
            form.append('file', file)
            form.append('type', 'logo')
            const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
            if (res.ok) { const data = await res.json(); setLogoUrl(data.url) }
          }} />
        </label>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <div style={{ flex: 1 }}><OnboardingButton label="Atla" onClick={goNext} variant="ghost" /></div>
        <div style={{ flex: 2 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
      </div>
    </Layout>
  )

  // Step 4: Banner
  if (step === 'banner') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Banner fotoğrafı" subtitle="Uygulamanızın üst kısmında görünecek." onBack={goBack} preview={previewEl}>
      {bannerUrl ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <img src={bannerUrl} alt="" style={{ width: '100%', height: 120, borderRadius: 16, objectFit: 'cover', border: '2px solid #e5e5e5' }} />
          <OnboardingButton label="Değiştir" onClick={() => setBannerUrl(null)} variant="secondary" />
        </div>
      ) : (
        <label style={{ display: 'block', padding: 40, borderRadius: 16, border: '2px dashed #d4d4d4', textAlign: 'center', cursor: 'pointer' }}>
          <p style={{ color: '#52525b', fontSize: 14 }}>Banner yüklemek için dokunun</p>
          <p style={{ color: '#a1a1aa', fontSize: 12, marginTop: 4 }}>PNG, JPG — maks 2MB</p>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const form = new FormData()
            form.append('file', file)
            form.append('type', 'banner')
            const res = await fetch('/api/storage/upload', { method: 'POST', body: form })
            if (res.ok) { const data = await res.json(); setBannerUrl(data.url) }
          }} />
        </label>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
        <div style={{ flex: 1 }}><OnboardingButton label="Atla" onClick={goNext} variant="ghost" /></div>
        <div style={{ flex: 2 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
      </div>
    </Layout>
  )

  // Step 5: Shop Style
  if (step === 'style') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Mekanın tarzı nedir?" subtitle={hint('style') || 'İşletmenizi en iyi tanımlayan seçeneği seçin.'} onBack={goBack} preview={previewEl}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {([
          { id: 'premium' as const, title: 'Premium', desc: 'Sofistike, karanlık, lüks' },
          { id: 'craft' as const, title: 'Craft', desc: 'El yapımı, doğal, sıcak' },
          { id: 'cozy' as const, title: 'Rahat', desc: 'Sıcak, davetkar, ev hissi' },
          { id: 'modern' as const, title: 'Modern', desc: 'Minimal, temiz, şık' },
        ]).map(opt => (
          <OptionCard key={opt.id} selected={shopStyle === opt.id} onClick={() => setShopStyle(opt.id)}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{opt.title}</p>
            <p style={{ fontSize: 12, color: '#71717a', marginTop: 4 }}>{opt.desc}</p>
          </OptionCard>
        ))}
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 6: Shape
  if (step === 'shape') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Hangi şekil uyuyor?" subtitle={hint('shape') || 'Kartlar, butonlar ve puan şekilleri buna göre oluşur.'} onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([
          { id: 'round' as const, title: 'Yuvarlak', desc: 'Büyük yumuşak köşeler, dairesel hissi', r: '24px' },
          { id: 'smooth' as const, title: 'Düzgün', desc: 'İnce, premium, modern köşeler', r: '10px' },
        ]).map(opt => (
          <OptionCard key={opt.id} selected={shape === opt.id} onClick={() => setShape(opt.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: opt.r, background: brandColor, flexShrink: 0 }} />
              <div>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{opt.title}</p>
                <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{opt.desc}</p>
              </div>
            </div>
          </OptionCard>
        ))}
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 7: Stamp Feel
  if (step === 'stamp') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Puan kartınız nasıl görünsün?" subtitle="Müşterilerinizin göreceği sadakat kartı stili." onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([
          { id: 'realistic' as const, title: 'Gerçekçi', desc: 'Gölge, 3D his, premium' },
          { id: 'minimal' as const, title: 'Minimal', desc: 'Düz, temiz çizgiler' },
          { id: 'playful' as const, title: 'Eğlenceli', desc: 'Renkli, canlı, enerjik' },
        ]).map(opt => (
          <OptionCard key={opt.id} selected={stampFeel === opt.id} onClick={() => setStampFeel(opt.id)}>
            <p style={{ fontSize: 14, fontWeight: 600 }}>{opt.title}</p>
            <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>{opt.desc}</p>
          </OptionCard>
        ))}
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 8: Product Photos
  if (step === 'photos') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Ürün fotoğraflarınız olacak mı?" subtitle={hint('photos') || 'Menü görsellerini etkileyecek.'} onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <OptionCard selected={hasPhotos} onClick={() => setHasPhotos(true)}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Evet, fotoğraflarım var</p>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Menü görsel kartlarla gösterilir</p>
        </OptionCard>
        <OptionCard selected={!hasPhotos} onClick={() => setHasPhotos(false)}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Hayır, şimdilik yok</p>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Menü metin listesi olarak gösterilir</p>
        </OptionCard>
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 9: Font
  if (step === 'font') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Yazı karakteri" subtitle={hint('font') || 'Uygulamanızın genel hissi.'} onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([
          { id: 'traditional' as const, title: 'Geleneksel', desc: 'Serif, elegant', font: '"Playfair Display", serif', w: 400 },
          { id: 'clean' as const, title: 'Temiz', desc: 'Sans-serif, modern', font: 'Inter, sans-serif', w: 500 },
          { id: 'bold' as const, title: 'Kalın', desc: 'Güçlü, dikkat çekici', font: 'Inter, sans-serif', w: 900 },
        ]).map(opt => (
          <OptionCard key={opt.id} selected={fontPersonality === opt.id} onClick={() => setFontPersonality(opt.id)}>
            <p style={{ fontSize: opt.w === 900 ? 18 : 16, fontWeight: opt.w, fontFamily: opt.font }}>{opt.title}</p>
            <p style={{ fontSize: 12, color: '#71717a', marginTop: 2, fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{opt.desc}</p>
          </OptionCard>
        ))}
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 10: Density
  if (step === 'density') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Uygulama yoğunluğu" subtitle="İçerik ne kadar sıkışık görünsün?" onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <OptionCard selected={density === 'balanced'} onClick={() => setDensity('balanced')}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Dengeli</p>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Rahat boşluklar, okunaklı</p>
        </OptionCard>
        <OptionCard selected={density === 'packed'} onClick={() => setDensity('packed')}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Yoğun</p>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Daha fazla içerik, daha az boşluk</p>
        </OptionCard>
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 11: Language
  if (step === 'language') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Varsayılan dil" subtitle={hint('language') || 'Müşteriler uygulamadan değiştirebilir.'} onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {([
          { id: 'tr' as const, title: 'Türkçe' },
          { id: 'en' as const, title: 'English' },
          { id: 'ar' as const, title: 'العربية' },
        ]).map(opt => (
          <OptionCard key={opt.id} selected={language === opt.id} onClick={() => setLanguage(opt.id)}>
            <p style={{ fontSize: 15, fontWeight: 600 }}>{opt.title}</p>
          </OptionCard>
        ))}
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 12: Layout
  if (step === 'layout') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Uygulama yapısı" subtitle="Sekmeli veya tek sayfa." onBack={goBack} preview={previewEl}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <OptionCard selected={layout === 'tabs'} onClick={() => setLayout('tabs')}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Sekmeli</p>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Kartım, Mağaza, Profil — ayrı sayfalar</p>
        </OptionCard>
        <OptionCard selected={layout === 'single-page'} onClick={() => setLayout('single-page')}>
          <p style={{ fontSize: 14, fontWeight: 600 }}>Tek Sayfa</p>
          <p style={{ fontSize: 12, color: '#71717a', marginTop: 2 }}>Her şey tek kaydırmalı sayfada</p>
        </OptionCard>
      </div>
      <div style={{ marginTop: 24 }}><OnboardingButton label="Devam Et" onClick={goNext} /></div>
    </Layout>
  )

  // Step 13: Location
  if (step === 'location') return (
    <Layout step={stepNum} totalSteps={TOTAL_STEPS} title="Konum bilgisi" subtitle="Müşterileriniz nerede sizi bulacak?" onBack={goBack}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input value={city} onChange={e => setCity(e.target.value)} placeholder="Şehir (örn: İstanbul)"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Adres (opsiyonel)"
          style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
        <div>
          <input value={estimatedCustomers} onChange={e => setEstimatedCustomers(e.target.value.replace(/\D/g, ''))}
            placeholder="Günlük ortalama müşteri sayısı (örn: 50)"
            inputMode="numeric"
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, background: 'white', border: '1px solid #e5e5e5', color: '#18181b', fontSize: 15, outline: 'none' }} />
          <p style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>Tahmini bir sayı yeterli — otomasyon sistemi için kullanılacak</p>
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <OnboardingButton label="Tamamla" onClick={completeOnboarding} loading={saving} disabled={!city.trim()} />
      </div>
    </Layout>
  )

  // Done
  if (step === 'done') return (
    <Layout step={TOTAL_STEPS} totalSteps={TOTAL_STEPS} title="Hazırsınız!" subtitle="Uygulamanız oluşturuldu. Dashboard'a geçebilirsiniz.">
      <div style={{ textAlign: 'center', padding: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FB3806', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
      </div>
      <OnboardingButton label="Dashboard'a Git" onClick={() => { router.push('/hub'); router.refresh() }} />
    </Layout>
  )

  return null
}

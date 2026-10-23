'use client'

import { ScopedTokenProvider } from '@/components/pwa-v2/token-provider'
import { PwaShell } from '@/components/pwa-v2/pwa-shell'
import type { PwaConfig } from '@/lib/pwa-tokens'

interface PwaPreviewProps {
  config: PwaConfig
  shopName: string
  logoUrl: string | null
  bannerUrl: string | null
  city: string
}

export function PwaPreview({ config, shopName, logoUrl, bannerUrl, city }: PwaPreviewProps) {
  return (
    <div
      className="w-[300px] h-[600px] rounded-[32px] border-[4px] border-gray-800 shadow-2xl relative"
      style={{ overflow: 'hidden' }}
    >
      <style>{`
        .onboarding-preview nav { position: absolute !important; }
        .onboarding-preview *::-webkit-scrollbar { display: none; }
        .onboarding-preview * { scrollbar-width: none; }
        .onboarding-preview .pwa-root { overflow-y: auto !important; max-height: 600px !important; }
      `}</style>
      <ScopedTokenProvider
        config={config}
        className="onboarding-preview"
        style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}
      >
        <PwaShell
          shopName={shopName || 'Kafe'}
          logoUrl={logoUrl || config.logo_url || null}
          bannerUrl={bannerUrl || config.banner_url || null}
          city={city || 'Istanbul'}
          customerId="preview"
          customerName="Ayşe Yılmaz"
          customerPhone="+90 532 *** ** 48"
          currentStamps={4}
          totalRequired={10}
          rewardName="Bedava Kahve"
          streak={3}
          totalVisits={23}
          totalStamps={4}
          totalRewards={2}
          lastVisits={[
            { date: 'Bugün 09:15', location: city || 'Kadıköy' },
            { date: 'Dün 14:30', location: city || 'Kadıköy' },
          ]}
          memberSince="Mart 2026"
          personalizedDeals={[
            { id: 'sana-1', name: 'Latte %20 indirim', description: 'Sadece senin için', discount_text: '%20' },
            { id: 'sana-2', name: 'Americano hediye', description: 'Seni özledik!', discount_text: 'Bedava' },
          ]}
          campaigns={[
            { id: 'mock', name: 'Hoş geldin', description: 'İlk ziyaretinde %15 indirim', discount_text: '%15' },
          ]}
          menuItems={[
            { id: 'm1', name: 'Espresso', price: 45, category: 'Kahve' },
            { id: 'm2', name: 'Americano', price: 55, category: 'Kahve' },
            { id: 'm3', name: 'Latte', price: 70, category: 'Kahve' },
            { id: 'm4', name: 'Cappuccino', price: 70, category: 'Kahve' },
          ]}
          onLogout={() => { /* no-op in preview */ }}
        />
      </ScopedTokenProvider>
    </div>
  )
}

'use client'

// Tab Magaza — Header + campaigns + menu + location/hours

import { useConfig } from './token-provider'
import { HEADER_VARIANTS, CAMPAIGN_VARIANTS, MENU_VARIANTS, SANA_OZEL_VARIANTS, CHALLENGE_VARIANTS } from './variant-renderer'

interface TabMagazaProps {
  orgSlug?: string
  locationId?: string | null
  shopName: string
  logoUrl: string | null
  bannerUrl: string | null
  city: string
  address?: string
  openingTime?: string
  closingTime?: string
  personalizedDeals?: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  campaigns: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  menuItems: { id: string; name: string; price: number; photoUrl?: string | null; category?: string; is_featured?: boolean }[]
  activeChallenge?: { title: string; description: string; targetCount: number; currentCount: number; daysRemaining: number; expiresAt?: string | null; rewardValue: number; rewardType: string } | null
  onCampaignPress?: (campaign: { id: string; name: string; discount_text?: string }) => void
}

export function TabMagaza(props: TabMagazaProps) {
  const config = useConfig()

  const Header = HEADER_VARIANTS[config.variant_header || 'header-logo-01'] ?? HEADER_VARIANTS['header-logo-01']
  const SanaOzel = SANA_OZEL_VARIANTS[config.variant_sana_ozel || 'sana-ozel-01'] ?? SANA_OZEL_VARIANTS['sana-ozel-01']
  const Campaign = CAMPAIGN_VARIANTS[config.variant_campaign || 'campaign-banner-01'] ?? CAMPAIGN_VARIANTS['campaign-banner-01']
  const Menu = MENU_VARIANTS[config.variant_menu || 'menu-compact-list'] ?? MENU_VARIANTS['menu-compact-list']
  const Challenge = CHALLENGE_VARIANTS[config.variant_challenge || 'challenge-card-01'] ?? CHALLENGE_VARIANTS['challenge-card-01']

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <Header
        shopName={props.shopName}
        logoUrl={props.logoUrl}
        bannerUrl={props.bannerUrl}
        city={props.city}
      />

      {/* Content */}
      <div style={{
        flex: 1,
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-xl)',
      }}>
        {/* Challenge — only show when active */}
        {props.activeChallenge && (
          <div className="stagger-1">
            <Challenge
              title={props.activeChallenge.title}
              description={props.activeChallenge.description}
              targetCount={props.activeChallenge.targetCount}
              currentCount={props.activeChallenge.currentCount}
              daysRemaining={props.activeChallenge.daysRemaining}
              expiresAt={props.activeChallenge.expiresAt}
              rewardValue={props.activeChallenge.rewardValue}
              rewardType={props.activeChallenge.rewardType}
              isEmpty={false}
            />
          </div>
        )}

        {/* Sana Ozel — personalized deals */}
        {(props.personalizedDeals?.length ?? 0) > 0 && (
          <div className="stagger-1">
            <SanaOzel campaigns={props.personalizedDeals!} onCampaignPress={props.onCampaignPress} />
          </div>
        )}

        {/* Campaigns */}
        {props.campaigns.length > 0 && (
          <div className="stagger-2">
            <Campaign campaigns={props.campaigns} onCampaignPress={props.onCampaignPress} />
          </div>
        )}

        {/* Menu */}
        {props.menuItems.length > 0 && (
          <div className="stagger-3">
            <Menu items={props.menuItems} />
          </div>
        )}

        {/* Location & hours */}
        <div className="stagger-4" style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-muted)" strokeWidth="1.5">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>
              {props.address || props.city}
            </p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-faint)', marginTop: 2 }}>
              {props.openingTime || '09:00'} - {props.closingTime || '23:00'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

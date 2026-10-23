'use client'

// Single Page — All sections stacked in one scrollable view, no nav bar
// Order: Header → Stamp + Activity → Campaigns → Menu → Location → Profile

import { useConfig } from './token-provider'
import { HEADER_VARIANTS, STAMP_VARIANTS, ACTIVITY_VARIANTS, CAMPAIGN_VARIANTS, MENU_VARIANTS, PROFILE_VARIANTS } from './variant-renderer'

interface SinglePageProps {
  // Shop
  shopName: string
  logoUrl: string | null
  bannerUrl: string | null
  city: string
  address?: string
  openingTime?: string
  closingTime?: string
  // Loyalty
  currentStamps: number
  totalRequired: number
  rewardName: string
  // Activity
  streak: number
  totalVisits: number
  totalRewards: number
  lastVisits: { date: string; location: string }[]
  memberSince: string
  // Data
  campaigns: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  menuItems: { id: string; name: string; price: number; photoUrl?: string | null; category?: string; is_featured?: boolean }[]
  // Profile
  customerName: string
  customerPhone: string
  totalStamps: number
  onLogout: () => void
}

export function SinglePage(props: SinglePageProps) {
  const config = useConfig()

  const Header = HEADER_VARIANTS[config.variant_header || 'header-logo-01'] ?? HEADER_VARIANTS['header-logo-01']
  const Stamp = STAMP_VARIANTS[config.variant_stamp || 'stamp-minimal-01'] ?? STAMP_VARIANTS['stamp-minimal-01']
  const Activity = ACTIVITY_VARIANTS[config.variant_activity || 'activity-timeline-01'] ?? ACTIVITY_VARIANTS['activity-timeline-01']
  const Campaign = CAMPAIGN_VARIANTS[config.variant_campaign || 'campaign-banner-01'] ?? CAMPAIGN_VARIANTS['campaign-banner-01']
  const Menu = MENU_VARIANTS[config.variant_menu || 'menu-compact-list'] ?? MENU_VARIANTS['menu-compact-list']
  const Profile = PROFILE_VARIANTS[config.variant_profile || 'profile-card-01'] ?? PROFILE_VARIANTS['profile-card-01']

  // Section divider
  const Divider = () => (
    <div style={{
      height: 1,
      background: 'var(--color-divider)',
      margin: `var(--space-md) 0`,
    }} />
  )

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      containerType: 'inline-size',
    }}>
      {/* Header */}
      <Header
        shopName={props.shopName}
        logoUrl={props.logoUrl}
        bannerUrl={props.bannerUrl}
        city={props.city}
      />

      {/* All content sections */}
      <div style={{
        flex: 1,
        padding: 'var(--space-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-lg)',
      }}>
        {/* Stamp card */}
        <Stamp
          current={props.currentStamps}
          total={props.totalRequired}
          rewardName={props.rewardName}
        />

        {/* Activity */}
        <Activity
          streak={props.streak}
          totalVisits={props.totalVisits}
          totalRewards={props.totalRewards}
          lastVisits={props.lastVisits}
          memberSince={props.memberSince}
        />

        <Divider />

        {/* Campaigns */}
        {props.campaigns.length > 0 && (
          <>
            <Campaign campaigns={props.campaigns} />
            <Divider />
          </>
        )}

        {/* Menu */}
        {props.menuItems.length > 0 && (
          <>
            <Menu items={props.menuItems} />
            <Divider />
          </>
        )}

        {/* Location */}
        <div style={{
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
          <div>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-text)' }}>
              {props.address || props.city}
            </p>
            <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-faint)', marginTop: 2 }}>
              {props.openingTime || '09:00'} - {props.closingTime || '23:00'}
            </p>
          </div>
        </div>

        <Divider />

        {/* Profile + settings */}
        <Profile
          name={props.customerName}
          phone={props.customerPhone}
          totalVisits={props.totalVisits}
          totalStamps={props.totalStamps}
          totalRewards={props.totalRewards}
          onLogout={props.onLogout}
        />
      </div>
    </div>
  )
}

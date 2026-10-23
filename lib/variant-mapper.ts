// Maps questionnaire answers to specific component variants
// Called during onboarding save to pick which variants each org gets

import type { PwaConfig } from './pwa-tokens'

// Variant pools per category
const STAMP_VARIANTS = {
  realistic: ['stamp-realistic-01', 'stamp-realistic-02', 'stamp-realistic-03', 'stamp-gold-card', 'stamp-passport'],
  minimal: ['stamp-minimal-01', 'stamp-minimal-02', 'stamp-minimal-03', 'stamp-minimal-04', 'stamp-neon-glow'],
  playful: ['stamp-playful-01', 'stamp-playful-02', 'stamp-playful-03', 'stamp-coffee-cup'],
}

const HEADER_VARIANTS = {
  with_banner: ['header-photo-01', 'header-photo-02', 'header-photo-03'],
  with_logo: ['header-logo-01', 'header-logo-02', 'header-logo-03', 'header-gradient-02'],
  no_assets: ['header-minimal-01', 'header-minimal-02', 'header-gradient-01'],
}

const MENU_VARIANTS = {
  with_photos: ['menu-photo-cards', 'menu-stacked-images', 'menu-featured-hero', 'menu-photo-grid-large', 'menu-photo-rows', 'menu-photo-mosaic'],
  without_photos: ['menu-compact-list', 'menu-category-sections', 'menu-minimal-rows', 'menu-numbered-list', 'menu-split-price', 'menu-icon-rows', 'menu-pill-tags', 'menu-collapsible'],
}

const CAMPAIGN_VARIANTS = {
  premium: ['campaign-banner-02', 'campaign-split-01', 'campaign-neon-01', 'campaign-fullbleed-01'],
  craft: ['campaign-ticket-01', 'campaign-card-01', 'campaign-banner-01'],
  cozy: ['campaign-card-01', 'campaign-banner-01', 'campaign-mosaic-01'],
  modern: ['campaign-inline-01', 'campaign-countdown-01', 'campaign-split-01'],
}

const SANA_OZEL_VARIANTS = {
  premium: ['sana-ozel-02', 'sana-ozel-06', 'sana-ozel-07', 'sana-ozel-09'],
  craft: ['sana-ozel-08', 'sana-ozel-03', 'sana-ozel-01'],
  cozy: ['sana-ozel-03', 'sana-ozel-01', 'sana-ozel-10'],
  modern: ['sana-ozel-04', 'sana-ozel-05', 'sana-ozel-06'],
}

const ACTIVITY_VARIANTS = {
  premium: ['activity-timeline-01', 'activity-minimal-01'],
  craft: ['activity-compact-01', 'activity-timeline-01'],
  cozy: ['activity-streak-01', 'activity-achievement-01'],
  modern: ['activity-minimal-01', 'activity-compact-01'],
}

const PROFILE_VARIANTS = {
  premium: ['profile-hero-01', 'profile-split-01'],
  craft: ['profile-card-01', 'profile-split-01'],
  cozy: ['profile-card-01', 'profile-hero-01'],
  modern: ['profile-minimal-01', 'profile-split-01'],
}

const NAV_VARIANTS = {
  tabs: ['nav-bottom-bar', 'nav-floating-island', 'nav-tab-pills', 'nav-minimal-dots'],
  'single-page': [] as string[], // no nav for single page
}

const CHALLENGE_POOL = {
  premium: ['challenge-glass-01', 'challenge-banner-01', 'challenge-card-01'],
  craft: ['challenge-ticket-01', 'challenge-card-01', 'challenge-banner-01'],
  cozy: ['challenge-card-01', 'challenge-minimal-01', 'challenge-banner-01'],
  modern: ['challenge-minimal-01', 'challenge-banner-01', 'challenge-glass-01'],
}

// Deterministic pick — uses a seed string to always pick the same item from an array
function deterministicPick<T>(arr: T[], seed: string): T {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % arr.length
  return arr[index]
}

export function mapAnswersToVariants(config: Partial<PwaConfig>): {
  variant_stamp: string
  variant_activity: string
  variant_header: string
  variant_menu: string
  variant_campaign: string
  variant_sana_ozel: string
  variant_profile: string
  variant_nav: string
  variant_challenge: string
} {
  const style = config.shop_style || 'premium'
  const stampFeel = config.stamp_feel || 'minimal'
  const hasBanner = !!config.banner_url
  const hasLogo = !!config.logo_url
  const hasPhotos = config.has_product_photos || false
  const layout = config.layout || 'tabs'
  const color = config.brand_color || '#d97706'

  // Seed for deterministic picks — same config always produces same variants
  // brand_color provides cross-org variety (different cafes get different picks within same pool)
  const baseSeed = `${color}-${style}-${stampFeel}-${config.shape || 'round'}-${config.font_personality || 'clean'}`

  // Stamp — based on stamp_feel
  const stampPool = STAMP_VARIANTS[stampFeel] || STAMP_VARIANTS.minimal
  const variant_stamp = deterministicPick(stampPool, baseSeed + '-stamp')

  // Activity — based on shop_style
  const activityPool = ACTIVITY_VARIANTS[style] || ACTIVITY_VARIANTS.premium
  const variant_activity = deterministicPick(activityPool, baseSeed + '-activity')

  // Header — based on banner/logo availability
  const headerPool = hasBanner
    ? HEADER_VARIANTS.with_banner
    : hasLogo
      ? HEADER_VARIANTS.with_logo
      : HEADER_VARIANTS.no_assets
  const variant_header = deterministicPick(headerPool, baseSeed + '-header')

  // Menu — layout-aware picking
  const lh = config._layout_hints
  let variant_menu: string
  if (lh && lh.dominant !== 'unknown') {
    // Direct layout pattern → variant matching
    // IMPORTANT: has_product_photos always overrides textOnly/denseList layout
    const layoutMenuMap: Record<string, string> = {
      stackedFullWidth: 'menu-stacked-images',
      cardGrid: hasPhotos ? 'menu-photo-cards' : 'menu-compact-list',
      thumbnailRows: hasPhotos ? 'menu-photo-rows' : 'menu-icon-rows',
      textOverlay: hasPhotos ? 'menu-photo-grid-large' : 'menu-featured-hero',
      heroImage: hasPhotos ? 'menu-featured-hero' : 'menu-compact-list',
      mosaicMixed: hasPhotos ? 'menu-photo-mosaic' : 'menu-pill-tags',
      textOnly: hasPhotos ? 'menu-photo-cards' : 'menu-minimal-rows',
      denseList: hasPhotos ? 'menu-icon-rows' : 'menu-compact-list',
    }
    variant_menu = layoutMenuMap[lh.dominant] || deterministicPick(
      hasPhotos ? MENU_VARIANTS.with_photos : MENU_VARIANTS.without_photos,
      baseSeed + '-menu'
    )
  } else {
    const menuPool = hasPhotos ? MENU_VARIANTS.with_photos : MENU_VARIANTS.without_photos
    variant_menu = deterministicPick(menuPool, baseSeed + '-menu')
  }

  // Campaign — layout-aware picking
  let variant_campaign: string
  if (lh && lh.dominant !== 'unknown') {
    const layoutCampaignMap: Record<string, string> = {
      stackedFullWidth: 'campaign-fullbleed-01',
      cardGrid: 'campaign-mosaic-01',
      thumbnailRows: 'campaign-split-01',
      textOverlay: 'campaign-banner-02',
      heroImage: 'campaign-fullbleed-01',
      mosaicMixed: 'campaign-mosaic-01',
      textOnly: 'campaign-inline-01',
      denseList: 'campaign-card-01',
    }
    variant_campaign = layoutCampaignMap[lh.dominant] || deterministicPick(
      CAMPAIGN_VARIANTS[style] || CAMPAIGN_VARIANTS.premium,
      baseSeed + '-campaign'
    )
  } else {
    const campaignPool = CAMPAIGN_VARIANTS[style] || CAMPAIGN_VARIANTS.premium
    variant_campaign = deterministicPick(campaignPool, baseSeed + '-campaign')
  }

  // Sana Ozel — mirrors campaign style mapping
  const sanaOzelPool = SANA_OZEL_VARIANTS[style] || SANA_OZEL_VARIANTS.premium
  const variant_sana_ozel = deterministicPick(sanaOzelPool, baseSeed + '-sana-ozel')

  // Profile — based on shop_style
  const profilePool = PROFILE_VARIANTS[style] || PROFILE_VARIANTS.premium
  const variant_profile = deterministicPick(profilePool, baseSeed + '-profile')

  // Nav — based on layout
  const navPool = NAV_VARIANTS[layout]
  const variant_nav = navPool.length > 0 ? deterministicPick(navPool, baseSeed + '-nav') : 'nav-bottom-bar'

  // Challenge — based on shop_style
  const challengePool = CHALLENGE_POOL[style] || CHALLENGE_POOL.premium
  const variant_challenge = deterministicPick(challengePool, baseSeed + '-challenge')

  return {
    variant_stamp,
    variant_activity,
    variant_header,
    variant_menu,
    variant_campaign,
    variant_sana_ozel,
    variant_profile,
    variant_nav,
    variant_challenge,
  }
}

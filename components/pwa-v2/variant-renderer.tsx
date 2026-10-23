'use client'

// Variant Renderer — maps variant name strings to actual components
// Used by tab shells to render the correct variant based on pwa_config

import dynamic from 'next/dynamic'

// Stamp variants
import type { StampCardProps } from './variants/stamp-types'
import type { NavProps } from './variants/nav-types'
const StampMinimal01 = dynamic(() => import('./variants/stamp-minimal-01').then(m => ({ default: m.StampMinimal01 })))
const StampMinimal02 = dynamic(() => import('./variants/stamp-minimal-02').then(m => ({ default: m.StampMinimal02 })))
const StampMinimal03 = dynamic(() => import('./variants/stamp-minimal-03').then(m => ({ default: m.StampMinimal03 })))
const StampMinimal04 = dynamic(() => import('./variants/stamp-minimal-04').then(m => ({ default: m.StampMinimal04 })))
const StampRealistic01 = dynamic(() => import('./variants/stamp-realistic-01').then(m => ({ default: m.StampRealistic01 })))
const StampRealistic02 = dynamic(() => import('./variants/stamp-realistic-02').then(m => ({ default: m.StampRealistic02 })))
const StampRealistic03 = dynamic(() => import('./variants/stamp-realistic-03').then(m => ({ default: m.StampRealistic03 })))
const StampPlayful01 = dynamic(() => import('./variants/stamp-playful-01').then(m => ({ default: m.StampPlayful01 })))
const StampPlayful02 = dynamic(() => import('./variants/stamp-playful-02').then(m => ({ default: m.StampPlayful02 })))
const StampPlayful03 = dynamic(() => import('./variants/stamp-playful-03').then(m => ({ default: m.StampPlayful03 })))
const StampGoldCard = dynamic(() => import('./variants/stamp-gold-card').then(m => ({ default: m.StampGoldCard })))
const StampCoffeeCup = dynamic(() => import('./variants/stamp-coffee-cup').then(m => ({ default: m.StampCoffeeCup })))
const StampNeonGlow = dynamic(() => import('./variants/stamp-neon-glow').then(m => ({ default: m.StampNeonGlow })))
const StampPassport = dynamic(() => import('./variants/stamp-passport').then(m => ({ default: m.StampPassport })))
// Stamp variants — v2 (Designkit-driven rework: better animations, brand-derived gradients via tokens, integrated streak)
const StampMinimal01V2 = dynamic(() => import('./variants/stamp-minimal-01-v2').then(m => ({ default: m.StampMinimal01V2 })))
const StampMinimal02V2 = dynamic(() => import('./variants/stamp-minimal-02-v2').then(m => ({ default: m.StampMinimal02V2 })))
const StampRealistic01V2 = dynamic(() => import('./variants/stamp-realistic-01-v2').then(m => ({ default: m.StampRealistic01V2 })))
const StampRealistic03V2 = dynamic(() => import('./variants/stamp-realistic-03-v2').then(m => ({ default: m.StampRealistic03V2 })))
const StampPlayful01V2 = dynamic(() => import('./variants/stamp-playful-01-v2').then(m => ({ default: m.StampPlayful01V2 })))
const StampPlayful02V2 = dynamic(() => import('./variants/stamp-playful-02-v2').then(m => ({ default: m.StampPlayful02V2 })))
const StampPlayful03V2 = dynamic(() => import('./variants/stamp-playful-03-v2').then(m => ({ default: m.StampPlayful03V2 })))
const StampCoffeeCupV2 = dynamic(() => import('./variants/stamp-coffee-cup-v2').then(m => ({ default: m.StampCoffeeCupV2 })))
const StampNeonGlowV2 = dynamic(() => import('./variants/stamp-neon-glow-v2').then(m => ({ default: m.StampNeonGlowV2 })))
const StampPassportV2 = dynamic(() => import('./variants/stamp-passport-v2').then(m => ({ default: m.StampPassportV2 })))

// Activity variants
const ActivityTimeline01 = dynamic(() => import('./variants/activity-timeline-01').then(m => ({ default: m.ActivityTimeline01 })))
const ActivityCompact01 = dynamic(() => import('./variants/activity-compact-01').then(m => ({ default: m.ActivityCompact01 })))
const ActivityStreak01 = dynamic(() => import('./variants/activity-streak-01').then(m => ({ default: m.ActivityStreak01 })))
const ActivityMinimal01 = dynamic(() => import('./variants/activity-minimal-01').then(m => ({ default: m.ActivityMinimal01 })))
const ActivityAchievement01 = dynamic(() => import('./variants/activity-achievement-01').then(m => ({ default: m.ActivityAchievement01 })))

// Header variants
const HeaderPhoto01 = dynamic(() => import('./variants/header-photo-01').then(m => ({ default: m.HeaderPhoto01 })))
const HeaderPhoto02 = dynamic(() => import('./variants/header-photo-02').then(m => ({ default: m.HeaderPhoto02 })))
const HeaderPhoto03 = dynamic(() => import('./variants/header-photo-03').then(m => ({ default: m.HeaderPhoto03 })))
const HeaderLogo01 = dynamic(() => import('./variants/header-logo-01').then(m => ({ default: m.HeaderLogo01 })))
const HeaderLogo02 = dynamic(() => import('./variants/header-logo-02').then(m => ({ default: m.HeaderLogo02 })))
const HeaderLogo03 = dynamic(() => import('./variants/header-logo-03').then(m => ({ default: m.HeaderLogo03 })))
const HeaderMinimal01 = dynamic(() => import('./variants/header-minimal-01').then(m => ({ default: m.HeaderMinimal01 })))
const HeaderMinimal02 = dynamic(() => import('./variants/header-minimal-02').then(m => ({ default: m.HeaderMinimal02 })))
const HeaderGradient01 = dynamic(() => import('./variants/header-gradient-01').then(m => ({ default: m.HeaderGradient01 })))
const HeaderGradient02 = dynamic(() => import('./variants/header-gradient-02').then(m => ({ default: m.HeaderGradient02 })))
// Header variants — v2 reworks (kept: photo trio + gradient hero — others were too close to originals to add value)
// Header variants — net-new creative directions
const HeaderMarquee = dynamic(() => import('./variants/header-marquee').then(m => ({ default: m.HeaderMarquee })))
const HeaderStampCrown = dynamic(() => import('./variants/header-stamp-crown').then(m => ({ default: m.HeaderStampCrown })))
const HeaderLiquid = dynamic(() => import('./variants/header-liquid').then(m => ({ default: m.HeaderLiquid })))
const HeaderVertical = dynamic(() => import('./variants/header-vertical').then(m => ({ default: m.HeaderVertical })))

// Menu variants
const MenuCompactList = dynamic(() => import('./variants/menu-compact-list').then(m => ({ default: m.MenuCompactList })))
const MenuPhotoCards = dynamic(() => import('./variants/menu-photo-cards').then(m => ({ default: m.MenuPhotoCards })))
const MenuCategorySections = dynamic(() => import('./variants/menu-category-sections').then(m => ({ default: m.MenuCategorySections })))
const MenuMinimalRows = dynamic(() => import('./variants/menu-minimal-rows').then(m => ({ default: m.MenuMinimalRows })))
const MenuFeaturedHero = dynamic(() => import('./variants/menu-featured-hero').then(m => ({ default: m.MenuFeaturedHero })))
const MenuPillTags = dynamic(() => import('./variants/menu-pill-tags').then(m => ({ default: m.MenuPillTags })))
const MenuNumberedList = dynamic(() => import('./variants/menu-numbered-list').then(m => ({ default: m.MenuNumberedList })))
const MenuSplitPrice = dynamic(() => import('./variants/menu-split-price').then(m => ({ default: m.MenuSplitPrice })))
const MenuIconRows = dynamic(() => import('./variants/menu-icon-rows').then(m => ({ default: m.MenuIconRows })))
const MenuStackedImages = dynamic(() => import('./variants/menu-stacked-images').then(m => ({ default: m.MenuStackedImages })))
const MenuCollapsible = dynamic(() => import('./variants/menu-collapsible').then(m => ({ default: m.MenuCollapsible })))
const MenuPhotoGridLarge = dynamic(() => import('./variants/menu-photo-grid-large').then(m => ({ default: m.MenuPhotoGridLarge })))
const MenuPhotoRows = dynamic(() => import('./variants/menu-photo-rows').then(m => ({ default: m.MenuPhotoRows })))
const MenuPhotoMosaic = dynamic(() => import('./variants/menu-photo-mosaic').then(m => ({ default: m.MenuPhotoMosaic })))
// Menu — designkit-explore wave: 8 net-new structural patterns
const MenuDayDrift = dynamic(() => import('./variants/menu-day-drift').then(m => ({ default: m.MenuDayDrift })))
const MenuStoryStream = dynamic(() => import('./variants/menu-story-stream').then(m => ({ default: m.MenuStoryStream })))
const MenuSwipeStack = dynamic(() => import('./variants/menu-swipe-stack').then(m => ({ default: m.MenuSwipeStack })))
const MenuMosaicWall = dynamic(() => import('./variants/menu-mosaic-wall').then(m => ({ default: m.MenuMosaicWall })))
const MenuConversation = dynamic(() => import('./variants/menu-conversation').then(m => ({ default: m.MenuConversation })))
const MenuCarouselTrays = dynamic(() => import('./variants/menu-carousel-trays').then(m => ({ default: m.MenuCarouselTrays })))
const MenuMagazineSpread = dynamic(() => import('./variants/menu-magazine-spread').then(m => ({ default: m.MenuMagazineSpread })))

// Campaign variants
const CampaignBanner01 = dynamic(() => import('./variants/campaign-banner-01').then(m => ({ default: m.CampaignBanner01 })))
const CampaignBanner02 = dynamic(() => import('./variants/campaign-banner-02').then(m => ({ default: m.CampaignBanner02 })))
const CampaignCard01 = dynamic(() => import('./variants/campaign-card-01').then(m => ({ default: m.CampaignCard01 })))
const CampaignInline01 = dynamic(() => import('./variants/campaign-inline-01').then(m => ({ default: m.CampaignInline01 })))
const CampaignCountdown01 = dynamic(() => import('./variants/campaign-countdown-01').then(m => ({ default: m.CampaignCountdown01 })))
const CampaignSplit01 = dynamic(() => import('./variants/campaign-split-01').then(m => ({ default: m.CampaignSplit01 })))
const CampaignNeon01 = dynamic(() => import('./variants/campaign-neon-01').then(m => ({ default: m.CampaignNeon01 })))
const CampaignTicket01 = dynamic(() => import('./variants/campaign-ticket-01').then(m => ({ default: m.CampaignTicket01 })))
const CampaignFullbleed01 = dynamic(() => import('./variants/campaign-fullbleed-01').then(m => ({ default: m.CampaignFullbleed01 })))
const CampaignMosaic01 = dynamic(() => import('./variants/campaign-mosaic-01').then(m => ({ default: m.CampaignMosaic01 })))
// Campaign — designkit-explore wave (3 net-new)
const CampaignFrontPage = dynamic(() => import('./variants/campaign-front-page').then(m => ({ default: m.CampaignFrontPage })))
const CampaignCouponStack = dynamic(() => import('./variants/campaign-coupon-stack').then(m => ({ default: m.CampaignCouponStack })))
const CampaignProductShowcase = dynamic(() => import('./variants/campaign-product-showcase').then(m => ({ default: m.CampaignProductShowcase })))

// Sana Ozel variants
const SanaOzel01 = dynamic(() => import('./variants/sana-ozel-01').then(m => ({ default: m.SanaOzel01 })))
const SanaOzel02 = dynamic(() => import('./variants/sana-ozel-02').then(m => ({ default: m.SanaOzel02 })))
const SanaOzel03 = dynamic(() => import('./variants/sana-ozel-03').then(m => ({ default: m.SanaOzel03 })))
const SanaOzel04 = dynamic(() => import('./variants/sana-ozel-04').then(m => ({ default: m.SanaOzel04 })))
const SanaOzel05 = dynamic(() => import('./variants/sana-ozel-05').then(m => ({ default: m.SanaOzel05 })))
const SanaOzel06 = dynamic(() => import('./variants/sana-ozel-06').then(m => ({ default: m.SanaOzel06 })))
const SanaOzel07 = dynamic(() => import('./variants/sana-ozel-07').then(m => ({ default: m.SanaOzel07 })))
const SanaOzel08 = dynamic(() => import('./variants/sana-ozel-08').then(m => ({ default: m.SanaOzel08 })))
const SanaOzel09 = dynamic(() => import('./variants/sana-ozel-09').then(m => ({ default: m.SanaOzel09 })))
const SanaOzel10 = dynamic(() => import('./variants/sana-ozel-10').then(m => ({ default: m.SanaOzel10 })))
// Sana Özel — designkit-explore wave: 8 net-new structural patterns serving distinct jobs
const SanaOzelRevealScratch = dynamic(() => import('./variants/sana-ozel-reveal-scratch').then(m => ({ default: m.SanaOzelRevealScratch })))
const SanaOzelWhyYou = dynamic(() => import('./variants/sana-ozel-why-you').then(m => ({ default: m.SanaOzelWhyYou })))
const SanaOzelCountdown = dynamic(() => import('./variants/sana-ozel-countdown').then(m => ({ default: m.SanaOzelCountdown })))
const SanaOzelStack = dynamic(() => import('./variants/sana-ozel-stack').then(m => ({ default: m.SanaOzelStack })))
const SanaOzelSpotlight = dynamic(() => import('./variants/sana-ozel-spotlight').then(m => ({ default: m.SanaOzelSpotlight })))
const SanaOzelConversation = dynamic(() => import('./variants/sana-ozel-conversation').then(m => ({ default: m.SanaOzelConversation })))
const SanaOzelTimeline = dynamic(() => import('./variants/sana-ozel-timeline').then(m => ({ default: m.SanaOzelTimeline })))
const SanaOzelGift = dynamic(() => import('./variants/sana-ozel-gift').then(m => ({ default: m.SanaOzelGift })))

// Profile variants
const ProfileCard01 = dynamic(() => import('./variants/profile-card-01').then(m => ({ default: m.ProfileCard01 })))
const ProfileMinimal01 = dynamic(() => import('./variants/profile-minimal-01').then(m => ({ default: m.ProfileMinimal01 })))
const ProfileHero01 = dynamic(() => import('./variants/profile-hero-01').then(m => ({ default: m.ProfileHero01 })))
const ProfileSplit01 = dynamic(() => import('./variants/profile-split-01').then(m => ({ default: m.ProfileSplit01 })))

// Nav variants
const NavBottomBar = dynamic(() => import('./variants/nav-bottom-bar').then(m => ({ default: m.NavBottomBar })))
const NavFloatingIsland = dynamic(() => import('./variants/nav-floating-island').then(m => ({ default: m.NavFloatingIsland })))
const NavMinimalDots = dynamic(() => import('./variants/nav-minimal-dots').then(m => ({ default: m.NavMinimalDots })))
const NavTabPills = dynamic(() => import('./variants/nav-tab-pills').then(m => ({ default: m.NavTabPills })))

// Challenge variants
const ChallengeCard01 = dynamic(() => import('./variants/challenge-card-01').then(m => ({ default: m.ChallengeCard01 })))
const ChallengeBanner01 = dynamic(() => import('./variants/challenge-banner-01').then(m => ({ default: m.ChallengeBanner01 })))
const ChallengeMinimal01 = dynamic(() => import('./variants/challenge-minimal-01').then(m => ({ default: m.ChallengeMinimal01 })))
const ChallengeTicket01 = dynamic(() => import('./variants/challenge-ticket-01').then(m => ({ default: m.ChallengeTicket01 })))
const ChallengeGlass01 = dynamic(() => import('./variants/challenge-glass-01').then(m => ({ default: m.ChallengeGlass01 })))
// Challenge — designkit-explore wave (5 net-new)
const ChallengeXpBar = dynamic(() => import('./variants/challenge-xp-bar').then(m => ({ default: m.ChallengeXpBar })))
const ChallengeStepMap = dynamic(() => import('./variants/challenge-step-map').then(m => ({ default: m.ChallengeStepMap })))
const ChallengeCalendarGrid = dynamic(() => import('./variants/challenge-calendar-grid').then(m => ({ default: m.ChallengeCalendarGrid })))
const ChallengeHabitTracker = dynamic(() => import('./variants/challenge-habit-tracker').then(m => ({ default: m.ChallengeHabitTracker })))
const ChallengeCountdownCoin = dynamic(() => import('./variants/challenge-countdown-coin').then(m => ({ default: m.ChallengeCountdownCoin })))

// === Registries ===

export const STAMP_VARIANTS: Record<string, React.ComponentType<StampCardProps>> = {
  'stamp-minimal-01': StampMinimal01,
  'stamp-minimal-02': StampMinimal02,
  'stamp-minimal-03': StampMinimal03,
  'stamp-minimal-04': StampMinimal04,
  'stamp-realistic-01': StampRealistic01,
  'stamp-realistic-02': StampRealistic02,
  'stamp-realistic-03': StampRealistic03,
  'stamp-playful-01': StampPlayful01,
  'stamp-playful-02': StampPlayful02,
  'stamp-playful-03': StampPlayful03,
  'stamp-gold-card': StampGoldCard,
  'stamp-coffee-cup': StampCoffeeCup,
  'stamp-neon-glow': StampNeonGlow,
  'stamp-passport': StampPassport,
  // v2 reworks
  'stamp-minimal-01-v2': StampMinimal01V2,
  'stamp-minimal-02-v2': StampMinimal02V2,
  'stamp-realistic-01-v2': StampRealistic01V2,
  'stamp-realistic-03-v2': StampRealistic03V2,
  'stamp-playful-01-v2': StampPlayful01V2,
  'stamp-playful-02-v2': StampPlayful02V2,
  'stamp-playful-03-v2': StampPlayful03V2,
  'stamp-coffee-cup-v2': StampCoffeeCupV2,
  'stamp-neon-glow-v2': StampNeonGlowV2,
  'stamp-passport-v2': StampPassportV2,
}

export const ACTIVITY_VARIANTS: Record<string, React.ComponentType<{
  streak: number; totalVisits: number; totalRewards: number;
  lastVisits: { date: string; location: string }[]; memberSince: string
}>> = {
  'activity-timeline-01': ActivityTimeline01,
  'activity-compact-01': ActivityCompact01,
  'activity-streak-01': ActivityStreak01,
  'activity-minimal-01': ActivityMinimal01,
  'activity-achievement-01': ActivityAchievement01,
}

export const HEADER_VARIANTS: Record<string, React.ComponentType<{
  shopName: string; logoUrl: string | null; bannerUrl: string | null; city: string
}>> = {
  'header-photo-01': HeaderPhoto01,
  'header-photo-02': HeaderPhoto02,
  'header-photo-03': HeaderPhoto03,
  'header-logo-01': HeaderLogo01,
  'header-logo-02': HeaderLogo02,
  'header-logo-03': HeaderLogo03,
  'header-minimal-01': HeaderMinimal01,
  'header-minimal-02': HeaderMinimal02,
  'header-gradient-01': HeaderGradient01,
  'header-gradient-02': HeaderGradient02,
  // v2 reworks (photo trio + gradient hero only — others removed as too-close-to-original)
  // creative directions
  'header-marquee': HeaderMarquee,
  'header-stamp-crown': HeaderStampCrown,
  'header-liquid': HeaderLiquid,
  'header-vertical': HeaderVertical,
}

export const MENU_VARIANTS: Record<string, React.ComponentType<{
  items: { id: string; name: string; price: number; photoUrl?: string | null; category?: string; is_featured?: boolean }[];
  currency?: string
}>> = {
  'menu-compact-list': MenuCompactList,
  'menu-photo-cards': MenuPhotoCards,
  'menu-category-sections': MenuCategorySections,
  'menu-minimal-rows': MenuMinimalRows,
  'menu-featured-hero': MenuFeaturedHero,
  'menu-pill-tags': MenuPillTags,
  'menu-numbered-list': MenuNumberedList,
  'menu-split-price': MenuSplitPrice,
  'menu-icon-rows': MenuIconRows,
  'menu-stacked-images': MenuStackedImages,
  'menu-collapsible': MenuCollapsible,
  'menu-photo-grid-large': MenuPhotoGridLarge,
  'menu-photo-rows': MenuPhotoRows,
  'menu-photo-mosaic': MenuPhotoMosaic,
  // designkit-explore wave (registered, not yet in mapper auto-pick pool)
  'menu-day-drift': MenuDayDrift,
  'menu-story-stream': MenuStoryStream,
  'menu-swipe-stack': MenuSwipeStack,
  'menu-mosaic-wall': MenuMosaicWall,
  'menu-conversation': MenuConversation,
  'menu-carousel-trays': MenuCarouselTrays,
  'menu-magazine-spread': MenuMagazineSpread,
}

export const CAMPAIGN_VARIANTS: Record<string, React.ComponentType<{
  campaigns: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  onCampaignPress?: (campaign: { id: string; name: string; discount_text?: string }) => void
}>> = {
  'campaign-banner-01': CampaignBanner01,
  'campaign-banner-02': CampaignBanner02,
  'campaign-card-01': CampaignCard01,
  'campaign-inline-01': CampaignInline01,
  'campaign-countdown-01': CampaignCountdown01,
  'campaign-split-01': CampaignSplit01,
  'campaign-neon-01': CampaignNeon01,
  'campaign-ticket-01': CampaignTicket01,
  'campaign-fullbleed-01': CampaignFullbleed01,
  'campaign-mosaic-01': CampaignMosaic01,
  // designkit-explore wave (registered, not yet in mapper auto-pick pool)
  'campaign-front-page': CampaignFrontPage,
  'campaign-coupon-stack': CampaignCouponStack,
  'campaign-product-showcase': CampaignProductShowcase,
}

export const SANA_OZEL_VARIANTS: Record<string, React.ComponentType<{
  campaigns: { id: string; name: string; description?: string; discount_text?: string; valid_until?: string; type?: string }[]
  onCampaignPress?: (campaign: { id: string; name: string; discount_text?: string }) => void
}>> = {
  'sana-ozel-01': SanaOzel01,
  'sana-ozel-02': SanaOzel02,
  'sana-ozel-03': SanaOzel03,
  'sana-ozel-04': SanaOzel04,
  'sana-ozel-05': SanaOzel05,
  'sana-ozel-06': SanaOzel06,
  'sana-ozel-07': SanaOzel07,
  'sana-ozel-08': SanaOzel08,
  'sana-ozel-09': SanaOzel09,
  'sana-ozel-10': SanaOzel10,
  // designkit-explore wave (registered, not yet in mapper auto-pick pool)
  'sana-ozel-reveal-scratch': SanaOzelRevealScratch,
  'sana-ozel-why-you': SanaOzelWhyYou,
  'sana-ozel-countdown': SanaOzelCountdown,
  'sana-ozel-stack': SanaOzelStack,
  'sana-ozel-spotlight': SanaOzelSpotlight,
  'sana-ozel-conversation': SanaOzelConversation,
  'sana-ozel-timeline': SanaOzelTimeline,
  'sana-ozel-gift': SanaOzelGift,
}

export const PROFILE_VARIANTS: Record<string, React.ComponentType<{
  name: string; phone: string; totalVisits: number; totalStamps: number; totalRewards: number; longestStreak?: number; onLogout: () => void
}>> = {
  'profile-card-01': ProfileCard01,
  'profile-minimal-01': ProfileMinimal01,
  'profile-hero-01': ProfileHero01,
  'profile-split-01': ProfileSplit01,
}

export const NAV_VARIANTS: Record<string, React.ComponentType<NavProps>> = {
  'nav-bottom-bar': NavBottomBar,
  'nav-floating-island': NavFloatingIsland,
  'nav-minimal-dots': NavMinimalDots,
  'nav-tab-pills': NavTabPills,
}

export const CHALLENGE_VARIANTS: Record<string, React.ComponentType<{
  title: string; description: string; targetCount: number; currentCount: number; daysRemaining: number; expiresAt?: string | null; rewardValue: number; rewardType: string; isEmpty?: boolean
}>> = {
  'challenge-card-01': ChallengeCard01,
  'challenge-banner-01': ChallengeBanner01,
  'challenge-minimal-01': ChallengeMinimal01,
  'challenge-ticket-01': ChallengeTicket01,
  'challenge-glass-01': ChallengeGlass01,
  // designkit-explore wave (registered, not yet in mapper auto-pick pool)
  'challenge-xp-bar': ChallengeXpBar,
  'challenge-step-map': ChallengeStepMap,
  'challenge-calendar-grid': ChallengeCalendarGrid,
  'challenge-habit-tracker': ChallengeHabitTracker,
  'challenge-countdown-coin': ChallengeCountdownCoin,
}

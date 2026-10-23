'use client'

// Tab Profil — Profile variant
// Composes: profile variant (contains avatar, stats, settings)

import { useConfig } from './token-provider'
import { PROFILE_VARIANTS } from './variant-renderer'

interface TabProfilProps {
  name: string
  phone: string
  totalVisits: number
  totalStamps: number
  totalRewards: number
  longestStreak?: number
  completedChallenges?: number
  onLogout: () => void
  onNotificationSettings?: () => void
  onDeleteAccount?: () => void
}

export function TabProfil(props: TabProfilProps) {
  const config = useConfig()

  const Profile = PROFILE_VARIANTS[config.variant_profile || 'profile-card-01']

  return (
    <div style={{ minHeight: '100%' }}>
      <Profile {...props} />
    </div>
  )
}

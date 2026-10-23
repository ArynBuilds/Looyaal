// Shared props for all profile variants

export interface ProfileProps {
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

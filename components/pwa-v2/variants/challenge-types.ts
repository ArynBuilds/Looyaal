// Shared props for all challenge card variants

export interface ChallengeProps {
  title: string
  description: string
  targetCount: number
  currentCount: number
  daysRemaining: number
  expiresAt?: string | null
  rewardValue: number
  rewardType: string
  isEmpty?: boolean
}

// Shared props for all stamp card variants

export interface StampCardProps {
  current: number
  total: number
  rewardName: string
  onStampPress?: () => void  // opens QR overlay — button lives in tab-kartim
  /** Current streak in days (0 = no active streak). Variants render the
   *  shared <StreakBadge /> from ./stamp-streak-badge inline in their
   *  layout — never as an absolute-positioned overlay (that's how it used
   *  to look "tacked on"). */
  streak?: number
  /** Click handler for the streak badge — opens the streak detail sheet
   *  in tab-kartim. When omitted, the badge is non-interactive. */
  onStreakPress?: () => void
}

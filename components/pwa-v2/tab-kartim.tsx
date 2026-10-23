'use client'

// Tab Kartim — Stamp card (hero) + "Puan Kazan" button + activity section.
// The streak badge is rendered INSIDE each stamp variant (via the shared
// <StreakBadge /> component) so it integrates with the variant's design
// instead of floating on top as a hardcoded overlay.

import { useState } from 'react'
import { Zap } from 'lucide-react'
import { useConfig } from './token-provider'
import { formatTimeRemaining } from '@/lib/format-time'
import { HEADER_VARIANTS, STAMP_VARIANTS, ACTIVITY_VARIANTS } from './variant-renderer'
import { DetailOverlay } from './detail-overlay'
import { StreakDetail } from './streak-detail'

interface TabKartimProps {
  shopName: string
  logoUrl: string | null
  bannerUrl: string | null
  city: string
  currentStamps: number
  totalRequired: number
  rewardName: string
  streak: number
  longestStreak: number
  graceAvailable: boolean
  totalVisits: number
  totalRewards: number
  lastVisits: { date: string; location: string }[]
  memberSince: string
  onStampPress?: () => void
  doubleStampExpiry?: string | null  // ISO timestamp, null = no active 2x offer
}

export function TabKartim(props: TabKartimProps) {
  const config = useConfig()
  const [showStreakDetail, setShowStreakDetail] = useState(false)

  // 2x stamp badge — auto-hides when expired via formatTimeRemaining
  const doubleStampTime = formatTimeRemaining(props.doubleStampExpiry)
  const hasDoubleStamp = !!doubleStampTime

  const Header = HEADER_VARIANTS[config.variant_header || 'header-logo-01'] ?? HEADER_VARIANTS['header-logo-01']
  const Stamp = STAMP_VARIANTS[config.variant_stamp || 'stamp-minimal-01'] ?? STAMP_VARIANTS['stamp-minimal-01']
  const Activity = ACTIVITY_VARIANTS[config.variant_activity || 'activity-timeline-01'] ?? ACTIVITY_VARIANTS['activity-timeline-01']

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
        gap: 'var(--space-lg)',
      }}>
        {/* Stamp card — variant renders its own streak badge inline */}
        <div className="stagger-1" style={{ position: 'relative' }}>
          <Stamp
            current={props.currentStamps}
            total={props.totalRequired}
            rewardName={props.rewardName}
            onStampPress={props.onStampPress}
            streak={props.streak}
            onStreakPress={() => setShowStreakDetail(true)}
          />

          {/* 2x stamp tag — hangs from top edge of card. This stays as an
              absolute overlay because it's a transient state (auto-hides on
              expiry) and applies regardless of stamp variant chosen. */}
          {hasDoubleStamp && (
            <div style={{
              position: 'absolute',
              top: 8,
              right: 8,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-brand)',
              boxShadow: '0 2px 8px var(--color-brand-glow)',
              zIndex: 2,
            }}>
              <Zap size={13} style={{ color: 'white' }} />
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                fontSize: 12,
                color: 'white',
                lineHeight: 1,
              }}>
                2x puan
              </span>
              <span style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 500,
              }}>
                {doubleStampTime}
              </span>
            </div>
          )}
        </div>

        {/* Stamp button — flips to reward claim when card is full */}
        {props.onStampPress && (
          <div className="stagger-2"><button onClick={props.onStampPress} style={{
            width: '100%',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-button)',
            background: 'var(--color-brand)',
            color: 'white',
            fontSize: 'var(--font-size-body)',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'var(--transition-fast)',
          }}>
            {props.currentStamps >= props.totalRequired ? 'Bedava kahveni al!' : 'Puan Kazan'}
          </button></div>
        )}

        {/* Activity section */}
        <div className="stagger-3"><Activity
          streak={props.streak}
          totalVisits={props.totalVisits}
          totalRewards={props.totalRewards}
          lastVisits={props.lastVisits}
          memberSince={props.memberSince}
        /></div>
      </div>

      {/* Streak detail overlay */}
      {showStreakDetail && (
        <DetailOverlay onClose={() => setShowStreakDetail(false)}>
          <StreakDetail
            currentStreak={props.streak}
            longestStreak={props.longestStreak}
            graceAvailable={props.graceAvailable}
          />
        </DetailOverlay>
      )}
    </div>
  )
}

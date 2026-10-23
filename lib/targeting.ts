// Smart Targeting Engine (Technical Spec Section 8.6)
// 5 Targeting Buckets — runs before every campaign send
// Decides WHO gets each notification to prevent fatigue

export type TargetBucket =
  | 'sweet_spot'      // Slightly overdue — SEND (highest conversion)
  | 'habitual_regular' // Coming anyway — SUPPRESS
  | 'lost_cause'       // Gone 4+ months — RARE HAIL MARY ONLY
  | 'weather_trigger'  // Weather-contextual — SEND IF OVERDUE
  | 'near_reward'      // Close to reward — GENTLE REMINDER
  | 'default_send'     // No special bucket — SEND

export type TargetAction = 'send' | 'suppress' | 'hail_mary'

interface CustomerTargetData {
  id: string
  last_visit_at: string | null
  total_visits: number
  churn_risk: number | null
  current_stamps: number
  stamps_required: number
  avg_days_between_visits: number | null
  last_campaign_sent_at: string | null
  primary_location_id: string | null
}

interface TargetResult {
  customerId: string
  bucket: TargetBucket
  action: TargetAction
  reason: string
}

export function classifyCustomer(customer: CustomerTargetData): TargetResult {
  const now = new Date()
  const lastVisit = customer.last_visit_at ? new Date(customer.last_visit_at) : null
  const daysSinceLastVisit = lastVisit
    ? Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24))
    : 999

  const avgGap = customer.avg_days_between_visits ?? 7
  const overdueRatio = avgGap > 0 ? daysSinceLastVisit / avgGap : daysSinceLastVisit

  // Bucket: New Customer — always send, never suppress
  // Customers with < 3 visits haven't built a habit yet and need every touch
  // to build loyalty. Suppressing them as "habitual regular" would be wrong —
  // they visited today because they JUST registered, not because they're a
  // regular.
  if (customer.total_visits < 3) {
    return {
      customerId: customer.id,
      bucket: 'default_send',
      action: 'send',
      reason: 'Yeni müşteri — alışkanlık oluşturmak için gönder',
    }
  }

  // Bucket 5: Near Reward — close to completing stamp card
  const stampsToReward = customer.stamps_required - customer.current_stamps
  if (stampsToReward > 0 && stampsToReward <= 2) {
    return {
      customerId: customer.id,
      bucket: 'near_reward',
      action: 'send',
      reason: `${stampsToReward} puan kaldı — hatırlatma gönder`,
    }
  }

  // Bucket 3: Lost Cause — gone 4+ months
  if (daysSinceLastVisit >= 120) {
    // Check if we already sent a hail mary this month
    if (customer.last_campaign_sent_at) {
      const lastSent = new Date(customer.last_campaign_sent_at)
      const daysSinceLastCampaign = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24))
      if (daysSinceLastCampaign < 30) {
        return {
          customerId: customer.id,
          bucket: 'lost_cause',
          action: 'suppress',
          reason: 'Kayıp müşteri — bu ay zaten kampanya gönderildi',
        }
      }
    }
    return {
      customerId: customer.id,
      bucket: 'lost_cause',
      action: 'hail_mary',
      reason: 'Kayıp müşteri — son şans kampanyası',
    }
  }

  // Bucket 2: Habitual Regular — coming on schedule
  if (overdueRatio < 1.0 && daysSinceLastVisit <= 1) {
    return {
      customerId: customer.id,
      bucket: 'habitual_regular',
      action: 'suppress',
      reason: 'Düzenli müşteri — zaten geliyor, bildirim gereksiz',
    }
  }

  // Bucket 1: Sweet Spot — slightly overdue (1.2x-2x normal cadence)
  if (overdueRatio >= 1.2 && overdueRatio < 3) {
    return {
      customerId: customer.id,
      bucket: 'sweet_spot',
      action: 'send',
      reason: `Normalden ${Math.round(overdueRatio * 10) / 10}x geç — en yüksek dönüşüm olasılığı`,
    }
  }

  // Bucket 4: Weather Trigger is handled at campaign level (not per-customer)
  // Skip here — weather filtering happens in the send engine

  // Default: send if overdue at all
  if (overdueRatio >= 1.0) {
    return {
      customerId: customer.id,
      bucket: 'default_send',
      action: 'send',
      reason: 'Beklenen ziyaret zamanı geçti',
    }
  }

  // Not overdue — suppress
  return {
    customerId: customer.id,
    bucket: 'habitual_regular',
    action: 'suppress',
    reason: 'Henüz zamanı gelmedi',
  }
}

// Filter a list of customers through the targeting engine
export function filterTargets(
  customers: CustomerTargetData[],
  campaignType: string
): { send: TargetResult[]; suppressed: TargetResult[] } {
  const send: TargetResult[] = []
  const suppressed: TargetResult[] = []

  for (const customer of customers) {
    const result = classifyCustomer(customer)

    if (result.action === 'send') {
      send.push(result)
    } else if (result.action === 'hail_mary' && campaignType === 'reengagement') {
      // Only allow hail mary for re-engagement campaigns
      send.push(result)
    } else {
      suppressed.push(result)
    }
  }

  return { send, suppressed }
}

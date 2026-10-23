import { SupabaseClient } from '@supabase/supabase-js'

const STAMP_MILESTONES = [3, 5, 7, 10, 15, 20]
const FREE_ITEM_INTERVAL = 30 // Every 30 days → free item

export interface StreakResult {
  currentStreak: number
  longestStreak: number
  isMilestone: boolean
  bonusStampAwarded: boolean
  freeItemAwarded: boolean
  freeItemName: string | null
  graceUsed: boolean
}

/**
 * Update customer streak on visit confirmation.
 * Small milestones (3,5,7,10,15,20) → bonus stamp
 * Every 30 days → free item (customer's most ordered item)
 */
export async function updateStreak(
  supabase: SupabaseClient,
  customerId: string
): Promise<StreakResult> {
  const { data: customer } = await supabase
    .from('customers')
    .select('current_streak, longest_streak, streak_last_visit_date, streak_grace_used, top_items')
    .eq('id', customerId)
    .single()

  if (!customer) return { currentStreak: 0, longestStreak: 0, isMilestone: false, bonusStampAwarded: false, freeItemAwarded: false, freeItemName: null, graceUsed: false }

  const today = new Date()
  const todayStr = today.toISOString().split('T')[0]
  const yesterday = new Date(today.getTime() - 86400000).toISOString().split('T')[0]
  const dayBefore = new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0]

  const lastDate = customer.streak_last_visit_date

  let newStreak = customer.current_streak || 0
  let graceUsed = customer.streak_grace_used || false

  if (lastDate === todayStr) {
    return {
      currentStreak: newStreak,
      longestStreak: customer.longest_streak || 0,
      isMilestone: false,
      bonusStampAwarded: false,
      freeItemAwarded: false,
      freeItemName: null,
      graceUsed,
    }
  } else if (lastDate === yesterday) {
    newStreak += 1
    graceUsed = false
  } else if (lastDate === dayBefore && !graceUsed) {
    newStreak += 1
    graceUsed = true
  } else {
    newStreak = 1
    graceUsed = false
  }

  const newLongest = Math.max(customer.longest_streak || 0, newStreak)
  const isStampMilestone = STAMP_MILESTONES.includes(newStreak)
  const isFreeItemMilestone = newStreak > 0 && newStreak % FREE_ITEM_INTERVAL === 0

  await supabase.from('customers').update({
    current_streak: newStreak,
    longest_streak: newLongest,
    streak_last_visit_date: todayStr,
    streak_grace_used: graceUsed,
  }).eq('id', customerId)

  // Award bonus stamp at small milestones
  let bonusStampAwarded = false
  if (isStampMilestone) {
    const { data: card } = await supabase
      .from('loyalty_cards')
      .select('id, current_stamps, total_stamps')
      .eq('customer_id', customerId)
      .limit(1)
      .single()

    if (card) {
      await supabase.from('loyalty_cards').update({
        current_stamps: card.current_stamps + 1,
        total_stamps: card.total_stamps + 1,
      }).eq('id', card.id)
      bonusStampAwarded = true
    }
  }

  // Award free item at every 30-day milestone
  let freeItemAwarded = false
  let freeItemName: string | null = null
  if (isFreeItemMilestone) {
    const topItems = customer.top_items as { item: string; count: number }[] | null
    freeItemName = topItems?.[0]?.item || null

    if (freeItemName) {
      // Create a pending redemption for the free item
      const { data: org } = await supabase
        .from('customers')
        .select('org_id')
        .eq('id', customerId)
        .single()

      if (org) {
        // Find or create a reward for this item
        const { data: reward } = await supabase
          .from('rewards')
          .select('id')
          .eq('org_id', org.org_id)
          .eq('name', freeItemName)
          .eq('type', 'free_item')
          .limit(1)
          .maybeSingle()

        let rewardId = reward?.id
        if (!rewardId) {
          // Auto-create reward entry for this item
          const { data: newReward } = await supabase
            .from('rewards')
            .insert({
              org_id: org.org_id,
              program_id: (await supabase.from('loyalty_programs').select('id').eq('org_id', org.org_id).eq('is_active', true).limit(1).single()).data?.id,
              name: freeItemName,
              type: 'free_item',
              is_active: true,
            })
            .select('id')
            .single()
          rewardId = newReward?.id
        }

        if (rewardId) {
          await supabase.from('redemptions').insert({
            org_id: org.org_id,
            customer_id: customerId,
            reward_id: rewardId,
            status: 'pending',
            redeemed_at: new Date().toISOString(),
          })
          freeItemAwarded = true
        }
      }
    }
  }

  return {
    currentStreak: newStreak,
    longestStreak: newLongest,
    isMilestone: isStampMilestone || isFreeItemMilestone,
    bonusStampAwarded,
    freeItemAwarded,
    freeItemName,
    graceUsed,
  }
}

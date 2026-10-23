import { SupabaseClient } from '@supabase/supabase-js'

interface CustomerForChallenge {
  id: string
  org_id: string
  total_visits: number
  top_items: { item: string; count: number }[] | null
  preferred_visit_hour: number | null
  avg_spend: number | null
}

/**
 * Generate a personalized challenge for a customer.
 * Returns null if customer already has an active challenge.
 */
export async function generateChallenge(
  supabase: SupabaseClient,
  customer: CustomerForChallenge
): Promise<{ type: string; title: string; description: string; targetCount: number } | null> {
  // Check if customer already has an active challenge
  const { data: existing } = await supabase
    .from('customer_challenges')
    .select('id')
    .eq('customer_id', customer.id)
    .eq('status', 'active')
    .limit(1)

  if (existing && existing.length > 0) return null

  // Habit-reinforcement requires a habit. Customers with fewer than 3 visits
  // are still forming their first impression of the cafe — "complete this
  // weekly challenge" is the wrong copy for someone who's been once or twice.
  // welcome_followup (days 3-7 post-first-visit) covers this cohort instead.
  if (customer.total_visits < 3) return null

  // Stale-customer guard: if the most recent challenge expired with zero
  // progress AND the customer hasn't visited since it expired, do NOT
  // auto-regenerate. Otherwise we cycle a fresh challenge into existence
  // every 7 days for inactive customers, which makes challenge_reminder the
  // only NBA-eligible action and produces an endless reminder loop. A new
  // visit signals re-engagement and naturally re-enables challenge auto-gen
  // because the visit row breaks the guard below.
  const { data: lastChallenge } = await supabase
    .from('customer_challenges')
    .select('current_count, expires_at, status')
    .eq('customer_id', customer.id)
    .order('expires_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (lastChallenge?.status === 'expired' && lastChallenge.current_count === 0) {
    const { count: visitsSince } = await supabase
      .from('visits')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer.id)
      .gte('visited_at', lastChallenge.expires_at)
    if ((visitsSince || 0) === 0) return null
  }

  // Pick challenge type based on behavior
  const items = customer.top_items || []
  const uniqueItems = items.length

  // Priority 1: If customer always orders the same thing (1-2 items), suggest trying new
  if (uniqueItems <= 2 && customer.total_visits >= 5) {
    return {
      type: 'try_new',
      title: 'Yeni bir şey dene!',
      description: 'Bu hafta 2 farklı içecek dene, bonus puan kazan!',
      targetCount: 2,
    }
  }

  // Priority 2 (removed): dead_hour_visit challenges replaced by the
  // Thompson-sampled drink-scoped offer system in dead-hour-targeting.ts.
  // Dead hours now create customer_offers with applies_to_item, shown in
  // the Sana Özel section — not as challenge cards.

  // Priority 3: If customer only orders from 1 category, suggest exploring
  const categories = new Set((customer.top_items || []).map((i: { item: string; category?: string }) => (i as { category?: string }).category || 'drink'))
  if (categories.size <= 1 && customer.total_visits >= 5) {
    return {
      type: 'category_explorer',
      title: 'Farklı bir kategori dene!',
      description: 'Bu hafta farklı bir kategoriden ürün dene, bonus puan kazan!',
      targetCount: 1,
    }
  }

  // Priority 4: Weekly visits challenge (default)
  return {
    type: 'weekly_visits',
    title: 'Bu hafta 3 kez gel!',
    description: 'Bu hafta 3 kez ziyaret et, ekstra puan kazan!',
    targetCount: 3,
  }
}

/**
 * Create the challenge in the database.
 */
export async function createChallenge(
  supabase: SupabaseClient,
  customerId: string,
  orgId: string,
  challenge: { type: string; title: string; description: string; targetCount: number }
) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7-day duration

  await supabase.from('customer_challenges').insert({
    org_id: orgId,
    customer_id: customerId,
    type: challenge.type,
    title: challenge.title,
    description: challenge.description,
    target_count: challenge.targetCount,
    current_count: 0,
    reward_type: 'bonus_stamp',
    reward_value: 1,
    expires_at: expiresAt.toISOString(),
    status: 'active',
  })
}

/**
 * Expire challenges that have passed their deadline.
 */
export async function expireChallenges(supabase: SupabaseClient, orgId: string) {
  const now = new Date().toISOString()
  await supabase
    .from('customer_challenges')
    .update({ status: 'expired' })
    .eq('org_id', orgId)
    .eq('status', 'active')
    .lt('expires_at', now)
}

/**
 * Increment challenge progress on visit (for weekly_visits type).
 * Called from barista/confirm after stamp confirmation.
 */
export async function trackChallengeProgress(
  supabase: SupabaseClient,
  customerId: string,
  drinkName?: string
) {
  const { data: challenge } = await supabase
    .from('customer_challenges')
    .select('id, type, current_count, target_count, reward_value, started_at')
    .eq('customer_id', customerId)
    .eq('status', 'active')
    .limit(1)
    .single()

  if (!challenge) return

  // Check if this visit counts for the challenge
  let counts = false

  if (challenge.type === 'weekly_visits') {
    counts = true
  }

  if (challenge.type === 'try_new' && drinkName) {
    // Only count if this drink is DIFFERENT from ones already ordered during challenge
    const { data: challengeVisits } = await supabase
      .from('visits')
      .select('items')
      .eq('customer_id', customerId)
      .gte('visited_at', challenge.started_at)

    const previousDrinks = new Set<string>()
    for (const v of challengeVisits || []) {
      for (const item of (v.items as { name: string }[]) || []) {
        previousDrinks.add(item.name.toLowerCase())
      }
    }
    counts = !previousDrinks.has(drinkName.toLowerCase())
  }

  if (challenge.type === 'category_explorer' && drinkName) {
    // Look up menu item category
    const { data: challengeRow } = await supabase
      .from('customer_challenges')
      .select('org_id')
      .eq('id', challenge.id)
      .single()

    if (challengeRow) {
      const { data: menuItem } = await supabase
        .from('menu_items')
        .select('category')
        .eq('name', drinkName)
        .eq('org_id', challengeRow.org_id)
        .limit(1)
        .maybeSingle()

      // Check categories already ordered during challenge period
      const { data: challengeVisits } = await supabase
        .from('visits')
        .select('items')
        .eq('customer_id', customerId)
        .gte('visited_at', challenge.started_at)

      const orderedCategories = new Set<string>()
      for (const v of challengeVisits || []) {
        for (const item of (v.items as { name: string; category?: string }[]) || []) {
          orderedCategories.add((item.category || 'drink').toLowerCase())
        }
      }

      const itemCategory = (menuItem?.category || 'drink').toLowerCase()
      counts = !orderedCategories.has(itemCategory)
    }
  }

  if (!counts) return

  const newCount = challenge.current_count + 1
  const completed = newCount >= challenge.target_count

  if (completed) {
    await supabase.from('customer_challenges').update({
      current_count: newCount,
      status: 'completed',
      completed_at: new Date().toISOString(),
    }).eq('id', challenge.id)

    // Award bonus stamp
    const { data: card } = await supabase
      .from('loyalty_cards')
      .select('id, current_stamps, total_stamps')
      .eq('customer_id', customerId)
      .limit(1)
      .single()

    if (card) {
      await supabase.from('loyalty_cards').update({
        current_stamps: card.current_stamps + (challenge.reward_value || 1),
        total_stamps: card.total_stamps + (challenge.reward_value || 1),
      }).eq('id', card.id)
    }

    // Create 10% discount offer for challenge completion
    const { data: custData } = await supabase
      .from('customers')
      .select('org_id, top_items')
      .eq('id', customerId)
      .single()

    if (custData) {
      const favItem = (custData.top_items as { item: string }[] | null)?.[0]?.item
      const expiresAt = new Date(Date.now() + 7 * 86400000)

      // Challenge reward offers appear in Sana Ozel only (no push notification)
      await supabase.from('customer_offers').insert({
        org_id: custData.org_id,
        customer_id: customerId,
        type: 'challenge_reward',
        title: favItem ? `%10 indirim: ${favItem}` : '%10 indirim',
        description: 'Görevi tamamladın! Sonraki alışverişte %10 indirim.',
        offer_type: 'discount_percent',
        offer_value: 10,
        free_item_name: favItem || null,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
    }
  } else {
    await supabase.from('customer_challenges').update({
      current_count: newCount,
    }).eq('id', challenge.id)
  }
}

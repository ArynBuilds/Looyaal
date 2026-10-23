import { SupabaseClient } from '@supabase/supabase-js'
import type { WeatherData } from './weather'

// 9E-2: Compute customer preferences from visit/POS data
export async function computeCustomerPreferences(supabase: SupabaseClient, customerId: string) {
  const { data: visits } = await supabase
    .from('visits')
    .select('items, hour_of_day, day_of_week, amount')
    .eq('customer_id', customerId)
    .order('visited_at', { ascending: false })
    .limit(100)

  if (!visits || visits.length === 0) return

  // Top items (Tier 2 — POS data)
  const itemCounts = new Map<string, number>()
  for (const v of visits) {
    if (v.items && Array.isArray(v.items)) {
      for (const item of v.items as { name: string; qty?: number }[]) {
        itemCounts.set(item.name, (itemCounts.get(item.name) ?? 0) + (item.qty || 1))
      }
    }
  }
  const topItems = Array.from(itemCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([item, count]) => ({ item, count }))

  // Preferred hour (mode)
  const hourCounts = new Map<number, number>()
  for (const v of visits) {
    if (v.hour_of_day !== null) hourCounts.set(v.hour_of_day, (hourCounts.get(v.hour_of_day) ?? 0) + 1)
  }
  const preferredHour = hourCounts.size > 0
    ? [...hourCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Preferred day (mode)
  const dayCounts = new Map<number, number>()
  for (const v of visits) {
    if (v.day_of_week !== null) dayCounts.set(v.day_of_week, (dayCounts.get(v.day_of_week) ?? 0) + 1)
  }
  const preferredDay = dayCounts.size > 0
    ? [...dayCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]
    : null

  // Avg spend
  const amounts = visits.filter(v => v.amount).map(v => v.amount)
  const avgSpend = amounts.length > 0 ? amounts.reduce((s, a) => s + a, 0) / amounts.length : null

  await supabase.from('customers').update({
    top_items: topItems.length > 0 ? topItems : undefined,
    preferred_visit_hour: preferredHour,
    preferred_visit_day: preferredDay,
    avg_spend: avgSpend,
  }).eq('id', customerId)
}

// 9E-3: Generate personalized notification message
interface CustomerProfile {
  full_name: string | null
  top_items: { item: string; count: number }[] | null
  optimal_discount: number | null
}

interface CampaignContext {
  type: string // 'reengagement' | 'dead_hour' | 'birthday' | 'nudge' | 'stamp_boost' | 'streak_reminder' | 'near_reward' | 'challenge_reminder' | 'surprise' | 'hero_offer' | 'goal_gradient' | 'weather_nudge' | 'welcome_followup'
  defaultDiscount: number
  deadHourStart?: string
  deadHourEnd?: string
  streakCount?: number
  stampsAway?: number
  challengeTitle?: string
  surpriseItem?: string
  // Days since the customer's first visit — used by welcome_followup and
  // by the lapsed_new win-back path inside reengagement to pick copy.
  daysSinceFirstVisit?: number
  // Days since the customer's last visit — drives the 30/60/90 cadence
  // copy variants in reengagement.
  daysSinceLastVisit?: number
}

interface LocationContext {
  name: string
}

export function generatePersonalizedMessage(
  customer: CustomerProfile,
  campaign: CampaignContext,
  location: LocationContext,
  weather: WeatherData | null
): string {
  const name = customer.full_name?.split(' ')[0] || ''
  const favDrink = customer.top_items?.[0]?.item
  const discount = customer.optimal_discount || campaign.defaultDiscount
  const locName = location.name

  // === FACTUAL NOTIFICATIONS (no emojis, clean copy) ===

  if (campaign.type === 'streak_reminder') {
    const streak = campaign.streakCount || 0
    if (streak >= 3) return `${name}, serini bozma. Bugün de uğrarsan kartına bonus damga seni bekliyor.`
    return `${name}, bir alışkanlık oluşuyor. Yarın da görüşelim mi?`
  }

  if (campaign.type === 'near_reward') {
    const away = campaign.stampsAway || 1
    if (away === 1) return `${name}, bir sonraki kahveyle ödülün senin. Bugün uğramaya ne dersin?`
    return `${name}, ödülüne ${away} kahve kaldı. Yavaş yavaş yaklaşıyoruz.`
  }

  if (campaign.type === 'birthday') {
    if (favDrink) return `Bugün ${favDrink} bizden. ${locName}'de seni kutlamak için bekliyoruz.`
    return `Bugün ne içersen bizden. ${locName}'de seni kutlamak için bekliyoruz.`
  }

  if (campaign.type === 'challenge_reminder') {
    // challengeTitle is passed in from daily-intelligence when an active
    // challenge exists. Falling back to a static prefix would double the
    // "bu haftaki önerimiz" phrase, so we keep the two paths distinct.
    if (campaign.challengeTitle) {
      return `${name}, bu haftaki önerimiz: ${campaign.challengeTitle} Tamamlarsan kartına bonus damga ve sonraki siparişine %10 indirim.`
    }
    return `${name}, bu haftaki önerimiz seni bekliyor. Tamamlarsan kartına bonus damga ve sonraki siparişine %10 indirim.`
  }

  if (campaign.type === 'stamp_boost' || campaign.type === 'goal_gradient') {
    if (favDrink) return `${name}, bugün uğrarsan kartına bir yerine iki damga. Kaçırma.`
    return `${name}, bugün her sipariş kartına iki damga ekler. Bir mola tam yerinde.`
  }

  // === PREDICTIVE NOTIFICATIONS (need threshold) ===

  // Note: fav drink is used to pull the customer in emotionally, but the
  // discount itself applies to the whole bill (implementation detail). To
  // avoid promising a drink-specific discount we never deliver, the drink
  // is mentioned separately from the percentage.

  if (campaign.type === 'reengagement') {
    // Lapsed-new win-back: 30/60/90 day cadence with distinct copy variants.
    // Day 30 = loss-aversion (stamps expiring). Day 60 = personalized (their
    // favDrink). Day 90 = last shot (largest discount, 30-day validity).
    const d = campaign.daysSinceLastVisit
    if (d !== undefined) {
      if (d >= 28 && d <= 32) {
        if (favDrink) return `${name}, ilk damgan ${locName}'de seni bekliyor. Bu hafta ${favDrink} alırsan %${discount} indirim — kart açık kalsın diye.`
        return `${name}, kartındaki damgalar ${locName}'de duruyor. Bu hafta uğrarsan tüm siparişine %${discount} indirim.`
      }
      if (d >= 58 && d <= 62) {
        if (favDrink) return `${name}, ${favDrink}'siz bir ay olmuş. ${locName}'de seni özledik — %${discount} indirim ister misin?`
        return `${name}, ${locName} olarak seni özledik. Bu hafta seni ağırlamak için tüm siparişine %${discount} indirim hazır.`
      }
      if (d >= 88 && d <= 92) {
        if (favDrink) return `${name}, son bir teklif: ${locName}'de 30 gün boyunca her ${favDrink} %${discount} indirimli. Kapı her zaman açık.`
        return `${name}, son bir hatırlatma: ${locName}'de 30 gün boyunca tüm siparişine %${discount} indirim. Kapı her zaman açık.`
      }
    }
    // Standard reengagement (at_risk / dormant — not win-back cadence)
    if (favDrink) return `${name}, bir süredir görüşmedik. Tüm siparişine %${discount} indirim — sadece bu hafta.`
    return `${name}, ${locName}'de seni geri bekliyoruz. Tüm siparişine %${discount} indirim, sadece bu hafta.`
  }

  if (campaign.type === 'welcome_followup') {
    // Days 3-7 post-first-visit, customer hasn't returned. Soft welcome with
    // a card-progress reminder — no discount, no urgency, just a warm nudge.
    if (favDrink) return `${name}, ilk ${favDrink}'in harikaydı. Kartında bir damga var, dokuz damga sonra bir kahve ${locName}'den hediye. Bu hafta yine görüşelim mi?`
    return `${name}, ${locName}'deki ilk ziyaretin için teşekkürler. Kartında bir damga seni bekliyor — dokuz damga sonra bir kahve bizden. Bu hafta yine uğra.`
  }

  if (campaign.type === 'dead_hour') {
    // Dead-hour targeting guarantees a favorite drink (filter at lib/dead-hour-targeting.ts).
    // Single-variant copy reflects that.
    return `${name}, sakin saatlerde uğra, hem indirim hem rahat bir mola.`
  }

  if (campaign.type === 'nudge' || campaign.type === 'weather_nudge') {
    if (weather?.isRainy && favDrink) return `${name}, ${locName}'e sığın, sıcak bir ${favDrink} seni bekliyor.`
    if (weather?.isCold && favDrink) return `${name}, sıcak bir ${favDrink} tam zamanı. ${locName}'de bekliyoruz.`
    if (weather?.isHot && favDrink) return `${name}, bu sıcakta soğuk bir ${favDrink} kurtarır. ${locName}'de bekliyoruz.`
    if (weather?.isRainy) return `${name}, ${locName}'e uğra, sıcak bir kahve seni bekliyor.`
    if (weather?.isCold) return `${name}, kısa bir mola iyi gelir. ${locName}'de bekliyoruz.`
    if (weather?.isHot) return `${name}, bu sıcakta soğuk bir şey iyi gider. ${locName}'de hazır.`
    if (favDrink) return `${name}, bir ${favDrink} molası iyi gelir. ${locName}'de seni bekliyoruz.`
    return `${name}, yolun ${locName}'den geçerse bir kahve ısmarlayalım.`
  }

  if (campaign.type === 'hero_offer') {
    if (favDrink) return `${name}, bu hafta ${favDrink} dahil tüm siparişinde %${discount} indirim. Nadiren gönderdiğimiz bir fırsat — değerlendirmeni isteriz.`
    return `${name}, bu hafta tüm siparişinde %${discount} indirim. Nadiren gönderdiğimiz bir fırsat — değerlendirmeni isteriz.`
  }

  return `${name}, bugün uğrarsan seni güzel bir şey bekliyor.`
}

// 9E-5: Adaptive discount learning (VISIT-BASED, not click-based)
// Two outcomes only: sent+visited = worked, sent+no-visit = didn't work
export async function updateDiscountLearning(
  supabase: SupabaseClient,
  customerId: string,
  visited: boolean,
  minDiscount: number,
  maxDiscount: number
) {
  const { data: customer } = await supabase
    .from('customers')
    .select('optimal_discount, notification_clicks, notification_ignores, last_visit_at, automation_status')
    .eq('id', customerId)
    .single()

  if (!customer) return

  let newDiscount = customer.optimal_discount || 20

  if (visited) {
    // Notification worked — try lower discount next time.
    // Reset consecutive ignore counter so one missed notification years ago
    // doesn't combine with today's miss to flag a loyal customer as lost.
    newDiscount = Math.max(minDiscount, newDiscount - 2)
    await supabase.from('customers').update({
      optimal_discount: newDiscount,
      notification_clicks: (customer.notification_clicks || 0) + 1,
      notification_ignores: 0,
    }).eq('id', customerId)
  } else {
    // Notification didn't drive a visit — check give-up threshold
    const daysSinceVisit = customer.last_visit_at
      ? Math.floor((Date.now() - new Date(customer.last_visit_at).getTime()) / 86400000)
      : 999
    const consecutiveIgnores = (customer.notification_ignores || 0) + 1

    if (daysSinceVisit > 90 && consecutiveIgnores >= 3) {
      // GIVE UP: customer is gone, stop wasting budget
      await supabase.from('customers').update({
        automation_status: 'paused',
        optimal_discount: null, // Reset — will use org default if they return
        notification_ignores: consecutiveIgnores,
      }).eq('id', customerId)
    } else {
      // Try higher discount next time (symmetric +2, not +3)
      newDiscount = Math.min(maxDiscount, newDiscount + 2)
      await supabase.from('customers').update({
        optimal_discount: newDiscount,
        notification_ignores: consecutiveIgnores,
      }).eq('id', customerId)
    }
  }
}

// DEPRECATED: Click-based send-time scoring. Will be removed in Phase B.
// Visit-based attribution replaces this (see notification_audit table).
// 9E-6: Send-time per-hour scoring
export async function updateSendTimeScore(
  supabase: SupabaseClient,
  customerId: string,
  sentAt: Date,
  clickedAt: Date | null
) {
  const sentHour = sentAt.getHours()

  if (clickedAt) {
    const diffMinutes = (clickedAt.getTime() - sentAt.getTime()) / 60000
    if (diffMinutes <= 15) {
      // Clicked within 15 min — good time, score +1
      // Update preferred_visit_hour to this hour if it scores higher
      const { data: customer } = await supabase
        .from('customers')
        .select('preferred_visit_hour')
        .eq('id', customerId)
        .single()

      // Simple approach: if clicked quickly, set preferred hour to sent hour
      // (In production, maintain a per-hour score array)
      await supabase.from('customers').update({
        preferred_visit_hour: sentHour,
      }).eq('id', customerId)
    }
    // Clicked 2+ hours later — sent too early, don't update
  }
  // Not clicked — wrong time, handled by discount learning (ignore branch)
}

// 9E-7: Shop intelligence aggregation (with weather impact)
export async function computeShopIntelligence(supabase: SupabaseClient, orgId: string) {
  // Avg effective discount from customers who responded
  const { data: customers } = await supabase
    .from('customers')
    .select('optimal_discount, notification_clicks, notification_ignores')
    .eq('org_id', orgId)
    .gt('notification_clicks', 0)

  const discounts = customers?.filter(c => c.optimal_discount).map(c => c.optimal_discount!) || []
  const avgDiscount = discounts.length > 0 ? discounts.reduce((s, d) => s + d, 0) / discounts.length : null

  const totalClicks = customers?.reduce((s, c) => s + (c.notification_clicks || 0), 0) || 0
  const totalIgnores = customers?.reduce((s, c) => s + (c.notification_ignores || 0), 0) || 0
  const clickRate = totalClicks + totalIgnores > 0 ? totalClicks / (totalClicks + totalIgnores) : null

  // Weather impact: compare visit counts on weather days vs normal days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  const { data: locations } = await supabase.from('locations').select('id').eq('org_id', orgId).eq('is_active', true)
  let rainyDrop = null
  let coldDrop = null
  let hotDrop = null

  if (locations && locations.length > 0) {
    const locId = locations[0].id

    // Get total visits per day for last 30 days
    const { data: visits } = await supabase
      .from('visits')
      .select('visited_at')
      .eq('location_id', locId)
      .gte('visited_at', thirtyDaysAgo)

    const { data: weatherDays } = await supabase
      .from('weather_data')
      .select('checked_at, is_rainy, is_cold, is_hot')
      .eq('location_id', locId)
      .gte('checked_at', thirtyDaysAgo)

    if (visits && visits.length > 0 && weatherDays && weatherDays.length > 0) {
      // Count visits per day
      const dailyVisits = new Map<string, number>()
      for (const v of visits) {
        const day = v.visited_at.split('T')[0]
        dailyVisits.set(day, (dailyVisits.get(day) ?? 0) + 1)
      }

      // Categorize days by weather
      const rainyDays = new Set<string>()
      const coldDays = new Set<string>()
      const hotDays = new Set<string>()
      for (const w of weatherDays) {
        const day = w.checked_at.split('T')[0]
        if (w.is_rainy) rainyDays.add(day)
        if (w.is_cold) coldDays.add(day)
        if (w.is_hot) hotDays.add(day)
      }

      const allDays = Array.from(dailyVisits.values())
      const normalAvg = allDays.length > 0 ? allDays.reduce((s, v) => s + v, 0) / allDays.length : 0

      if (normalAvg > 0) {
        const rainyAvg = rainyDays.size > 0 ? Array.from(rainyDays).reduce((s, d) => s + (dailyVisits.get(d) || 0), 0) / rainyDays.size : normalAvg
        const coldAvg = coldDays.size > 0 ? Array.from(coldDays).reduce((s, d) => s + (dailyVisits.get(d) || 0), 0) / coldDays.size : normalAvg
        const hotAvg = hotDays.size > 0 ? Array.from(hotDays).reduce((s, d) => s + (dailyVisits.get(d) || 0), 0) / hotDays.size : normalAvg

        rainyDrop = Math.round((1 - rainyAvg / normalAvg) * 100) / 100
        coldDrop = Math.round((1 - coldAvg / normalAvg) * 100) / 100
        hotDrop = Math.round((1 - hotAvg / normalAvg) * 100) / 100
      }
    }
  }

  await supabase.from('shop_intelligence').upsert({
    org_id: orgId,
    avg_effective_discount: avgDiscount,
    avg_click_rate: clickRate,
    rainy_day_visit_drop: rainyDrop,
    cold_day_visit_drop: coldDrop,
    hot_day_visit_drop: hotDrop,
    last_computed_at: new Date().toISOString(),
  }, { onConflict: 'org_id' })
}

import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { computeCustomerPreferences, generatePersonalizedMessage } from '@/lib/intelligence'
import { getSegment } from '@/lib/thompson-sampling'
import { getLocalDayAndHour } from '@/lib/timezone'
import { NextResponse } from 'next/server'

// Actions that are about the customer's relationship with the BRAND's loyalty
// card, not any specific location. A chain customer who gets a birthday push
// and redeems it at a different location of the same brand should still have
// the push credited — the barista applies the offer correctly (customer_offers
// is per-customer, not per-location), and the learning loop needs to see the
// success so Thompson Sampling doesn't undervalue the action. Storing
// location_id = null in customer_state_json makes the attribution resolver
// skip its location gate for these actions.
const LOCATION_AGNOSTIC_ACTIONS = new Set([
  'birthday',
  'streak_reminder',
  'near_reward',
  'challenge_reminder',
  'welcome_followup', // welcome is about the brand relationship, not a location
])

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const supabase = createAdminClient()
  const { data: orgs } = await supabase.from('organizations').select('id, slug').eq('onboarding_completed', true)
  if (!orgs) return NextResponse.json({ error: 'No orgs' }, { status: 404 })

  let totalScored = 0
  let totalPrefs = 0
  let totalCampaigns = 0
  const dhTierCounts = { learning: 0, ramping: 0, full: 0 }
  const now = new Date()

  for (const org of orgs) {
    // Auto-complete expired campaigns
    await supabase.from('campaigns')
      .update({ status: 'completed', completed_at: now.toISOString() })
      .eq('org_id', org.id)
      .eq('status', 'active')
      .lt('offer_valid_until', now.toISOString())
      .not('offer_valid_until', 'is', null)

    // Expire old offers
    await supabase.from('customer_offers')
      .update({ status: 'expired' })
      .eq('org_id', org.id)
      .eq('status', 'active')
      .lt('expires_at', now.toISOString())

    // Revert stale claims (claimed but QR expired, never scanned)
    await supabase.from('customer_offers')
      .update({ status: 'active', claimed_at: null })
      .eq('org_id', org.id)
      .eq('status', 'claimed')
      .lt('claimed_at', new Date(now.getTime() - 5 * 60 * 1000).toISOString())

    // Minimum data threshold: skip automation if < 4 weeks or < 20 customers
    const fourWeeksAgo = new Date(now.getTime() - 28 * 86400000).toISOString()
    const { count: customerCount } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .gt('total_visits', 0)

    const { count: oldVisitCount } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .lte('visited_at', fourWeeksAgo)

    // Cafe maturity — used by BOTH the dead-hour detector (to know how many
    // weeks of data to average over) and the dead-hour targeting tier.
    // Computed upfront so detection can divide visit counts by actual weeks
    // of data instead of a hardcoded 8 (the old behavior over-weighted the
    // denominator for young cafes, making every empty slot look "dead").
    const { data: oldestRealVisitForAge } = await supabase
      .from('visits')
      .select('visited_at')
      .eq('org_id', org.id)
      .neq('visit_type', 'signup_bonus')
      .order('visited_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    const { count: realVisitCountForAge } = await supabase
      .from('visits')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .neq('visit_type', 'signup_bonus')

    const cafeAgeDays = oldestRealVisitForAge
      ? Math.floor((now.getTime() - new Date(oldestRealVisitForAge.visited_at).getTime()) / 86400000)
      : 0
    const cafeAgeWeeks = cafeAgeDays / 7
    // Minimum-volume gate dropped from 50 → 10 (2026-05-11). Owner's call:
    // "AIs are dumb at the beginning, it just has to work even if it's dumb."
    // The abandonment loop (lib/dead-hour-learning.ts → checkSlotAbandonment)
    // kills slots that don't convert, so worst-case is a few weeks of
    // false-positive pushes before the system self-corrects. The bigger risk
    // for a brand-new cafe was looking dead to the owner.
    const hasMinimumVolume = (realVisitCountForAge || 0) >= 10

    const hasEnoughDataForPredictive = (customerCount || 0) >= 20 && (oldVisitCount || 0) > 0
    const PREDICTIVE_ACTIONS = new Set(['reengagement', 'hero_offer'])

    // 1. Churn scoring
    const { data: customers } = await supabase
      .from('customers')
      .select('id, last_visit_at, first_visit_at, total_visits, created_at, full_name, top_items, optimal_discount, push_subscription, churn_risk, org_id, primary_location_id')
      .eq('org_id', org.id)
      .gt('total_visits', 0)

    for (const c of customers || []) {
      if (!c.last_visit_at) continue
      const daysSince = Math.floor((now.getTime() - new Date(c.last_visit_at).getTime()) / 86400000)
      const lifetime = Math.max(1, Math.floor((now.getTime() - new Date(c.first_visit_at || c.created_at).getTime()) / 86400000))
      const avgGap = c.total_visits > 1 ? lifetime / (c.total_visits - 1) : lifetime
      const ratio = avgGap > 0 ? daysSince / avgGap : daysSince

      let risk = 0.05
      if (daysSince >= 120) risk = 0.99
      else if (ratio >= 5) risk = 0.95
      else if (ratio >= 3 || daysSince >= 21) risk = 0.90
      else if (ratio >= 2 || daysSince >= 14) risk = 0.70
      else if (ratio >= 1.5) risk = 0.40
      else if (ratio >= 1.2) risk = 0.20

      // Thin-history override: customers with ≤2 visits have unreliable
      // avgGap → ratio collapses to ~1.0 → formula returns 0.05 even at 30+
      // days lapsed. This is the wrong signal for the 77% one-and-done cohort.
      // Override based purely on daysSince — the only meaningful signal we
      // have when we don't yet know the customer's natural cadence.
      if ((c.total_visits ?? 0) <= 2) {
        if (daysSince >= 30) risk = Math.max(risk, 0.95)
        else if (daysSince >= 14) risk = Math.max(risk, 0.85)
        else if (daysSince >= 7) risk = Math.max(risk, 0.40)
      }

      await supabase.from('customers').update({ churn_risk: risk, churn_risk_updated_at: now.toISOString() }).eq('id', c.id)
      totalScored++

      // 3. Preference profiling
      await computeCustomerPreferences(supabase, c.id)
      totalPrefs++
    }

    // 2. Dead-hour detection (per location)
    const { data: locations } = await supabase.from('locations').select('id, name, org_id, timezone').eq('org_id', org.id).eq('is_active', true)
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 86400000).toISOString()

    for (const loc of locations || []) {
      const { data: visits } = await supabase
        .from('visits')
        .select('day_of_week, hour_of_day')
        .eq('location_id', loc.id)
        .gte('visited_at', eightWeeksAgo)
        .not('visit_type', 'in', '(dead_hour_redeem,signup_bonus)')

      if (!visits || visits.length === 0) continue

      const slotCounts = new Map<string, number>()
      for (const v of visits) {
        const key = `${v.day_of_week}-${v.hour_of_day}`
        slotCounts.set(key, (slotCounts.get(key) ?? 0) + 1)
      }

      // Divide by actual weeks of data (capped at the 8-week query window).
      // Fix for the latent bug where young cafes had their averages divided
      // by 8 regardless of actual data span — a 1-week-old cafe's "average"
      // came out 8× too low, making every quiet slot look extra dead.
      const weeksOfData = Math.min(8, Math.max(1, cafeAgeWeeks))
      const slotAverages = new Map<string, number>()
      for (const [key, count] of slotCounts) slotAverages.set(key, count / weeksOfData)

      const allAvgs = Array.from(slotAverages.values())
      const overallAvg = allAvgs.length > 0 ? allAvgs.reduce((s, v) => s + v, 0) / allAvgs.length : 0
      if (overallAvg === 0) continue

      const threshold = overallAvg * 0.5

      const deadHourBatch: { org_id: string; location_id: string; day_of_week: number; hour: number; avg_visits: number; overall_avg: number; severity: number; updated_at: string }[] = []
      for (let day = 0; day < 7; day++) {
        for (let hour = 7; hour <= 22; hour++) {
          const avgVisits = slotAverages.get(`${day}-${hour}`) ?? 0
          if (avgVisits < threshold) {
            const severity = Math.min(1, Math.max(0, 1 - (avgVisits / overallAvg)))
            deadHourBatch.push({
              org_id: org.id, location_id: loc.id, day_of_week: day, hour,
              avg_visits: Math.round(avgVisits * 100) / 100,
              overall_avg: Math.round(overallAvg * 100) / 100,
              severity: Math.round(severity * 100) / 100,
              updated_at: now.toISOString(),
            })
          }
        }
      }
      if (deadHourBatch.length > 0) {
        await supabase.from('dead_hour_suggestions').upsert(deadHourBatch, { onConflict: 'location_id,day_of_week,hour' })
      }
    }

    // 4. NBA engine: per-customer best-action selection
    // Factual actions (streak, near_reward, birthday, challenge, goal_gradient) always run
    // Predictive actions (reengagement, hero_offer, dead_hour, weather) need threshold
    {
      // Fetch org settings for NBA
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, min_discount, max_discount, quiet_hours_start, quiet_hours_end, max_notifications_per_week')
        .eq('id', org.id)
        .single()

      const orgContext = {
        id: org.id,
        min_discount: orgData?.min_discount || 5,
        max_discount: orgData?.max_discount || 30,
        quiet_hours_start: orgData?.quiet_hours_start || '09:00',
        quiet_hours_end: orgData?.quiet_hours_end || '21:00',
        max_notifications_per_week: orgData?.max_notifications_per_week || 4,
      }

      // Re-fetch customers with full NBA context (UPDATED churn scores from step 1)
      const { data: nbaCustomers } = await supabase
        .from('customers')
        .select(`
          id, org_id, full_name, last_visit_at, first_visit_at, total_visits,
          churn_risk, optimal_discount, current_stamps:loyalty_cards(current_stamps),
          push_subscription, preferred_visit_hour, primary_location_id,
          current_streak, streak_last_visit_date, hero_offer_count,
          automation_status, birth_date, top_items, notification_ignores
        `)
        .eq('org_id', org.id)
        .eq('automation_status', 'active')
        .gt('total_visits', 0)
        .not('push_subscription', 'is', null)

      // Get loyalty program stamps_required
      const { data: loyaltyProg } = await supabase
        .from('loyalty_programs')
        .select('stamps_required')
        .eq('org_id', org.id)
        .eq('is_active', true)
        .single()
      const stampsRequired = loyaltyProg?.stamps_required || 10

      // Get current weather for org locations
      const { data: weatherRows } = await supabase
        .from('weather_data')
        .select('is_rainy, is_cold, is_hot, temperature, feels_like, humidity, weather_main, weather_desc, wind_speed')
        .eq('location_id', (locations || [])[0]?.id)
        .order('checked_at', { ascending: false })
        .limit(1)
      const rawWeather = weatherRows?.[0] || null
      const weather = rawWeather ? {
        isRainy: rawWeather.is_rainy as boolean,
        isCold: rawWeather.is_cold as boolean,
        isHot: rawWeather.is_hot as boolean,
        temperature: rawWeather.temperature as number,
        feelsLike: (rawWeather.feels_like ?? rawWeather.temperature) as number,
        humidity: (rawWeather.humidity ?? 0) as number,
        weatherMain: (rawWeather.weather_main ?? '') as string,
        weatherDesc: (rawWeather.weather_desc ?? '') as string,
        windSpeed: (rawWeather.wind_speed ?? 0) as number,
      } : null

      // Get dead hour info for current time (in the location's local timezone)
      const primaryLocTz = ((locations || [])[0] as { timezone?: string | null } | undefined)?.timezone || 'Europe/Istanbul'
      const { day: currentDay, hour: currentHour } = getLocalDayAndHour(now, primaryLocTz)
      const { data: deadHourRow } = await supabase
        .from('dead_hour_suggestions')
        .select('severity')
        .eq('org_id', org.id)
        .eq('day_of_week', currentDay)
        .eq('hour', currentHour)
        .maybeSingle()

      // Validate dead hour against last 3 days
      let deadHourValidated = false
      if (deadHourRow) {
        const threeDaysAgo = new Date(now.getTime() - 3 * 86400000).toISOString()
        const { count: recentVisitsThisHour } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('org_id', org.id)
          .gte('visited_at', threeDaysAgo)
          .eq('hour_of_day', currentHour)

        // If recent traffic is low (< 3 visits in 3 days at this hour), dead hour is validated
        deadHourValidated = (recentVisitsThisHour || 0) < 3
      }

      // Check weekly notification count per customer (for global filter)
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString()

      // Detect recently completed loyalty cards (for surprise rewards)
      const twoDaysAgoStr = new Date(now.getTime() - 2 * 86400000).toISOString()
      const { data: recentCompletions } = await supabase
        .from('loyalty_cards')
        .select('customer_id, cards_completed, updated_at')
        .eq('org_id', org.id)
        .gt('cards_completed', 0)
        .gte('updated_at', twoDaysAgoStr)
      const recentlyCompletedCustomerIds = new Set(
        (recentCompletions || []).map(c => c.customer_id)
      )

      const { selectBestAction } = await import('@/lib/nba-engine')
      const { expirePendingAttributions } = await import('@/lib/attribution')

      // Expire old pending attributions first
      await expirePendingAttributions(supabase, org.id)

      // Bug 3 fix: fetch per-customer recent actions in last 7 days (single batched query)
      // so the NBA engine can penalize repeats instead of sending the same push 3 days in a row.
      const sevenDaysAgoDate = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]
      const { data: recentAuditRows } = await supabase
        .from('notification_audit')
        .select('customer_id, action_chosen')
        .eq('org_id', org.id)
        .neq('action_chosen', 'nothing')
        .eq('was_holdback', false)
        .gte('decision_date', sevenDaysAgoDate)
      const recentActionsByCustomer = new Map<string, string[]>()
      for (const row of recentAuditRows || []) {
        const list = recentActionsByCustomer.get(row.customer_id) || []
        list.push(row.action_chosen)
        recentActionsByCustomer.set(row.customer_id, list)
      }

      // Last-2-days actions for the hard same-action skip rule. Separate from
      // the 7-day soft penalty above — these feed two different NBA rules.
      const twoDaysAgoDate = new Date(now.getTime() - 2 * 86400000).toISOString().split('T')[0]
      const { data: last2DaysAuditRows } = await supabase
        .from('notification_audit')
        .select('customer_id, action_chosen')
        .eq('org_id', org.id)
        .neq('action_chosen', 'nothing')
        .eq('was_holdback', false)
        .gte('decision_date', twoDaysAgoDate)
      const recentActions2DaysByCustomer = new Map<string, string[]>()
      for (const row of last2DaysAuditRows || []) {
        const list = recentActions2DaysByCustomer.get(row.customer_id) || []
        list.push(row.action_chosen)
        recentActions2DaysByCustomer.set(row.customer_id, list)
      }

      // Fetch Thompson Sampling action scores for this org
      const { data: orgActionScores } = await supabase
        .from('action_scores')
        .select('*')
        .eq('org_id', org.id)

      // Master campaign toggle — single switch that enables reengagement,
      // hero_offer, birthday, and dead-hour targeting. Free actions
      // (streak_reminder, near_reward, goal_gradient, challenge_reminder)
      // always run regardless.
      const { data: masterToggle } = await supabase
        .from('auto_campaign_settings')
        .select('is_enabled')
        .eq('org_id', org.id)
        .eq('type', 'master')
        .maybeSingle()
      const campaignsEnabled = !!masterToggle?.is_enabled

      const enabledActions = new Set<string>()
      enabledActions.add('streak_reminder')
      enabledActions.add('near_reward')
      enabledActions.add('goal_gradient')
      enabledActions.add('challenge_reminder')
      enabledActions.add('welcome_followup')  // free action — onboarding nudge, always allowed
      if (campaignsEnabled) {
        enabledActions.add('reengagement')
        enabledActions.add('hero_offer')
        enabledActions.add('birthday')
      }

      // Track which customers NBA decided to leave alone — dead-hour targeting
      // will later try to pick them up for dead-hour slots today.
      const nbaNothingSet = new Set<string>()

      for (const rawC of nbaCustomers || []) {
        // Extract current_stamps from joined loyalty_cards
        const cardData = rawC.current_stamps as unknown as { current_stamps: number }[] | null
        const currentStamps = cardData?.[0]?.current_stamps || 0

        // Determine best action first (needed for exemption check)
        // Check if customer was notified in last 24h (NBA cooldown)
        const oneDayAgo = new Date(now.getTime() - 24 * 3600000).toISOString()
        const { count: recentNotifCount } = await supabase
          .from('notification_audit')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', rawC.id)
          .neq('action_chosen', 'nothing')
          .gte('decision_date', oneDayAgo)

        // Check weekly cap (exclude dead_hour_weekly type)
        const { count: weeklyCount } = await supabase
          .from('notification_queue')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', rawC.id)
          .eq('status', 'sent')
          .neq('notification_type', 'dead_hour_weekly')
          .gte('sent_at', sevenDaysAgo)

        // Check active challenges
        const { data: activeChallenge } = await supabase
          .from('customer_challenges')
          .select('id, title, started_at')
          .eq('customer_id', rawC.id)
          .eq('status', 'active')
          .limit(1)
          .single()

        // Has a challenge_reminder already fired for THIS challenge instance?
        // Cap is 1 reminder per challenge lifetime — re-pings against the same
        // goal don't change behavior, they just burn open-rate budget.
        let challengeReminderAlreadySent = false
        if (activeChallenge?.started_at) {
          const startedDate = (activeChallenge.started_at as string).split('T')[0]
          const { count: priorReminders } = await supabase
            .from('notification_audit')
            .select('*', { count: 'exact', head: true })
            .eq('customer_id', rawC.id)
            .eq('action_chosen', 'challenge_reminder')
            .eq('was_holdback', false)
            .gte('decision_date', startedDate)
          challengeReminderAlreadySent = (priorReminders || 0) > 0
        }

        // Has welcome_followup ever fired for this customer? Once-per-lifetime.
        const { count: priorWelcomes } = await supabase
          .from('notification_audit')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', rawC.id)
          .eq('action_chosen', 'welcome_followup')
          .eq('was_holdback', false)
        const welcomeFollowupAlreadySent = (priorWelcomes || 0) > 0

        const { count: completedChallenges } = await supabase
          .from('customer_challenges')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', rawC.id)
          .eq('status', 'completed')

        // Check milestone / card completion
        const justCompletedCard = recentlyCompletedCustomerIds.has(rawC.id)
        const milestones = [10, 25, 50, 100, 250, 500]
        const isMilestoneVisit = milestones.includes(rawC.total_visits)

        const customerContext = {
          id: rawC.id,
          org_id: rawC.org_id,
          full_name: rawC.full_name,
          last_visit_at: rawC.last_visit_at,
          first_visit_at: rawC.first_visit_at,
          total_visits: rawC.total_visits,
          churn_risk: rawC.churn_risk,
          optimal_discount: rawC.optimal_discount,
          current_stamps: currentStamps,
          stamps_required: stampsRequired,
          current_streak: rawC.current_streak || 0,
          streak_last_visit_date: rawC.streak_last_visit_date,
          hero_offer_count: rawC.hero_offer_count || 0,
          automation_status: rawC.automation_status || 'active',
          birth_date: rawC.birth_date,
          top_items: rawC.top_items as { item: string; count: number }[] | null,
          preferred_visit_hour: rawC.preferred_visit_hour,
          primary_location_id: rawC.primary_location_id,
          push_subscription: rawC.push_subscription,
        }

        const envContext = {
          weather,
          deadHourSeverity: deadHourRow?.severity ?? null,
          deadHourValidatedLast3Days: deadHourValidated,
          hasActiveChallenge: !!activeChallenge,
          completedLastChallenge: (completedChallenges || 0) > 0,
          justCompletedCard,
          isMilestoneVisit,
          challengeReminderAlreadySent,
          welcomeFollowupAlreadySent,
        }

        const recentActions = recentActionsByCustomer.get(rawC.id) || []
        const recentActions2Days = recentActions2DaysByCustomer.get(rawC.id) || []
        const decision = selectBestAction(customerContext, orgContext, envContext, orgActionScores || [], now, recentActions, recentActions2Days)

        if (decision.action === 'nothing') {
          nbaNothingSet.add(rawC.id)
        }

        // Exempt actions skip daily/weekly caps. These are moments where
        // suppressing the notification would cost more than the marginal
        // annoyance: birthday (once a year), goal_gradient (2 stamps away and
        // already overdue), and near_reward when stampsAway=1 (literally one
        // visit from card completion — the single highest-converting push).
        const isNearRewardFinal = decision.action === 'near_reward' && (stampsRequired - currentStamps) === 1
        const isExempt =
          decision.action === 'birthday' ||
          decision.action === 'goal_gradient' ||
          isNearRewardFinal

        if (!isExempt) {
          if ((recentNotifCount || 0) > 0) continue // Already notified today
          if ((weeklyCount || 0) >= orgContext.max_notifications_per_week) continue
        }

        // Check if the chosen action is enabled by auto-campaign toggles
        // Free actions (T1 nudges, streaks, near-reward) are always allowed
        // Reengagement, dead-hour, birthday respect owner toggles
        if (!enabledActions.has(decision.action) && decision.action !== 'nothing') {
          // Action disabled by owner — log as 'nothing' and skip
          await supabase.from('notification_audit').insert({
            org_id: org.id,
            customer_id: rawC.id,
            decision_date: now.toISOString().split('T')[0],
            action_chosen: 'nothing',
            action_reason: `${decision.action} disabled by owner toggle`,
            tier: null,
            was_holdback: false,
            outcome: 'no_visit',
            attribution_window_hours: 0,
            customer_state_json: {
              segment: getSegment(rawC.total_visits, rawC.last_visit_at ? Math.floor((now.getTime() - new Date(rawC.last_visit_at).getTime()) / 86400000) : 999),
              weather_key: weather?.isRainy ? 'rainy' : weather?.isCold ? 'cold' : weather?.isHot ? 'hot' : 'default',
              churn_risk: rawC.churn_risk,
              total_visits: rawC.total_visits,
              location_id: rawC.primary_location_id,
            },
          })
          continue
        }

        // Skip predictive actions if not enough data
        if (PREDICTIVE_ACTIONS.has(decision.action) && !hasEnoughDataForPredictive) continue

        // Cold-start cafe NBA gate: when the org has <20 customers or <4
        // weeks of older visits, the engine has no signal to learn from yet.
        // Suppress habit-reinforcement actions (streak/challenge/goal) — they
        // assume habits that don't exist for a brand-new cafe. Direct triggers
        // (near_reward, birthday), onboarding (welcome_followup), and win-back
        // (reengagement, hero_offer) still fire. Mirrors dead-hour's
        // 'learning' tier — pretend less, signal more.
        const COLD_START_SUPPRESSED = new Set(['streak_reminder', 'challenge_reminder', 'goal_gradient'])
        if (!hasEnoughDataForPredictive && COLD_START_SUPPRESSED.has(decision.action)) {
          await supabase.from('notification_audit').insert({
            org_id: org.id,
            customer_id: rawC.id,
            decision_date: now.toISOString().split('T')[0],
            action_chosen: 'nothing',
            action_reason: `${decision.action} suppressed (cafe cold-start mode)`,
            tier: null,
            was_holdback: false,
            outcome: 'no_visit',
            attribution_window_hours: 0,
            customer_state_json: {
              segment: getSegment(rawC.total_visits, rawC.last_visit_at ? Math.floor((now.getTime() - new Date(rawC.last_visit_at).getTime()) / 86400000) : 999),
              weather_key: weather?.isRainy ? 'rainy' : weather?.isCold ? 'cold' : weather?.isHot ? 'hot' : 'default',
              churn_risk: rawC.churn_risk,
              total_visits: rawC.total_visits,
              location_id: rawC.primary_location_id,
            },
          })
          continue
        }

        // Log to notification_audit
        await supabase.from('notification_audit').insert({
          org_id: org.id,
          customer_id: rawC.id,
          decision_date: now.toISOString().split('T')[0],
          action_chosen: decision.action,
          action_reason: decision.reason,
          tier: decision.tier,
          discount_used: decision.discountUsed,
          scores_json: {},
          was_holdback: false,
          scheduled_for: null,
          outcome: decision.action === 'nothing' ? 'no_visit' : 'pending',
          attribution_window_hours: decision.attributionWindowHours,
          customer_state_json: {
            segment: getSegment(rawC.total_visits, rawC.last_visit_at ? Math.floor((now.getTime() - new Date(rawC.last_visit_at).getTime()) / 86400000) : 999),
            weather_key: weather?.isRainy ? 'rainy' : weather?.isCold ? 'cold' : weather?.isHot ? 'hot' : 'default',
            churn_risk: rawC.churn_risk,
            total_visits: rawC.total_visits,
            current_stamps: currentStamps,
            location_id: LOCATION_AGNOSTIC_ACTIONS.has(decision.action) ? null : rawC.primary_location_id,
          },
        })

        // Skip if nothing
        if (decision.action === 'nothing') continue

        // Generate message
        const { data: loc } = await supabase
          .from('locations')
          .select('name')
          .eq('id', rawC.primary_location_id)
          .single()

        const stampsAway = stampsRequired - currentStamps
        const daysSinceLast = rawC.last_visit_at
          ? Math.floor((now.getTime() - new Date(rawC.last_visit_at).getTime()) / 86400000)
          : undefined
        const daysSinceFirst = rawC.first_visit_at
          ? Math.floor((now.getTime() - new Date(rawC.first_visit_at).getTime()) / 86400000)
          : undefined
        const message = generatePersonalizedMessage(
          { full_name: rawC.full_name, top_items: rawC.top_items as { item: string; count: number }[] | null, optimal_discount: rawC.optimal_discount },
          {
            type: decision.action,
            defaultDiscount: orgContext.min_discount + Math.floor((orgContext.max_discount - orgContext.min_discount) / 2),
            streakCount: rawC.current_streak,
            stampsAway: stampsAway > 0 ? stampsAway : undefined,
            challengeTitle: activeChallenge?.title as string | undefined,
            daysSinceLastVisit: daysSinceLast,
            daysSinceFirstVisit: daysSinceFirst,
          },
          { name: loc?.name || '' },
          weather
        )

        // Title based on action type. Some titles are dynamic (name/favDrink/weather).
        const firstName = rawC.full_name?.split(' ')[0] || ''
        const topItems = rawC.top_items as { item: string }[] | null
        const favDrink = topItems?.[0]?.item
        const stampsAwayNum = stampsAway > 0 ? stampsAway : 0

        function buildTitle(action: string): string {
          if (action === 'streak_reminder') {
            return (rawC.current_streak || 0) >= 3 ? 'Seri ödülüne yaklaşıyorsun' : 'Güzel başladın'
          }
          if (action === 'near_reward') {
            return stampsAwayNum === 1 ? 'Tek bir kahve kaldı' : 'Ödülüne yaklaştın'
          }
          if (action === 'goal_gradient' || action === 'stamp_boost') {
            return favDrink ? `Bugün her ${favDrink} çift damga` : 'Bugün her kahve çift damga'
          }
          if (action === 'challenge_reminder') return 'Bu hafta ekstra ödül şansı'
          if (action === 'birthday') return firstName ? `İyi ki doğdun ${firstName}` : 'İyi ki doğdun!'
          if (action === 'reengagement') {
            // Win-back cadence-aware title for lapsed_new (30/60/90).
            // Other reengagement paths fall through to standard copy.
            if (daysSinceLast !== undefined) {
              if (daysSinceLast >= 88 && daysSinceLast <= 92) return 'Son bir teklifimiz var'
              if (daysSinceLast >= 58 && daysSinceLast <= 62) return favDrink ? `O ${favDrink} seni özledi` : 'Seni özledik'
              if (daysSinceLast >= 28 && daysSinceLast <= 32) return 'Damgaların seni bekliyor'
            }
            return favDrink ? `O ${favDrink} seni özledi` : 'Bir süredir görüşmedik'
          }
          if (action === 'hero_offer') return 'Sana özel bir teklifimiz var'
          if (action === 'welcome_followup') {
            return favDrink ? `İlk ${favDrink}'in için teşekkürler` : 'Hoş geldin'
          }
          if (action === 'nudge' || action === 'weather_nudge') {
            if (weather?.isRainy) return 'Yağmurda kahve başka güzel'
            if (weather?.isCold) return 'Bu hava ısınmak ister'
            if (weather?.isHot) return 'Buz gibi bir mola'
            return 'Bugün görüşelim mi?'
          }
          return `${loc?.name || ''} seni bekliyor`
        }

        // Send-time bounds compose as ADDITIVE restrictions — strictest wins.
        // Default 13:00 (lunch — peak coffee intent in Turkey) when no
        // preferred hour. Dead-hour pushes use their own slot-relative
        // scheduling and bypass this entirely (see lib/dead-hour-targeting.ts).
        //
        // Precedence (most → least restrictive):
        //   1. Org's quiet_hours_start/end (owner-declared, never overridden)
        //   2. Hard rails 10:00–19:00 (platform defaults — protect against
        //      pathological preferred_visit_hour values like 03:00 from a
        //      single late-night visit)
        //   3. preferred_visit_hour - 1 (personalization — best when both
        //      bounds allow)
        //
        // Concrete case: customer sets quietEnd=18 → ceiling = min(19, 17) = 17,
        // so we send at 17:00 max. Customer with preferred=22 + quietEnd=21 →
        // ceiling = min(19, 20) = 19, target = 21, final = 19.
        //
        // Note: setHours operates in container local time, so this assumes
        // TZ=Europe/Istanbul env var on the app container.
        const sendHour = rawC.preferred_visit_hour
        const quietStart = parseInt(orgContext.quiet_hours_start.split(':')[0])
        const quietEnd = parseInt(orgContext.quiet_hours_end.split(':')[0])
        const HARD_EARLIEST = 10
        const HARD_LATEST = 19
        const ceiling = Math.min(HARD_LATEST, quietEnd - 1)
        const floor = Math.max(HARD_EARLIEST, quietStart)
        const target = sendHour ? sendHour - 1 : 13
        const scheduledHour = Math.min(ceiling, Math.max(floor, target))
        const scheduledFor = new Date(now)
        scheduledFor.setHours(scheduledHour, 0, 0, 0)
        if (scheduledFor < now) scheduledFor.setDate(scheduledFor.getDate() + 1)

        // Update audit with scheduled time
        await supabase.from('notification_audit')
          .update({ scheduled_for: scheduledFor.toISOString() })
          .eq('customer_id', rawC.id)
          .eq('decision_date', now.toISOString().split('T')[0])
          .eq('action_chosen', decision.action)

        // Queue the notification
        // notification_type drives both the dead_hour_weekly cap exclusion and
        // the cap-exempt set in the queue processor. near_reward at stampsAway=1
        // is the highest-converting moment in the customer lifecycle (one visit
        // from a free coffee) — we tag it as 'near_reward_final' so it bypasses
        // the weekly cap. See CAP_EXEMPT_TYPES in notification-queue/route.ts.
        const notificationType = decision.action === 'near_reward' && stampsAway === 1
          ? 'near_reward_final'
          : decision.action
        await supabase.from('notification_queue').insert({
          org_id: org.id,
          customer_id: rawC.id,
          title: buildTitle(decision.action),
          body: message,
          scheduled_for: scheduledFor.toISOString(),
          notification_type: notificationType,
          discount_used: decision.discountUsed,
          personalization_tier: (rawC.top_items as unknown[])?.length > 0 ? 'tier2' : 'tier1',
          offer_type: decision.tier === 3 || decision.tier === 4 ? 'discount_percent' : 'bonus_stamp',
          offer_value: decision.discountUsed,
        })

        // Create customer_offers for redeemable actions
        const REDEEMABLE_ACTIONS = new Set(['goal_gradient', 'reengagement', 'hero_offer'])

        if (REDEEMABLE_ACTIONS.has(decision.action)) {
          // Duplicate check
          const { data: existingOffer } = await supabase
            .from('customer_offers')
            .select('id')
            .eq('customer_id', rawC.id)
            .eq('type', decision.action)
            .eq('status', 'active')
            .gt('expires_at', now.toISOString())
            .maybeSingle()

          if (!existingOffer) {
            let expiresAt: Date
            if (decision.action === 'goal_gradient') {
              expiresAt = new Date(now); expiresAt.setHours(23, 59, 59, 999)
            } else if (decision.action === 'hero_offer') {
              expiresAt = new Date(now.getTime() + 14 * 86400000)
            } else {
              expiresAt = new Date(now.getTime() + 7 * 86400000)
            }

            const { data: newOffer } = await supabase.from('customer_offers').insert({
              org_id: org.id,
              customer_id: rawC.id,
              type: decision.action,
              title: buildTitle(decision.action),
              description: message,
              offer_type: decision.action === 'goal_gradient' ? 'double_stamp' : 'discount_percent',
              offer_value: decision.discountUsed,
              notification_id: null,
              status: 'active',
              expires_at: expiresAt.toISOString(),
            }).select('id').single()

            // Deep-link the push notification to this offer
            if (newOffer) {
              await supabase.from('notification_queue')
                .update({ url: `/?tab=magaza&offer=${newOffer.id}` })
                .eq('customer_id', rawC.id)
                .eq('org_id', org.id)
                .order('created_at', { ascending: false })
                .limit(1)
            }
          }
        }

        // Increment hero count if hero offer sent
        if (decision.action === 'hero_offer') {
          await supabase.from('customers')
            .update({ hero_offer_count: (rawC.hero_offer_count || 0) + 1 })
            .eq('id', rawC.id)
        }

        totalCampaigns++
      }

      // 4.5 Dead-hour targeting (tiered by café maturity):
      //   learning (< 4 weeks OR < 50 real visits): skip targeting entirely
      //   ramping  (4-8 weeks):                     conservative — severity >= 0.7, capacity ×1.5
      //   full     (8+ weeks):                      full — severity >= 0.5, capacity ×3
      //
      // The learning loop + abandonment checker ALWAYS run regardless of tier —
      // they're cheap no-ops when there's no data, and resolving yesterday's
      // pushes doesn't depend on today's tier.
      const { selectDeadHourTargets } = await import('@/lib/dead-hour-targeting')
      const { resolveDeadHourAttributions, checkSlotAbandonment } = await import('@/lib/dead-hour-learning')

      // Café maturity tier — uses cafeAgeWeeks + hasMinimumVolume that were
      // computed upfront so the dead-hour detector could share them.
      // Compressed thresholds (2026-05-11): 1 week learning, 1-4 weeks ramping,
      // 4+ weeks full. Was 4/8 — owner feedback: "1 week of data is already
      // enough to know what is happening." The minimum-volume gate (50 real
      // visits) still protects against truly sparse data triggering false
      // positives, and the abandonment system kills bad slots that don't
      // convert.
      const tier: 'learning' | 'ramping' | 'full' =
        (cafeAgeWeeks < 1 || !hasMinimumVolume) ? 'learning'
        : cafeAgeWeeks < 4 ? 'ramping'
        : 'full'
      dhTierCounts[tier]++

      if (tier !== 'learning' && campaignsEnabled) {
        const { data: orgFull } = await supabase
          .from('organizations')
          .select('slug, dead_hour_discount')
          .eq('id', org.id)
          .single()

        if (orgFull?.slug) {
          const deadHourConfig = tier === 'ramping'
            ? { severityThreshold: 0.7, capacityMultiplier: 1.5 }
            : { severityThreshold: 0.5, capacityMultiplier: 3.0 }

          await selectDeadHourTargets({
            supabase,
            orgId: org.id,
            orgSlug: orgFull.slug,
            now,
            nbaNothingSet,
            deadHourDiscount: (orgFull as { dead_hour_discount: number | null }).dead_hour_discount || 15,
            quietStart: parseInt(orgContext.quiet_hours_start.split(':')[0]),
            config: deadHourConfig,
          })
        }
      }

      // Learning loop + abandonment run unconditionally — they're independent
      // of today's tier (they process yesterday's pushes) and are cheap no-ops
      // when there's no data.
      await resolveDeadHourAttributions(supabase, org.id, now)
      await checkSlotAbandonment(supabase, org.id, now)

      // 4a. Generate challenges for customers without active ones
      const { generateChallenge, createChallenge, expireChallenges } = await import('@/lib/challenges')

      // Expire overdue challenges first
      await expireChallenges(supabase, org.id)

      for (const rawC of nbaCustomers || []) {
        const challenge = await generateChallenge(supabase, {
          id: rawC.id,
          org_id: rawC.org_id,
          total_visits: rawC.total_visits,
          top_items: rawC.top_items as { item: string; count: number }[] | null,
          preferred_visit_hour: rawC.preferred_visit_hour,
          avg_spend: null,
        })

        if (challenge) {
          await createChallenge(supabase, rawC.id, org.id, challenge)
        }
      }

      // 4b. LEARN: Visit-based discount learning (via notification_audit)
      const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString()
      const threeDaysAgoLearn = new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString()

      // Exclude 'dead_hour_targeted' — those audits are processed by
      // resolveDeadHourAttributions in lib/dead-hour-learning.ts with
      // location-aware window logic. If NBA learning picked them up as a
      // fallback, it would pollute customers.optimal_discount (a reengagement
      // signal) and insert orphaned action_scores rows for an action the NBA
      // engine doesn't consume.
      const { data: sentNotifs } = await supabase
        .from('notification_audit')
        .select('id, customer_id, scheduled_for, discount_used, org_id, outcome, attribution_window_hours, action_chosen, customer_state_json')
        .eq('org_id', org.id)
        .eq('was_holdback', false)
        .not('action_chosen', 'in', '(nothing,dead_hour_targeted)')
        .eq('outcome', 'pending')
        .gte('decision_date', threeDaysAgoLearn.split('T')[0])
        .lte('decision_date', twoDaysAgo.split('T')[0])

      for (const notif of sentNotifs || []) {
        // Check if customer visited within attribution window
        const windowMs = (notif.attribution_window_hours || 24) * 3600000
        const scheduledTime = new Date(notif.scheduled_for)
        const { count: visitCount } = await supabase
          .from('visits')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', notif.customer_id)
          .gte('visited_at', notif.scheduled_for)
          .lte('visited_at', new Date(scheduledTime.getTime() + windowMs).toISOString())

        const visited = (visitCount || 0) > 0

        const { updateDiscountLearning } = await import('@/lib/intelligence')
        await updateDiscountLearning(supabase, notif.customer_id, visited, orgContext.min_discount, orgContext.max_discount)

        // Update action scores (Thompson Sampling data collection)
        const seg = (notif.customer_state_json as Record<string, unknown>)?.segment as string || 'active'
        const wk = (notif.customer_state_json as Record<string, unknown>)?.weather_key as string || 'default'

        const { data: existingScore } = await supabase
          .from('action_scores')
          .select('alpha, beta, attempts, successes')
          .eq('org_id', org.id)
          .eq('segment', seg)
          .eq('action', notif.action_chosen)
          .eq('context_key', wk)
          .maybeSingle()

        if (existingScore) {
          await supabase.from('action_scores').update({
            alpha: existingScore.alpha + (visited ? 1 : 0),
            beta: existingScore.beta + (visited ? 0 : 1),
            attempts: existingScore.attempts + 1,
            successes: existingScore.successes + (visited ? 1 : 0),
            score: (existingScore.successes + (visited ? 1 : 0)) / (existingScore.attempts + 1),
            updated_at: new Date().toISOString(),
          }).eq('org_id', org.id).eq('segment', seg).eq('action', notif.action_chosen).eq('context_key', wk)
        } else {
          await supabase.from('action_scores').insert({
            org_id: org.id, segment: seg, action: notif.action_chosen, context_key: wk,
            alpha: 1 + (visited ? 1 : 0), beta: 1 + (visited ? 0 : 1),
            attempts: 1, successes: visited ? 1 : 0, score: visited ? 1 : 0,
          })
        }

        // Mark audit row as resolved
        await supabase.from('notification_audit').update({
          outcome: visited ? 'visited' : 'no_visit',
          outcome_resolved_at: new Date().toISOString(),
        }).eq('id', notif.id)
      }
    }

    // 4c. Reengagement retry: active offer created 3+ days ago, not claimed
    const { data: retryOffers } = await supabase
      .from('customer_offers')
      .select('id, customer_id, offer_value, expires_at')
      .eq('org_id', org.id)
      .eq('type', 'reengagement')
      .eq('status', 'active')
      .lt('created_at', new Date(now.getTime() - 3 * 86400000).toISOString())

    for (const offer of retryOffers || []) {
      const { count: recentPush } = await supabase
        .from('notification_queue')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', offer.customer_id)
        .gte('scheduled_for', new Date(now.getTime() - 48 * 3600000).toISOString())

      if ((recentPush || 0) === 0) {
        const { data: cust } = await supabase
          .from('customers')
          .select('full_name, push_subscription')
          .eq('id', offer.customer_id)
          .single()

        if (cust?.push_subscription) {
          const name = cust.full_name?.split(' ')[0] || ''
          const hoursUntilExpiry = (new Date(offer.expires_at).getTime() - now.getTime()) / 3600000
          const expiringSoon = hoursUntilExpiry > 0 && hoursUntilExpiry < 48
          const discount = offer.offer_value || 0
          const retryTitle = expiringSoon ? 'Teklifin yarın sona eriyor' : 'Teklifin hâlâ açık'
          const retryBody = expiringSoon
            ? `${name}, %${discount} indirim hakkını kullanmaya son şansın. Hemen uğra.`
            : `${name}, sana özel %${discount} indirim hâlâ geçerli. Bu hafta uğramaya ne dersin?`
          await supabase.from('notification_queue').insert({
            org_id: org.id,
            customer_id: offer.customer_id,
            title: retryTitle,
            body: retryBody,
            url: `/?tab=magaza&offer=${offer.id}`,
            scheduled_for: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0).toISOString(),
            status: 'queued',
          })
        }
      }
    }

    // 5. Primary location update (most-visited location in last 60 days)
    for (const c of customers || []) {
      const { data: recentVisits } = await supabase
        .from('visits')
        .select('location_id')
        .eq('customer_id', c.id)
        .gte('visited_at', new Date(now.getTime() - 60 * 86400000).toISOString())

      if (recentVisits && recentVisits.length > 0) {
        const locCounts = new Map<string, number>()
        for (const v of recentVisits) {
          locCounts.set(v.location_id, (locCounts.get(v.location_id) ?? 0) + 1)
        }
        let topLocId = recentVisits[0].location_id
        let topCount = 0
        for (const [locId, count] of locCounts) {
          if (count > topCount) { topLocId = locId; topCount = count }
        }
        await supabase.from('customers').update({ primary_location_id: topLocId }).eq('id', c.id)
      }
    }
  }

  return NextResponse.json({ success: true, orgs: orgs.length, scored: totalScored, prefs: totalPrefs, campaigns: totalCampaigns, dead_hour_tier_counts: dhTierCounts })
}

export { POST as GET }

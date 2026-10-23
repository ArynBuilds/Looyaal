// Next Best Action (NBA) Scoring Engine
// Pure functions — no database calls, no side effects.
// Scores 11 possible actions for a customer and returns the single best one.

import { thompsonSample, shouldUseLearnedScores, getSegment } from './thompson-sampling'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ActionType =
  | 'nothing' | 'streak_reminder' | 'near_reward' | 'goal_gradient'
  | 'challenge_reminder' | 'birthday' | 'reengagement' | 'hero_offer'
  | 'welcome_followup'

export type Tier = 1 | 2 | 3 | 4

export interface NBACandidate {
  action: ActionType
  score: number
  tier: Tier | null  // null for 'nothing'
  reason: string
  discountUsed: number | null  // null for T1/T2
  attributionWindowHours: number
}

export interface CustomerContext {
  id: string
  org_id: string
  full_name: string | null
  last_visit_at: string | null
  first_visit_at: string | null
  total_visits: number
  churn_risk: number | null
  optimal_discount: number | null
  current_stamps: number
  stamps_required: number
  current_streak: number
  streak_last_visit_date: string | null
  hero_offer_count: number
  automation_status: string
  birth_date: string | null
  top_items: { item: string; count: number }[] | null
  preferred_visit_hour: number | null
  primary_location_id: string | null
  push_subscription: unknown
}

export interface OrgContext {
  id: string
  min_discount: number
  max_discount: number
  quiet_hours_start: string
  quiet_hours_end: string
  max_notifications_per_week: number
}

export interface EnvironmentContext {
  weather: { isRainy: boolean; isCold: boolean; isHot: boolean; temperature: number } | null
  deadHourSeverity: number | null  // 0-1, null if not a dead hour right now
  deadHourValidatedLast3Days: boolean  // true if last 3 days confirm this is actually dead
  hasActiveChallenge: boolean
  completedLastChallenge: boolean
  justCompletedCard: boolean  // completed loyalty card recently
  isMilestoneVisit: boolean  // total_visits is 10, 25, 50, or 100
  // True when a challenge_reminder was already sent for the CURRENT active
  // challenge instance (decision_date >= challenge.started_at). One reminder
  // per 7-day challenge lifetime is the cap — repeated pushes against the
  // same goal don't change behavior, they just poison future opens.
  challengeReminderAlreadySent: boolean
  // Welcome flow tracking — true if welcome_followup has ever been sent.
  // Welcome is a once-per-lifetime action, fires on days 3-5 post-first-visit.
  welcomeFollowupAlreadySent: boolean
}

// ---------------------------------------------------------------------------
// Attribution windows
// ---------------------------------------------------------------------------

// Attribution windows: how long after a push we credit a visit to the action.
// Widened on 2026-04-10 after a walkthrough showed real conversions missing the
// 24h window by a few hours (customer gets push Mon noon, visits Tue 2pm = 26h).
const ATTRIBUTION_WINDOWS: Record<ActionType, number> = {
  nothing: 0,
  streak_reminder: 24,       // streak mechanic cares about consecutive days
  near_reward: 48,           // stamp proximity is evergreen — allow slack
  goal_gradient: 24,         // explicitly expires at midnight
  challenge_reminder: 48,    // challenges are 7-day, no need to be tight
  birthday: 168,             // unchanged
  reengagement: 72,          // allow "day later" response
  hero_offer: 168,           // max 2 per lifetime, give it room
  welcome_followup: 168,     // 7 days — full week to make a 2nd visit
}

export function getAttributionWindow(action: ActionType): number {
  return ATTRIBUTION_WINDOWS[action]
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function daysBetween(a: Date, b: Date): number {
  return Math.floor(Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24))
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

function computeOverdueRatio(daysSinceLastVisit: number, totalVisits: number, firstVisit: Date | null, now: Date): number {
  if (!firstVisit || totalVisits <= 1) return daysSinceLastVisit // no cadence data
  const daysSinceFirst = Math.max(1, daysBetween(now, firstVisit))
  const avgGap = daysSinceFirst / Math.max(1, totalVisits - 1)
  return avgGap > 0 ? daysSinceLastVisit / avgGap : daysSinceLastVisit
}

// ---------------------------------------------------------------------------
// Scoring functions — each returns an NBACandidate (score = -Infinity to skip)
// ---------------------------------------------------------------------------

const SKIP = -Infinity

// ---------------------------------------------------------------------------
// Segment-aware score multipliers
// The scoring functions produce a "base score" assuming an active customer.
// These multipliers adjust for segment reality:
//   active  → full score (the baseline)
//   new     → slightly lower (no history, uncertain)
//   at_risk → heavily penalize nudges, favor discounts
//   dormant → only hero_offer makes sense, suppress everything else
// ---------------------------------------------------------------------------

type Segment = 'active' | 'new' | 'at_risk' | 'dormant' | 'lapsed_new'

const SEGMENT_MULTIPLIERS: Record<Segment, Partial<Record<ActionType, number>>> = {
  active: {}, // 1.0 for everything (default)
  new: {
    streak_reminder: 0.5,  // no streak history yet
    near_reward: 0.7,      // may not understand the card yet
    reengagement: 0.3,     // they're new, not re-engaging
    hero_offer: 0.0,       // never send hero to new customers
    welcome_followup: 1.0, // THIS is the right action for new — at full force
  },
  // 77% of restaurant customers visit once and never return — this segment
  // catches them at 14+ days lapsed with ≤2 visits. Industry win-back research
  // says the right play is a 30/60/90 reengagement cadence with loss-aversion
  // copy, NOT a challenge/streak/goal_gradient nudge. We suppress the habit
  // actions (× 0) and boost reengagement (× 1.5). The cadence-gating that
  // limits this to days 30/60/90 lives inside scoreReengagement.
  lapsed_new: {
    streak_reminder: 0.0,
    near_reward: 0.5,       // only fires at stampsAway ≤ 3 anyway
    goal_gradient: 0.0,
    challenge_reminder: 0.0,
    welcome_followup: 0.0,  // they missed the welcome window
    reengagement: 1.5,      // THIS is the right action
    hero_offer: 1.0,        // viable as final shot on day 90
  },
  at_risk: {
    streak_reminder: 0.25, // streak already broken
    near_reward: 0.4,      // stamps alone won't bring them back
    goal_gradient: 0.5,    // weak motivator for at-risk
    challenge_reminder: 0.3, // not engaged enough for challenges
    reengagement: 1.2,     // THIS is the right action — boost it
    hero_offer: 0.8,       // viable if reengagement fails
    welcome_followup: 0.0, // long past welcome window
  },
  dormant: {
    streak_reminder: 0.0,  // no streak, waste of budget
    near_reward: 0.1,      // they forgot about stamps
    goal_gradient: 0.1,    // irrelevant
    challenge_reminder: 0.0, // not engaged at all
    reengagement: 0.5,     // might work with big discount
    hero_offer: 1.3,       // last resort, best shot
    welcome_followup: 0.0, // long past welcome window
  },
}

function applySegmentMultiplier(score: number, action: ActionType, segment: string): number {
  if (score === SKIP) return SKIP
  const multipliers = SEGMENT_MULTIPLIERS[segment as Segment]
  if (!multipliers) return score // unknown segment, keep original
  const mult = multipliers[action]
  if (mult === undefined) return score // no override, keep original
  if (mult === 0) return SKIP // 0 means skip entirely
  return score * mult
}

function scoreNothing(daysSince: number, overdueRatio: number): NBACandidate {
  let score = 0
  let reason = 'Eylem gerekmiyor'
  if (daysSince === 0) { score += 50; reason = 'Bugün zaten ziyaret etti' }
  else if (daysSince === 1) { score += 30; reason = 'Dün ziyaret etti' }
  else if (overdueRatio < 1.0) { score += 20; reason = 'Beklenen ziyaret zamanı gelmedi' }
  return { action: 'nothing', score, tier: null, reason, discountUsed: null, attributionWindowHours: 0 }
}

function scoreStreakReminder(customer: CustomerContext, daysSince: number, now: Date): NBACandidate {
  if (customer.current_streak === 0) {
    return { action: 'streak_reminder', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.streak_reminder }
  }
  if (customer.streak_last_visit_date) {
    const lastStreakDay = new Date(customer.streak_last_visit_date)
    if (isSameDay(lastStreakDay, now)) {
      return { action: 'streak_reminder', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.streak_reminder }
    }
  }
  // Bug 4 fix: streak mechanic only makes sense for daily-cadence customers.
  // If the customer's natural visit rhythm is slower than every ~2.5 days,
  // streak reminders will always fail and the feature is noise for them.
  if (customer.first_visit_at && customer.total_visits > 1) {
    const firstVisit = new Date(customer.first_visit_at)
    const lifetime = Math.max(1, Math.floor(Math.abs(now.getTime() - firstVisit.getTime()) / 86400000))
    const avgGap = lifetime / (customer.total_visits - 1)
    if (avgGap > 2.5) {
      return { action: 'streak_reminder', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.streak_reminder }
    }
  }
  let score = 70
  if (customer.current_streak >= 3) score += 20
  return {
    action: 'streak_reminder', score, tier: 1,
    reason: `${customer.current_streak} gunluk seri — hatirlatma`,
    discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.streak_reminder,
  }
}

function scoreNearReward(customer: CustomerContext): NBACandidate {
  const stampsAway = customer.stamps_required - customer.current_stamps
  if (stampsAway > 3 || stampsAway <= 0) {
    return { action: 'near_reward', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.near_reward }
  }
  let score = 80
  // +10 per stamp closer: 1 away = +20, 2 away = +10, 3 away = +0
  score += (3 - stampsAway) * 10
  return {
    action: 'near_reward', score, tier: 1,
    reason: `Odule ${stampsAway} puan kaldi`,
    discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.near_reward,
  }
}

function scoreGoalGradient(customer: CustomerContext, overdueRatio: number): NBACandidate {
  const stampsAway = customer.stamps_required - customer.current_stamps
  if (stampsAway > 2 || stampsAway <= 0 || overdueRatio < 1.3) {
    return { action: 'goal_gradient', score: SKIP, tier: 2, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.goal_gradient }
  }
  return {
    action: 'goal_gradient', score: 60, tier: 2,
    reason: `${stampsAway} puan kaldi ve ${Math.round(overdueRatio * 10) / 10}x gec`,
    discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.goal_gradient,
  }
}


function scoreChallengeReminder(env: EnvironmentContext): NBACandidate {
  if (!env.hasActiveChallenge) {
    return { action: 'challenge_reminder', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.challenge_reminder }
  }
  // Cap: 1 reminder per challenge instance. After we've already pinged for
  // this challenge, going silent until expiry/completion is better than
  // re-pinging — the 7-day rolling soft penalty in the suppression layer
  // does NOT catch this because it resets when a new challenge spawns.
  if (env.challengeReminderAlreadySent) {
    return { action: 'challenge_reminder', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.challenge_reminder }
  }
  let score = 45
  if (env.hasActiveChallenge) score += 15
  if (env.completedLastChallenge) score += 10
  return {
    action: 'challenge_reminder', score, tier: 1,
    reason: 'Aktif gorev hatirlatma',
    discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.challenge_reminder,
  }
}

function scoreBirthday(customer: CustomerContext, now: Date): NBACandidate {
  if (!customer.birth_date) {
    return { action: 'birthday', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.birthday }
  }
  const bd = new Date(customer.birth_date)
  if (bd.getMonth() !== now.getMonth() || bd.getDate() !== now.getDate()) {
    return { action: 'birthday', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.birthday }
  }
  return {
    action: 'birthday', score: 90, tier: 1,
    reason: 'Dogum gunu!',
    discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.birthday,
  }
}

function scoreReengagement(
  customer: CustomerContext,
  org: OrgContext,
  overdueRatio: number,
  segment: string,
  daysSince: number,
): NBACandidate {
  // lapsed_new branch: 30/60/90 cadence win-back. Industry research
  // (Braze, Klaviyo, Welcome Back, Regulr) all converge on this cadence:
  // 30 days is "sweet spot" for first contact, then 60, then 90 as final
  // attempt. Outside these windows for a lapsed_new customer → silent.
  if (segment === 'lapsed_new') {
    const inDay30Window = daysSince >= 28 && daysSince <= 32
    const inDay60Window = daysSince >= 58 && daysSince <= 62
    const inDay90Window = daysSince >= 88 && daysSince <= 92
    if (!inDay30Window && !inDay60Window && !inDay90Window) {
      return { action: 'reengagement', score: SKIP, tier: 3, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.reengagement }
    }
    let score = 80
    if (inDay60Window) score = 85
    if (inDay90Window) score = 90  // last shot — highest score
    const discount = customer.optimal_discount ?? Math.round((org.min_discount + org.max_discount) / 2)
    return {
      action: 'reengagement', score, tier: 3,
      reason: `Win-back day ${daysSince} (lapsed_new)`,
      discountUsed: discount, attributionWindowHours: ATTRIBUTION_WINDOWS.reengagement,
    }
  }

  // Standard reengagement path for at_risk / dormant
  const churnRisk = customer.churn_risk ?? 0
  if (churnRisk < 0.6 || overdueRatio < 2.0) {
    return { action: 'reengagement', score: SKIP, tier: 3, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.reengagement }
  }
  let score = 55
  if (churnRisk >= 0.7) score += 20
  if (churnRisk >= 0.8) score += 10
  const discount = customer.optimal_discount ?? Math.round((org.min_discount + org.max_discount) / 2)
  return {
    action: 'reengagement', score, tier: 3,
    reason: `Kayip riski %${Math.round(churnRisk * 100)} — geri kazanim`,
    discountUsed: discount, attributionWindowHours: ATTRIBUTION_WINDOWS.reengagement,
  }
}

function scoreWelcomeFollowup(
  customer: CustomerContext,
  env: EnvironmentContext,
  now: Date,
): NBACandidate {
  // Welcome flow: fires once, ever, on days 3-7 after a customer's first
  // visit if they haven't returned. Starbucks model — front-load value into
  // the first week to maximize odds of a 2nd visit while motivation is
  // highest. Locked via notification_audit (env.welcomeFollowupAlreadySent).
  if (customer.total_visits > 2) {
    return { action: 'welcome_followup', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.welcome_followup }
  }
  if (env.welcomeFollowupAlreadySent) {
    return { action: 'welcome_followup', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.welcome_followup }
  }
  if (!customer.first_visit_at) {
    return { action: 'welcome_followup', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.welcome_followup }
  }
  const daysSinceFirstVisit = daysBetween(now, new Date(customer.first_visit_at))
  if (daysSinceFirstVisit < 3 || daysSinceFirstVisit > 7) {
    return { action: 'welcome_followup', score: SKIP, tier: 1, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.welcome_followup }
  }
  return {
    action: 'welcome_followup', score: 85, tier: 1,
    reason: `Welcome followup day ${daysSinceFirstVisit}`,
    discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.welcome_followup,
  }
}

function scoreHeroOffer(customer: CustomerContext, org: OrgContext, daysSince: number): NBACandidate {
  if (customer.hero_offer_count >= 2 || daysSince < 60) {
    return { action: 'hero_offer', score: SKIP, tier: 4, reason: '', discountUsed: null, attributionWindowHours: ATTRIBUTION_WINDOWS.hero_offer }
  }
  const churnRisk = customer.churn_risk ?? 0
  let score = 30
  if (churnRisk >= 0.95) score += 30
  return {
    action: 'hero_offer', score, tier: 4,
    reason: 'Son sans teklifi',
    discountUsed: org.max_discount, attributionWindowHours: ATTRIBUTION_WINDOWS.hero_offer,
  }
}


// ---------------------------------------------------------------------------
// Main selector
// ---------------------------------------------------------------------------

export function selectBestAction(
  customer: CustomerContext,
  org: OrgContext,
  env: EnvironmentContext,
  actionScores: { segment: string; action: string; context_key: string; alpha: number; beta: number; attempts: number }[],
  now: Date = new Date(),
  recentSentActions: string[] = [],     // actions sent to this customer in last 7 days
  recentSentLast2Days: string[] = []    // actions sent to this customer in last 2 days
): NBACandidate {
  // Compute shared metrics
  const lastVisit = customer.last_visit_at ? new Date(customer.last_visit_at) : null
  const firstVisit = customer.first_visit_at ? new Date(customer.first_visit_at) : null
  const daysSince = lastVisit ? daysBetween(now, lastVisit) : 999
  const overdueRatio = computeOverdueRatio(daysSince, customer.total_visits, firstVisit, now)

  const segment = getSegment(customer.total_visits, daysSince)
  const weatherKey = env.weather?.isRainy ? 'rainy' : env.weather?.isCold ? 'cold' : env.weather?.isHot ? 'hot' : 'default'
  const useLearnedScores = shouldUseLearnedScores(actionScores, segment)

  function getScore(action: string, hardcodedScore: number): number {
    if (!useLearnedScores) return hardcodedScore
    const row = actionScores.find(s => s.segment === segment && s.action === action && s.context_key === weatherKey)
      || actionScores.find(s => s.segment === segment && s.action === action && s.context_key === 'default')
    if (!row) return hardcodedScore
    return thompsonSample(row.alpha, row.beta) * 100
  }

  // Score all candidates
  const candidates: NBACandidate[] = [
    scoreNothing(daysSince, overdueRatio),
    scoreStreakReminder(customer, daysSince, now),
    scoreNearReward(customer),
    scoreGoalGradient(customer, overdueRatio),
    scoreChallengeReminder(env),
    scoreBirthday(customer, now),
    scoreReengagement(customer, org, overdueRatio, segment, daysSince),
    scoreHeroOffer(customer, org, daysSince),
    scoreWelcomeFollowup(customer, env, now),
  ]

  // Step 1 — Apply segment skip rules (mult=0 means "don't send this action
  // to this segment at all"). This is business logic that should survive
  // Thompson Sampling activation — e.g., never send streak_reminder to
  // dormant customers even if the global learned score is high.
  // We apply the multiplier here but only to catch SKIP cases. The non-zero
  // scaling gets re-applied after Thompson in step 3.
  for (const c of candidates) {
    if (c.action !== 'birthday' && c.action !== 'nothing') {
      const adjusted = applySegmentMultiplier(c.score, c.action, segment)
      if (adjusted === SKIP) c.score = SKIP
    }
  }

  // Step 2 — Override scores with Thompson Sampling when threshold met.
  // This uses learned per-segment conversion rates. Hardcoded scores are
  // only kept when learning hasn't activated yet.
  for (const c of candidates) {
    if (c.score !== SKIP) {
      c.score = getScore(c.action, c.score)
    }
  }

  // Step 3 — Re-apply non-zero segment multipliers AFTER Thompson Sampling,
  // so business logic (e.g., "new customers convert at 0.3x on reengagement")
  // still scales the learned score. Without this step, TS activation would
  // erase segment-aware scaling and use pure aggregate conversion rates.
  for (const c of candidates) {
    if (c.score === SKIP || c.action === 'birthday' || c.action === 'nothing') continue
    const multipliers = SEGMENT_MULTIPLIERS[segment as Segment]
    if (!multipliers) continue
    const mult = multipliers[c.action]
    if (mult !== undefined && mult !== 0) {
      c.score = c.score * mult
    }
  }

  // ─── Suppression layer (applied AFTER scoring) ──────────────────────────
  //
  // Precedence (strongest → weakest):
  //   1. Last-2-days HARD SKIP    — push fatigue prevention (no repeats)
  //   2. Stamp-state cap          — max 3 near_reward at stampsAway=1 / 7d
  //   3. Last-7-days SOFT PENALTY — 0.5x for 1 send, SKIP for 2+
  //
  // Exemptions:
  //   - birthday: defensive only — scoreBirthday already gates on exact
  //     date, so this branch never fires twice per year. Kept in case a
  //     future change widens to a birthday-week.
  //   - near_reward_final (stampsAway=1): bypasses rule 1 only, NOT rule 2.
  //     This is the highest-EV moment in the lifecycle, but spamming a
  //     stuck-at-9/10 customer for 3+ weeks poisons all future opens.
  const isNearRewardFinal = customer.stamps_required - customer.current_stamps === 1
  for (const c of candidates) {
    if (c.score === SKIP || c.action === 'birthday' || c.action === 'nothing') continue

    // Rule 2: stamp-state cap. Even at 9/10, max 3 near_reward sends in
    // the last 7 days. After that, the customer has heard the message —
    // more pushes won't change their mind, only their willingness to open
    // the next push (any push) from us.
    if (c.action === 'near_reward' && isNearRewardFinal) {
      const recentNearReward = recentSentActions.filter(a => a === 'near_reward').length
      if (recentNearReward >= 3) {
        c.score = SKIP
      }
      // Skip rules 1 and 3 — near_reward_final is exempt from same-action repeat
      // suppression (the whole point is to keep nudging until they visit).
      continue
    }

    // Rule 1: hard skip if same action sent in last 2 days.
    if (recentSentLast2Days.includes(c.action)) {
      c.score = SKIP
      continue
    }

    // Rule 3: soft penalty over 7 days as backstop.
    const recentCount = recentSentActions.filter(a => a === c.action).length
    if (recentCount >= 2) c.score = SKIP
    else if (recentCount === 1) c.score = c.score * 0.5
  }

  // Filter out skipped candidates
  const viable = candidates.filter(c => c.score !== SKIP)

  if (viable.length === 0) {
    return scoreNothing(daysSince, overdueRatio)
  }

  // Sort: highest score first, then lowest tier on tie (null tier = Infinity so 'nothing' loses ties)
  viable.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    const aTier = a.tier ?? Infinity
    const bTier = b.tier ?? Infinity
    return aTier - bTier
  })

  return viable[0]
}

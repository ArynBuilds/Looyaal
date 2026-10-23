export function thompsonSample(alpha: number, beta: number): number {
  const x = gammaSample(alpha)
  const y = gammaSample(beta)
  return x / (x + y)
}

function gammaSample(shape: number): number {
  if (shape < 1) return gammaSample(shape + 1) * Math.pow(Math.random(), 1 / shape)
  const d = shape - 1 / 3
  const c = 1 / Math.sqrt(9 * d)
  while (true) {
    let x: number, v: number
    do { x = randn(); v = 1 + c * x } while (v <= 0)
    v = v * v * v
    const u = Math.random()
    if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v
  }
}

function randn(): number {
  const u = 1 - Math.random()
  const v = Math.random()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

// Threshold per segment: at_risk/dormant/lapsed_new learn faster because
// hardcoded scores are provably bad for these segments.
// active/new stay at 200 — hardcoded scores work fine, need confidence.
const SEGMENT_THRESHOLDS: Record<string, number> = {
  active: 200,
  new: 200,
  at_risk: 100,
  dormant: 100,
  lapsed_new: 100,
}

export function shouldUseLearnedScores(
  actionScores: { segment: string; attempts: number }[],
  segment: string,
  minObservations?: number
): boolean {
  const threshold = minObservations ?? SEGMENT_THRESHOLDS[segment] ?? 200
  const total = actionScores
    .filter(s => s.segment === segment)
    .reduce((sum, s) => sum + s.attempts, 0)
  return total >= threshold
}

export function getSegment(totalVisits: number, daysSinceLastVisit: number): string {
  // lapsed_new: 1-2 visits AND lapsed 14+ days. This is the 77% one-and-done
  // cohort — distinct from "new active customer" who's still in their first
  // week. Misclassifying them as 'new' suppresses reengagement (multiplier
  // 0.3) and lets challenge_reminder dominate, which is the wrong action.
  if (totalVisits <= 2 && daysSinceLastVisit >= 14) return 'lapsed_new'
  if (totalVisits <= 3) return 'new'
  if (daysSinceLastVisit <= 7) return 'active'
  if (daysSinceLastVisit <= 30) return 'at_risk'
  return 'dormant'
}

export function isLikelyDeadHourCandidate(
  customer: { preferred_visit_hour: number | null; primary_location_id: string | null },
  propensity: { visits_during_dead_hour: number },
  deadHour: { hour: number; location_id: string }
): boolean {
  if (propensity.visits_during_dead_hour > 0) return true
  if (customer.preferred_visit_hour != null) {
    const diff = Math.abs(customer.preferred_visit_hour - deadHour.hour)
    if (diff <= 2) return true
  }
  return customer.primary_location_id === deadHour.location_id
}

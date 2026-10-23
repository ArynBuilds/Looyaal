// lib/discovery-engine.ts — Smart hashtag allocation, locality filtering, learning engine

import { createAdminClient } from './supabase/admin'
import { generateHashtags } from './hashtag-templates'

interface LocationGroup {
  city: string
  district: string | null
  locationIds: string[]
  hashtags: string[]
}

// --- Smart Hashtag Allocation ---

export function groupLocationsByDistrict(locations: { id: string; city: string | null; district: string | null }[]): LocationGroup[] {
  const groups = new Map<string, LocationGroup>()

  for (const loc of locations) {
    if (!loc.city) continue
    const key = `${loc.city.toLowerCase()}__${(loc.district || '').toLowerCase()}`

    if (groups.has(key)) {
      groups.get(key)!.locationIds.push(loc.id)
    } else {
      const hashtags = generateHashtags(loc.city, loc.district)
      groups.set(key, {
        city: loc.city,
        district: loc.district,
        locationIds: [loc.id],
        hashtags,
      })
    }
  }

  return Array.from(groups.values())
}

export async function allocateHashtagBudget(
  orgId: string,
  groups: LocationGroup[],
  weeklyLimit: number = 30,
): Promise<{ hashtag: string; group: LocationGroup }[]> {
  const admin = createAdminClient()

  // Get hashtag performance data
  const { data: perfData } = await admin
    .from('hashtag_performance')
    .select('hashtag, search_count, influencers_qualified, influencers_active')
    .eq('org_id', orgId)

  const perfMap = new Map<string, { searches: number; qualified: number; active: number }>()
  for (const p of perfData || []) {
    perfMap.set(p.hashtag, { searches: p.search_count, qualified: p.influencers_qualified, active: p.influencers_active })
  }

  // Score each hashtag
  type ScoredHashtag = { hashtag: string; group: LocationGroup; score: number }
  const scored: ScoredHashtag[] = []

  for (const group of groups) {
    for (const hashtag of group.hashtags) {
      const perf = perfMap.get(hashtag)
      let score: number

      if (!perf || perf.searches < 3) {
        // Exploration bonus: untested hashtags get a moderate score
        score = 50
      } else {
        // Performance-based: qualified per search ratio
        const qualifiedRate = perf.qualified / perf.searches
        const activeRate = perf.active / Math.max(perf.qualified, 1)
        score = Math.round((qualifiedRate * 60 + activeRate * 40) * 100)
      }

      scored.push({ hashtag, group, score })
    }
  }

  // Deduplicate hashtags (same hashtag from different groups — keep highest score)
  const deduped = new Map<string, ScoredHashtag>()
  for (const s of scored) {
    const existing = deduped.get(s.hashtag)
    if (!existing || s.score > existing.score) {
      deduped.set(s.hashtag, s)
    }
  }

  // Sort by score, allocate budget: 70% proven (high score), 30% exploration (untested)
  const all = Array.from(deduped.values())
  const proven = all.filter(h => {
    const perf = perfMap.get(h.hashtag)
    return perf && perf.searches >= 3
  }).sort((a, b) => b.score - a.score)

  const exploration = all.filter(h => {
    const perf = perfMap.get(h.hashtag)
    return !perf || perf.searches < 3
  })

  const provenBudget = Math.floor(weeklyLimit * 0.7)
  const exploreBudget = weeklyLimit - provenBudget

  const selected = [
    ...proven.slice(0, provenBudget),
    ...exploration.slice(0, exploreBudget),
  ]

  return selected.slice(0, weeklyLimit)
}

// --- Hashtag Performance Tracking ---

export async function updateHashtagPerformance(
  orgId: string,
  hashtag: string,
  found: number,
  qualified: number,
): Promise<void> {
  const admin = createAdminClient()

  const { data: existing } = await admin
    .from('hashtag_performance')
    .select('id, search_count, influencers_found, influencers_qualified')
    .eq('org_id', orgId)
    .eq('hashtag', hashtag)
    .single()

  if (existing) {
    await admin.from('hashtag_performance').update({
      search_count: existing.search_count + 1,
      influencers_found: existing.influencers_found + found,
      influencers_qualified: existing.influencers_qualified + qualified,
      last_searched_at: new Date().toISOString(),
    }).eq('id', existing.id)
  } else {
    await admin.from('hashtag_performance').insert({
      org_id: orgId,
      hashtag,
      search_count: 1,
      influencers_found: found,
      influencers_qualified: qualified,
      last_searched_at: new Date().toISOString(),
    })
  }
}

// Called when influencer pipeline status changes
export async function updateHashtagPipelineStats(orgId: string, hashtag: string, newStatus: string): Promise<void> {
  if (!hashtag) return
  const admin = createAdminClient()

  const field = newStatus === 'contacted' ? 'influencers_contacted'
    : newStatus === 'active' ? 'influencers_active'
    : null

  if (!field) return

  const { data: perf } = await admin
    .from('hashtag_performance')
    .select('id, ' + field)
    .eq('org_id', orgId)
    .eq('hashtag', hashtag)
    .single()

  if (perf) {
    const current = (perf as unknown as Record<string, number>)[field] || 0
    await admin.from('hashtag_performance').update({
      [field]: current + 1,
    }).eq('id', (perf as unknown as { id: string }).id)
  }
}

// --- Locality Filtering ---

export function filterByLocality(
  biography: string,
  captions: string[],
  city: string,
  district?: string | null,
): number {
  const bioLower = biography.toLowerCase()
  const captionsLower = captions.join(' ').toLowerCase()
  const cityLower = city.toLowerCase()
  const districtLower = district?.toLowerCase() || ''

  let score = 0

  // Bio signals (strongest)
  if (districtLower && bioLower.includes(districtLower)) score += 40
  if (bioLower.includes(cityLower)) score += 30

  // Caption signals
  if (districtLower && captionsLower.includes(districtLower)) score += 20
  if (captionsLower.includes(cityLower)) score += 10

  return Math.min(score, 100)
}

// --- Outcome Score ---

export function computeOutcomeScore(outcomeData: {
  accepted_free_deal?: boolean
  posts_delivered?: number
  new_customers?: number
  revenue?: number
  followers?: number
  impressions?: number
}): number {
  let score = 0

  if (outcomeData.accepted_free_deal) score += 10
  if ((outcomeData.posts_delivered || 0) > 0) score += 30
  if (outcomeData.impressions && outcomeData.followers && outcomeData.impressions / outcomeData.followers > 0.05) score += 30
  if ((outcomeData.new_customers || 0) > 0) score += 20
  if ((outcomeData.new_customers || 0) > 5) score += 10

  return Math.min(score, 100)
}

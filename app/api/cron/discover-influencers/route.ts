import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { searchHashtag, getHashtagRecentMedia, getMediaOwner, getBusinessDiscovery, computeAccessibilityScore, computeImpactScore, computeFreeCoffeeScore } from '@/lib/instagram'
import { groupLocationsByDistrict, allocateHashtagBudget, updateHashtagPerformance, filterByLocality } from '@/lib/discovery-engine'
import { NextResponse } from 'next/server'

const SCORE_THRESHOLD = 25
const MAX_DISCOVERY_PER_ORG = 50

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const admin = createAdminClient()

  // Find orgs with Instagram connected
  const { data: orgs } = await admin
    .from('organizations')
    .select('id')
    .not('instagram_access_token', 'is', null)
    .not('instagram_user_id', 'is', null)

  if (!orgs || orgs.length === 0) {
    return NextResponse.json({ message: 'No orgs with Instagram connected', discovered: 0 })
  }

  let totalDiscovered = 0

  for (const org of orgs) {
    try {
      const discovered = await discoverForOrg(admin, org.id)
      totalDiscovered += discovered
    } catch { /* silent per-org */ }
  }

  return NextResponse.json({ orgs: orgs.length, discovered: totalDiscovered })
}

async function discoverForOrg(admin: ReturnType<typeof createAdminClient>, orgId: string): Promise<number> {
  // Get locations
  const { data: locations } = await admin
    .from('locations')
    .select('id, city, district')
    .eq('org_id', orgId)
    .eq('is_active', true)

  if (!locations || locations.length === 0) return 0

  // Smart: group by district, deduplicate hashtags
  const groups = groupLocationsByDistrict(locations)
  if (groups.length === 0) return 0

  // Smart: allocate hashtag budget (70% proven, 30% exploration)
  const allocatedHashtags = await allocateHashtagBudget(orgId, groups)
  if (allocatedHashtags.length === 0) return 0

  // Get existing handles for dedup
  const { data: existing } = await admin
    .from('influencers')
    .select('instagram_handle')
    .eq('org_id', orgId)

  const existingHandles = new Set((existing || []).map(e => e.instagram_handle?.toLowerCase().replace('@', '')).filter(Boolean))

  let discovered = 0
  let apiCalls = 0

  for (const { hashtag, group } of allocatedHashtags) {
    if (apiCalls >= MAX_DISCOVERY_PER_ORG) break

    const hashtagId = await searchHashtag(orgId, hashtag)
    if (!hashtagId) {
      await updateHashtagPerformance(orgId, hashtag, 0, 0)
      continue
    }

    const media = await getHashtagRecentMedia(orgId, hashtagId)
    let found = 0
    let qualified = 0

    for (const post of media.slice(0, 10)) {
      if (apiCalls >= MAX_DISCOVERY_PER_ORG) break

      const username = await getMediaOwner(orgId, post.id)
      if (!username || existingHandles.has(username.toLowerCase())) continue

      existingHandles.add(username.toLowerCase())
      apiCalls++
      found++

      const profile = await getBusinessDiscovery(orgId, username)
      if (!profile || profile.followersCount < 500) continue

      // Locality filter
      const localityScore = filterByLocality(profile.biography, profile.recentCaptions, group.city, group.district)
      if (localityScore < 10) continue // Skip non-local

      // Free Coffee Score
      const accessibility = computeAccessibilityScore(profile)
      const impact = computeImpactScore(profile, group.city, group.district)
      const freeCoffeeScore = computeFreeCoffeeScore(accessibility, impact)

      if (freeCoffeeScore < SCORE_THRESHOLD) continue

      qualified++

      await admin.from('influencers').insert({
        org_id: orgId,
        instagram_handle: `@${profile.username}`,
        full_name: profile.name,
        bio: profile.biography,
        profile_pic_url: profile.profilePictureUrl,
        follower_count: profile.followersCount,
        avg_likes: profile.avgLikes,
        avg_comments: profile.avgComments,
        avg_engagement_rate: profile.engagementRate,
        looyaal_score: freeCoffeeScore,
        accessibility_score: accessibility,
        impact_score: impact,
        free_coffee_score: freeCoffeeScore,
        locality_score: localityScore,
        city: group.city,
        district: group.district,
        status: 'discovered',
        discovered_via_hashtag: hashtag,
        tags: profile.recentCaptions.some(c => /kahve|coffee|cafe|kafe/.test(c.toLowerCase())) ? ['coffee'] : ['food'],
      })

      discovered++
    }

    // Update hashtag performance
    await updateHashtagPerformance(orgId, hashtag, found, qualified)
  }

  return discovered
}

export { POST as GET }

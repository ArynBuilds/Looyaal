import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { searchHashtag, getHashtagRecentMedia, getMediaOwner, getBusinessDiscovery, computeAccessibilityScore, computeImpactScore, computeFreeCoffeeScore } from '@/lib/instagram'
import { groupLocationsByDistrict, allocateHashtagBudget, updateHashtagPerformance, filterByLocality } from '@/lib/discovery-engine'
import { NextResponse } from 'next/server'

const SCORE_THRESHOLD = 25
const MAX_DISCOVERY = 30

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') {
    return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
  }

  const orgId = userData.org_id

  // Check Instagram connection
  const { data: org } = await admin.from('organizations').select('instagram_access_token, instagram_user_id').eq('id', orgId).single()
  if (!org?.instagram_access_token || !org?.instagram_user_id) {
    return NextResponse.json({ error: 'Instagram bağlantısı gerekli. Önce Instagram hesabınızı bağlayın.' }, { status: 400 })
  }

  const { data: locations } = await admin
    .from('locations')
    .select('id, city, district')
    .eq('org_id', orgId)
    .eq('is_active', true)

  if (!locations || locations.length === 0) {
    return NextResponse.json({ error: 'Aktif şube bulunamadı' }, { status: 400 })
  }

  const groups = groupLocationsByDistrict(locations)
  const allocatedHashtags = await allocateHashtagBudget(orgId, groups)

  const { data: existing } = await admin.from('influencers').select('instagram_handle').eq('org_id', orgId)
  const existingHandles = new Set((existing || []).map(e => e.instagram_handle?.toLowerCase().replace('@', '')).filter(Boolean))

  let discovered = 0
  let apiCalls = 0

  for (const { hashtag, group } of allocatedHashtags) {
    if (apiCalls >= MAX_DISCOVERY) break

    const hashtagId = await searchHashtag(orgId, hashtag)
    if (!hashtagId) { await updateHashtagPerformance(orgId, hashtag, 0, 0); continue }

    const media = await getHashtagRecentMedia(orgId, hashtagId)
    let found = 0
    let qualified = 0

    for (const post of media.slice(0, 8)) {
      if (apiCalls >= MAX_DISCOVERY) break

      const username = await getMediaOwner(orgId, post.id, post.permalink)
      if (!username || existingHandles.has(username.toLowerCase())) continue

      existingHandles.add(username.toLowerCase())
      apiCalls++
      found++

      const profile = await getBusinessDiscovery(orgId, username)
      if (!profile || profile.followersCount < 500) continue

      const localityScore = filterByLocality(profile.biography, profile.recentCaptions, group.city, group.district)
      if (localityScore < 10) continue

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

    await updateHashtagPerformance(orgId, hashtag, found, qualified)
  }

  return NextResponse.json({ ok: true, discovered, searched: apiCalls, hashtags: allocatedHashtags.map(h => h.hashtag) })
}

// lib/instagram.ts — Instagram Graph API client for influencer discovery
// Per-org tokens: each shop connects their own Instagram Business account

import { createAdminClient } from './supabase/admin'
import { COFFEE_KEYWORDS, FOOD_KEYWORDS, LIFESTYLE_KEYWORDS } from './hashtag-templates'

const META_APP_ID = process.env.META_APP_ID || ''
const META_APP_SECRET = process.env.META_APP_SECRET || ''
const FB_GRAPH_URL = 'https://graph.facebook.com/v25.0'

// Cache hashtag IDs — they never change
const hashtagIdCache = new Map<string, string>()

// --- Per-Org Token Management ---

interface OrgInstagramTokens {
  accessToken: string
  userId: string
}

export async function getOrgInstagramTokens(orgId: string): Promise<OrgInstagramTokens | null> {
  const admin = createAdminClient()
  const { data: org } = await admin
    .from('organizations')
    .select('instagram_access_token, instagram_user_id, instagram_connected_at')
    .eq('id', orgId)
    .single()

  if (!org?.instagram_access_token || !org?.instagram_user_id) return null

  // Auto-refresh if token is older than 50 days (expires at 60)
  if (org.instagram_connected_at) {
    const connectedAt = new Date(org.instagram_connected_at)
    const daysSince = (Date.now() - connectedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSince > 50) {
      const refreshed = await refreshLongLivedToken(org.instagram_access_token)
      if (refreshed) {
        await admin.from('organizations').update({
          instagram_access_token: refreshed,
          instagram_connected_at: new Date().toISOString(),
        }).eq('id', orgId)
        return { accessToken: refreshed, userId: org.instagram_user_id }
      }
    }
  }

  return { accessToken: org.instagram_access_token, userId: org.instagram_user_id }
}

// --- OAuth Token Exchange ---

export async function getInstagramBusinessAccountId(accessToken: string): Promise<{ userId: string; pageId: string } | null> {
  const url = `${FB_GRAPH_URL}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()

  for (const page of data.data || []) {
    if (page.instagram_business_account?.id) {
      return { userId: page.instagram_business_account.id, pageId: page.id }
    }
  }
  return null
}

export async function exchangeCodeForToken(code: string, redirectUri: string): Promise<{ accessToken: string } | null> {
  // Facebook OAuth — exchange code for access token
  const res = await fetch(`${FB_GRAPH_URL}/oauth/access_token?` + new URLSearchParams({
    client_id: META_APP_ID,
    client_secret: META_APP_SECRET,
    redirect_uri: redirectUri,
    code,
  }))
  if (!res.ok) return null
  const data = await res.json()
  if (!data.access_token) return null
  return { accessToken: data.access_token }
}

export async function getLongLivedToken(shortToken: string): Promise<string | null> {
  // Exchange short-lived (1hr) for long-lived (60 days)
  const res = await fetch('https://graph.instagram.com/access_token?' + new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: META_APP_SECRET,
    access_token: shortToken,
  }))
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token || null
}

export async function refreshLongLivedToken(token: string): Promise<string | null> {
  // Refresh long-lived token (must be at least 24hrs old, not expired)
  const res = await fetch('https://graph.instagram.com/refresh_access_token?' + new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: token,
  }))
  if (!res.ok) return null
  const data = await res.json()
  return data.access_token || null
}

// --- Build OAuth URL ---

export function buildInstagramOAuthUrl(orgId: string, redirectUri: string): string {
  const state = Buffer.from(JSON.stringify({ orgId })).toString('base64url')
  const extras = JSON.stringify({ setup: { channel: 'IG_API_ONBOARDING' } })
  const params = new URLSearchParams({
    client_id: META_APP_ID,
    display: 'page',
    extras,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement,business_management',
    auth_type: 'rerequest',
    state,
  })
  return `https://www.facebook.com/v25.0/dialog/oauth?${params}`
}

// --- Hashtag Search (per-org) ---

export async function searchHashtag(orgId: string, hashtagName: string): Promise<string | null> {
  const cached = hashtagIdCache.get(hashtagName)
  if (cached) return cached

  const tokens = await getOrgInstagramTokens(orgId)
  if (!tokens) return null

  const url = `${FB_GRAPH_URL}/ig_hashtag_search?user_id=${tokens.userId}&q=${encodeURIComponent(hashtagName)}&access_token=${tokens.accessToken}`
  const res = await fetch(url)
  if (!res.ok) {
    const errBody = await res.text().catch(() => 'no body')
    console.error(`[instagram] Hashtag search failed: ${res.status} ${res.statusText} — ${errBody}`)
    return null
  }

  const data = await res.json()
  const id = data.data?.[0]?.id || null
  if (id) hashtagIdCache.set(hashtagName, id)
  return id
}

export interface HashtagMedia {
  id: string
  caption?: string
  permalink?: string
  timestamp?: string
}

export async function getHashtagRecentMedia(orgId: string, hashtagId: string): Promise<HashtagMedia[]> {
  const tokens = await getOrgInstagramTokens(orgId)
  if (!tokens) return []

  const url = `${FB_GRAPH_URL}/${hashtagId}/recent_media?user_id=${tokens.userId}&fields=id,caption,permalink,timestamp&access_token=${tokens.accessToken}`
  const res = await fetch(url)
  if (!res.ok) return []

  const data = await res.json()
  return data.data || []
}

// --- Business Discovery (per-org) ---

export interface DiscoveredInfluencer {
  username: string
  name: string
  biography: string
  followersCount: number
  mediaCount: number
  profilePictureUrl: string
  avgLikes: number
  avgComments: number
  engagementRate: number
  recentCaptions: string[]
  engagementVariance: number // low = consistent, high = inconsistent
  commentToLikeRatio: number // higher = more real conversations
}

export async function getBusinessDiscovery(orgId: string, username: string): Promise<DiscoveredInfluencer | null> {
  const tokens = await getOrgInstagramTokens(orgId)
  if (!tokens) return null

  const fields = `business_discovery.username(${username}){username,name,biography,followers_count,media_count,profile_picture_url,media.limit(12){like_count,comments_count,caption,timestamp}}`
  const url = `${FB_GRAPH_URL}/${tokens.userId}?fields=${encodeURIComponent(fields)}&access_token=${tokens.accessToken}`

  const res = await fetch(url)
  if (!res.ok) return null

  const data = await res.json()
  const bd = data.business_discovery
  if (!bd) return null

  const media = bd.media?.data || []
  const likes = media.map((m: { like_count?: number }) => m.like_count || 0)
  const comments = media.map((m: { comments_count?: number }) => m.comments_count || 0)
  const mediaCount = media.length || 1

  const totalLikes = likes.reduce((s: number, l: number) => s + l, 0)
  const totalComments = comments.reduce((s: number, c: number) => s + c, 0)
  const avgLikes = Math.round(totalLikes / mediaCount)
  const avgComments = Math.round(totalComments / mediaCount)

  // Engagement variance (consistency check)
  const engagements = likes.map((l: number, i: number) => l + comments[i])
  const avgEngagement = engagements.reduce((s: number, e: number) => s + e, 0) / mediaCount
  const variance = engagements.reduce((s: number, e: number) => s + Math.pow(e - avgEngagement, 2), 0) / mediaCount
  const engagementVariance = avgEngagement > 0 ? Math.sqrt(variance) / avgEngagement : 0 // CV: lower = more consistent

  const engagementRate = bd.followers_count > 0
    ? ((avgLikes + avgComments) / bd.followers_count) * 100
    : 0

  const commentToLikeRatio = totalLikes > 0 ? totalComments / totalLikes : 0

  return {
    username: bd.username,
    name: bd.name || bd.username,
    biography: bd.biography || '',
    followersCount: bd.followers_count || 0,
    mediaCount: bd.media_count || 0,
    profilePictureUrl: bd.profile_picture_url || '',
    avgLikes,
    avgComments,
    engagementRate: Math.round(engagementRate * 100) / 100,
    recentCaptions: media.map((m: { caption?: string }) => m.caption || '').filter(Boolean),
    engagementVariance: Math.round(engagementVariance * 100) / 100,
    commentToLikeRatio: Math.round(commentToLikeRatio * 1000) / 1000,
  }
}

export async function getMediaOwner(orgId: string, mediaId: string, permalink?: string): Promise<string | null> {
  const tokens = await getOrgInstagramTokens(orgId)
  if (!tokens) return null

  // Use oEmbed to get author from permalink (requires Meta oEmbed Read approval)
  if (permalink) {
    const oembedUrl = `${FB_GRAPH_URL}/instagram_oembed?url=${encodeURIComponent(permalink)}&fields=author_name&access_token=${tokens.accessToken}`
    const oembedRes = await fetch(oembedUrl)
    if (oembedRes.ok) {
      const oembedData = await oembedRes.json()
      if (oembedData.author_name) return oembedData.author_name
    }
  }

  // Fallback: direct media query (works for own media, not hashtag media)
  const url = `${FB_GRAPH_URL}/${mediaId}?fields=owner{username}&access_token=${tokens.accessToken}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return data.owner?.username || null
}

// --- Free Coffee Score ---

const COLLAB_KEYWORDS = ['iş birliği', 'işbirliği', 'collab', 'dm for', 'dm ile', '📩', '✉️', 'business']
const AGENCY_KEYWORDS = ['management', 'ajans', 'menajer', 'rate card', 'fiyat', 'booking']

export function computeAccessibilityScore(profile: DiscoveredInfluencer): number {
  let score = 0

  // 1. Follower sweet spot (30 pts)
  const f = profile.followersCount
  if (f >= 1000 && f < 5000) score += 30
  else if (f >= 5000 && f < 10000) score += 25
  else if (f >= 10000 && f < 20000) score += 20
  else if (f >= 20000 && f < 50000) score += 10
  else if (f >= 50000) score += 5
  else if (f < 1000) score += 15

  // 2. Bio signals (25 pts)
  const bioLower = profile.biography.toLowerCase()
  const hasCollabSignal = COLLAB_KEYWORDS.some(kw => bioLower.includes(kw))
  const hasAgencySignal = AGENCY_KEYWORDS.some(kw => bioLower.includes(kw))
  if (hasAgencySignal) score += Math.max(0, -15 + (hasCollabSignal ? 15 : 0)) // Agency = -15, but collab neutralizes
  else if (hasCollabSignal) score += 15
  else score += 5

  // 3. Content pattern — local business reviews (25 pts)
  const allCaptions = profile.recentCaptions.join(' ').toLowerCase()
  const mentionsLocalVenues = /cafe|kafe|kahveci|restoran|mekan/.test(allCaptions)
  const foodCoffeeContent = COFFEE_KEYWORDS.concat(FOOD_KEYWORDS).some(kw => allCaptions.includes(kw))
  if (mentionsLocalVenues) score += 15
  if (foodCoffeeContent) score += 10
  else score += 5

  // 4. Engagement authenticity (20 pts)
  if (profile.commentToLikeRatio > 0.03) score += 10 // Real conversations
  if (profile.engagementVariance < 0.5) score += 10 // Consistent engagement
  else if (profile.engagementVariance > 1.5) score -= 5 // Erratic = suspicious

  return Math.max(0, Math.min(100, score))
}

export function computeImpactScore(profile: DiscoveredInfluencer, city: string, district?: string | null): number {
  let score = 0

  // 1. Engagement rate (35 pts)
  const er = profile.engagementRate
  if (er > 5) score += 35
  else if (er > 3) score += 28
  else if (er > 2) score += 20
  else if (er > 1) score += 10
  else score += 5

  // 2. Locality match (30 pts)
  const bioLower = profile.biography.toLowerCase()
  const captionsLower = profile.recentCaptions.join(' ').toLowerCase()
  const districtLower = district?.toLowerCase() || ''

  if (districtLower && bioLower.includes(districtLower)) score += 30
  else if (districtLower && captionsLower.includes(districtLower)) score += 25
  else if (bioLower.includes(city.toLowerCase())) score += 20
  else if (captionsLower.includes(city.toLowerCase())) score += 15
  else score += 5

  // 3. Content relevance (20 pts)
  const allText = [profile.biography, ...profile.recentCaptions].join(' ').toLowerCase()
  const hasCoffee = COFFEE_KEYWORDS.some(kw => allText.includes(kw))
  const hasFood = FOOD_KEYWORDS.some(kw => allText.includes(kw))
  const hasLifestyle = LIFESTYLE_KEYWORDS.some(kw => allText.includes(kw))
  if (hasCoffee) score += 20
  else if (hasFood) score += 15
  else if (hasLifestyle) score += 10
  else score += 5

  // 4. Reach efficiency (15 pts)
  const f = profile.followersCount
  if (f >= 5000 && f < 30000) score += 15
  else if (f >= 1000 && f < 5000) score += 10
  else if (f >= 30000 && f < 50000) score += 8
  else if (f >= 50000) score += 5
  else score += 3

  return Math.max(0, Math.min(100, score))
}

export function computeFreeCoffeeScore(accessibility: number, impact: number): number {
  return Math.round((accessibility * impact) / 100)
}

// --- Locality helpers (kept for backward compat) ---

export function computeContentRelevance(biography: string, captions: string[]): number {
  const allText = [biography, ...captions].join(' ').toLowerCase()
  if (COFFEE_KEYWORDS.some(kw => allText.includes(kw))) return 100
  if (FOOD_KEYWORDS.some(kw => allText.includes(kw))) return 75
  if (LIFESTYLE_KEYWORDS.some(kw => allText.includes(kw))) return 50
  return 20
}

export function computeLocalityScore(biography: string, city: string, district?: string | null): number {
  const bioLower = biography.toLowerCase()
  let score = 0
  if (bioLower.includes(city.toLowerCase())) score += 40
  if (district && bioLower.includes(district.toLowerCase())) score += 40
  if (COFFEE_KEYWORDS.some(kw => bioLower.includes(kw))) score += 20
  return Math.min(score, 100)
}

// Legacy — kept for existing code that uses it
export function computeLooyaalScore(er: number, fc: number, loc: number, cr: number): number {
  const erScore = Math.min((er / 5.0) * 100, 100)
  let fcScore = 20
  if (fc >= 1000 && fc < 5000) fcScore = 60
  else if (fc >= 5000 && fc < 10000) fcScore = 80
  else if (fc >= 10000 && fc < 50000) fcScore = 100
  else if (fc >= 50000 && fc < 100000) fcScore = 70
  else if (fc >= 100000) fcScore = 50
  return Math.round(erScore * 0.4 + fcScore * 0.2 + loc * 0.3 + cr * 0.1)
}

// lib/google-business.ts — Google Business Profile API client
// Handles OAuth token refresh, review fetching, and reply posting

import { createAdminClient } from './supabase/admin'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const GBP_BASE = 'https://mybusinessbusinessinformation.googleapis.com/v1'
const GBP_REVIEWS_BASE = 'https://mybusiness.googleapis.com/v4'

// --- Token Management ---

export async function getAccessToken(locationId: string): Promise<string | null> {
  const admin = createAdminClient()
  const { data: loc } = await admin
    .from('locations')
    .select('google_access_token, google_refresh_token')
    .eq('id', locationId)
    .single()

  if (!loc?.google_refresh_token) return null

  // Always refresh — access tokens expire in 1 hour
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: loc.google_refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  if (!res.ok) return null

  const data = await res.json()
  const newAccessToken = data.access_token

  // Store refreshed access token
  await admin
    .from('locations')
    .update({ google_access_token: newAccessToken })
    .eq('id', locationId)

  return newAccessToken
}

// --- OAuth Exchange ---

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
} | null> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!res.ok) return null
  return res.json()
}

// --- Account & Location Discovery ---

export async function listAccounts(accessToken: string): Promise<{ name: string; accountName: string }[]> {
  const res = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.accounts || []
}

export async function listLocations(accessToken: string, accountName: string): Promise<{
  name: string
  title: string
  storefrontAddress?: { locality?: string; addressLines?: string[] }
}[]> {
  const res = await fetch(`${GBP_BASE}/${accountName}/locations?readMask=name,title,storefrontAddress`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return []
  const data = await res.json()
  return data.locations || []
}

// --- Reviews ---

export interface GoogleReview {
  reviewId: string
  reviewer: { displayName: string; profilePhotoUrl?: string }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
  comment?: string
  createTime: string
  updateTime: string
  reviewReply?: { comment: string; updateTime: string }
}

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
}

export function starRatingToNumber(rating: string): number {
  return STAR_MAP[rating] || 3
}

export async function fetchReviews(locationId: string, pageToken?: string): Promise<{
  reviews: GoogleReview[]
  nextPageToken?: string
  totalReviewCount?: number
  averageRating?: number
} | null> {
  const accessToken = await getAccessToken(locationId)
  if (!accessToken) return null

  const admin = createAdminClient()
  const { data: loc } = await admin
    .from('locations')
    .select('google_account_id, google_location_id')
    .eq('id', locationId)
    .single()

  if (!loc?.google_account_id || !loc?.google_location_id) return null

  const url = new URL(`${GBP_REVIEWS_BASE}/${loc.google_account_id}/${loc.google_location_id}/reviews`)
  url.searchParams.set('pageSize', '50')
  if (pageToken) url.searchParams.set('pageToken', pageToken)

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return null
  return res.json()
}

export async function replyToReview(locationId: string, reviewName: string, comment: string): Promise<boolean> {
  const accessToken = await getAccessToken(locationId)
  if (!accessToken) return false

  const res = await fetch(`${GBP_REVIEWS_BASE}/${reviewName}/reply`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ comment }),
  })

  return res.ok
}

export async function deleteReviewReply(locationId: string, reviewName: string): Promise<boolean> {
  const accessToken = await getAccessToken(locationId)
  if (!accessToken) return false

  const res = await fetch(`${GBP_REVIEWS_BASE}/${reviewName}/reply`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  return res.ok
}

// --- Build OAuth URL ---

export function buildOAuthUrl(locationId: string, redirectUri: string): string {
  const state = Buffer.from(JSON.stringify({ locationId })).toString('base64url')
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/business.manage',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

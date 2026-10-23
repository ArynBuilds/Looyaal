import { createAdminClient } from '@/lib/supabase/admin'
import { exchangeCodeForTokens, listAccounts, listLocations } from '@/lib/google-business'
import { NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(new URL('/loyalty?tab=locations&google=error', APP_URL))
  }

  // Decode state to get locationId
  let locationId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    locationId = decoded.locationId
  } catch {
    return NextResponse.redirect(new URL('/loyalty?tab=locations&google=error', APP_URL))
  }

  const redirectUri = `${APP_URL}/api/google/callback`
  const tokens = await exchangeCodeForTokens(code, redirectUri)

  if (!tokens) {
    return NextResponse.redirect(new URL('/loyalty?tab=locations&google=error', APP_URL))
  }

  const admin = createAdminClient()

  // Discover the GBP account and location
  const accounts = await listAccounts(tokens.access_token)
  let googleAccountId: string | null = null
  let googleLocationId: string | null = null

  for (const account of accounts) {
    const locations = await listLocations(tokens.access_token, account.name)
    if (locations.length > 0) {
      // Use the first location found (owner can change later if multi-location on GBP)
      googleAccountId = account.name
      googleLocationId = locations[0].name
      break
    }
  }

  // Store tokens and IDs on the location
  await admin.from('locations').update({
    google_access_token: tokens.access_token,
    google_refresh_token: tokens.refresh_token,
    google_account_id: googleAccountId,
    google_location_id: googleLocationId,
    google_connected_at: new Date().toISOString(),
  }).eq('id', locationId)

  return NextResponse.redirect(new URL('/loyalty?tab=locations&google=connected', APP_URL))
}

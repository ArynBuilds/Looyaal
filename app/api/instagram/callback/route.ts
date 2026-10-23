import { createAdminClient } from '@/lib/supabase/admin'
import { exchangeCodeForToken, getLongLivedToken, getInstagramBusinessAccountId } from '@/lib/instagram'
import { NextResponse } from 'next/server'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error || !code || !state) {
    return NextResponse.redirect(new URL('/influencers?instagram=error', APP_URL))
  }

  let orgId: string
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString())
    orgId = decoded.orgId
  } catch {
    return NextResponse.redirect(new URL('/influencers?instagram=error', APP_URL))
  }

  const redirectUri = `${APP_URL}/api/instagram/callback`

  // Exchange code for short-lived token + user ID
  const tokenResult = await exchangeCodeForToken(code, redirectUri)
  if (!tokenResult) {
    return NextResponse.redirect(new URL('/influencers?instagram=token_error', APP_URL))
  }

  // Exchange for long-lived token (60 days)
  const longToken = await getLongLivedToken(tokenResult.accessToken)
  if (!longToken) {
    return NextResponse.redirect(new URL('/influencers?instagram=token_error', APP_URL))
  }

  // Find Instagram Business Account via Facebook Pages
  const igAccount = await getInstagramBusinessAccountId(longToken)
  if (!igAccount) {
    return NextResponse.redirect(new URL('/influencers?instagram=no_ig_account', APP_URL))
  }

  // Store on the organization
  const admin = createAdminClient()
  await admin.from('organizations').update({
    instagram_access_token: longToken,
    instagram_user_id: igAccount.userId,
    instagram_page_id: igAccount.pageId,
    instagram_connected_at: new Date().toISOString(),
  }).eq('id', orgId)

  return NextResponse.redirect(new URL('/influencers?instagram=connected', APP_URL))
}

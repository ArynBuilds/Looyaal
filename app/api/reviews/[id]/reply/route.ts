import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { replyToReview } from '@/lib/google-business'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  comment: z.string().min(1).max(4096),
})

// POST: post or approve a reply to a Google review
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: reviewId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || (userData.role !== 'owner' && userData.role !== 'manager')) {
    return NextResponse.json({ error: 'Owner or manager access required' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })

  // Get review
  const { data: review } = await admin
    .from('reviews')
    .select('id, org_id, location_id, google_review_id')
    .eq('id', reviewId)
    .eq('org_id', userData.org_id)
    .single()

  if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 })

  // Get the Google location info for this review's location
  const { data: loc } = await admin
    .from('locations')
    .select('google_account_id, google_location_id, google_refresh_token')
    .eq('id', review.location_id)
    .single()

  if (!loc?.google_refresh_token) {
    return NextResponse.json({ error: 'Google bağlantısı bulunamadı' }, { status: 400 })
  }

  // Build the review name for GBP API
  const reviewName = `${loc.google_account_id}/${loc.google_location_id}/reviews/${review.google_review_id}`

  // Post reply to Google
  const success = await replyToReview(review.location_id, reviewName, parsed.data.comment)

  if (!success) {
    return NextResponse.json({ error: 'Google yanıt gönderilemedi' }, { status: 502 })
  }

  // Update in our DB
  await admin.from('reviews').update({
    response_text: parsed.data.comment,
    responded_at: new Date().toISOString(),
    is_flagged: false,
  }).eq('id', reviewId)

  return NextResponse.json({ ok: true })
}

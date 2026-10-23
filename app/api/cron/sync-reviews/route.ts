import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { fetchReviews, starRatingToNumber, replyToReview } from '@/lib/google-business'
import { analyzeSentiment } from '@/lib/sentiment'
import { generateReviewReply } from '@/lib/review-reply-generator'
import { NextResponse } from 'next/server'

// Runs 3x daily — syncs Google reviews for all connected locations
export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const admin = createAdminClient()

  // Find all locations with Google connected
  const { data: locations } = await admin
    .from('locations')
    .select('id, org_id, google_refresh_token, google_account_id, google_location_id')
    .not('google_refresh_token', 'is', null)

  if (!locations || locations.length === 0) {
    return NextResponse.json({ message: 'No connected locations', synced: 0 })
  }

  let totalNew = 0

  for (const loc of locations) {
    try {
      let pageToken: string | undefined
      let hasMore = true

      while (hasMore) {
        const result = await fetchReviews(loc.id, pageToken)
        if (!result || !result.reviews) break

        for (const review of result.reviews) {
          // Check if already synced
          const { count } = await admin
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('google_review_id', review.reviewId)
            .eq('location_id', loc.id)

          if (count && count > 0) continue // Already exists

          const rating = starRatingToNumber(review.starRating)
          const { sentiment, score } = analyzeSentiment(review.comment || '', rating)

          // Check auto-reply settings for this org
          const { data: autoReplySettings } = await admin
            .from('auto_campaign_settings')
            .select('is_enabled, auto_approve')
            .eq('org_id', loc.org_id)
            .eq('type', 'review_reply')
            .single()

          let responseText: string | null = review.reviewReply?.comment || null
          let respondedAt: string | null = review.reviewReply?.updateTime || null
          let flagged = sentiment === 'negative'

          // Auto-reply for new reviews without existing reply
          if (!responseText && autoReplySettings?.is_enabled) {
            const { data: org } = await admin.from('organizations').select('name').eq('id', loc.org_id).single()
            const generatedReply = generateReviewReply(org?.name || 'Kafe', rating, review.comment || '')

            if (autoReplySettings.auto_approve && rating >= 3) {
              // Auto-post for 3+ star reviews
              const reviewName = `${loc.google_account_id}/${loc.google_location_id}/reviews/${review.reviewId}`
              const posted = await replyToReview(loc.id, reviewName, generatedReply)
              if (posted) {
                responseText = generatedReply
                respondedAt = new Date().toISOString()
                flagged = false
              }
            } else {
              // Queue as draft for owner approval (always for 1-2 star)
              responseText = generatedReply
              flagged = true // Flag for review
            }
          }

          await admin.from('reviews').insert({
            org_id: loc.org_id,
            location_id: loc.id,
            google_review_id: review.reviewId,
            author_name: review.reviewer?.displayName || 'Anonim',
            rating,
            review_text: review.comment || null,
            published_at: review.createTime,
            sentiment,
            sentiment_score: score,
            response_text: responseText,
            responded_at: respondedAt,
            is_flagged: flagged,
          })
          totalNew++
        }

        pageToken = result.nextPageToken
        hasMore = !!pageToken
      }
    } catch {
      // Silent per-location — don't break the whole cron
    }
  }

  return NextResponse.json({ synced: totalNew, locations: locations.length })
}

export { POST as GET }

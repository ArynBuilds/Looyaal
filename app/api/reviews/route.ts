import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// GET: list reviews for this org (paginated, filterable)
export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const sentiment = searchParams.get('sentiment') // 'positive' | 'negative' | 'neutral' | null
  const replied = searchParams.get('replied') // 'true' | 'false' | null
  const locationId = searchParams.get('locationId')
  const offset = parseInt(searchParams.get('offset') || '0') || 0
  const limit = parseInt(searchParams.get('limit') || '20') || 20

  let query = admin
    .from('reviews')
    .select('*, locations(name)', { count: 'exact' })
    .eq('org_id', userData.org_id)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (sentiment) query = query.eq('sentiment', sentiment)
  if (locationId) query = query.eq('location_id', locationId)
  if (replied === 'true') query = query.not('response_text', 'is', null)
  if (replied === 'false') query = query.is('response_text', null)

  const { data, count, error } = await query

  if (error) return NextResponse.json({ error: 'Operation failed' }, { status: 500 })

  // Summary stats
  const [
    { count: totalCount },
    { count: positiveCount },
    { count: negativeCount },
    { count: neutralCount },
    { count: unrepliedCount },
  ] = await Promise.all([
    admin.from('reviews').select('*', { count: 'exact', head: true }).eq('org_id', userData.org_id),
    admin.from('reviews').select('*', { count: 'exact', head: true }).eq('org_id', userData.org_id).eq('sentiment', 'positive'),
    admin.from('reviews').select('*', { count: 'exact', head: true }).eq('org_id', userData.org_id).eq('sentiment', 'negative'),
    admin.from('reviews').select('*', { count: 'exact', head: true }).eq('org_id', userData.org_id).eq('sentiment', 'neutral'),
    admin.from('reviews').select('*', { count: 'exact', head: true }).eq('org_id', userData.org_id).is('response_text', null),
  ])

  // Average rating — compute from the data we already have
  const { data: ratingData } = await admin
    .from('reviews')
    .select('rating')
    .eq('org_id', userData.org_id)

  const avgRating = ratingData && ratingData.length > 0
    ? ratingData.reduce((sum, r) => sum + (r.rating || 0), 0) / ratingData.length
    : 0

  return NextResponse.json({
    reviews: data || [],
    total: count || 0,
    stats: {
      total: totalCount || 0,
      positive: positiveCount || 0,
      negative: negativeCount || 0,
      neutral: neutralCount || 0,
      unreplied: unrepliedCount || 0,
      avgRating: Math.round(avgRating * 10) / 10,
    },
  })
}

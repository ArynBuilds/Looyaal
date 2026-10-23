'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Review {
  id: string
  author_name: string | null
  rating: number
  review_text: string | null
  published_at: string | null
  sentiment: string | null
  response_text: string | null
  responded_at: string | null
  is_flagged: boolean
  locations: { name: string } | null
}

const sentimentColors: Record<string, string> = {
  positive: 'bg-green-100 text-green-700',
  neutral: 'bg-gray-100 text-gray-600',
  negative: 'bg-red-100 text-red-600',
}

interface ReviewsPanelProps {
  locationId: string | null
}

export function ReviewsPanel({ locationId }: ReviewsPanelProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [stats, setStats] = useState({ avg: 0, total: 0, responded: 0 })
  const supabase = createClient()

  useEffect(() => {
    loadReviews()
  }, [locationId])

  async function loadReviews() {
    setLoading(true)

    let query = supabase
      .from('reviews')
      .select('*, locations(name)')
      .order('published_at', { ascending: false })

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    const { data } = await query
    const reviewList = (data as unknown as Review[]) ?? []
    setReviews(reviewList)

    // Compute stats
    if (reviewList.length > 0) {
      const avg = reviewList.reduce((sum, r) => sum + r.rating, 0) / reviewList.length
      const responded = reviewList.filter((r) => r.response_text).length
      setStats({ avg: Math.round(avg * 10) / 10, total: reviewList.length, responded })
    } else {
      setStats({ avg: 0, total: 0, responded: 0 })
    }

    setLoading(false)
  }

  async function saveReply(reviewId: string) {
    await supabase.from('reviews').update({
      response_text: replyText,
      responded_at: new Date().toISOString(),
    }).eq('id', reviewId)

    setReplyingTo(null)
    setReplyText('')
    loadReviews()
  }

  async function toggleFlag(reviewId: string, currentFlag: boolean) {
    await supabase.from('reviews').update({ is_flagged: !currentFlag }).eq('id', reviewId)
    loadReviews()
  }

  function renderStars(rating: number) {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Ortalama Puan</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{stats.avg || '—'} <span className="text-sm text-amber-400">★</span></p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Toplam Yorum</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-gray-500">Yanıt Oranı</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {stats.total > 0 ? `%${Math.round((stats.responded / stats.total) * 100)}` : '—'}
          </p>
        </div>
      </div>

      {/* Reviews list */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review.id} className={`rounded-xl border bg-white p-5 shadow-sm ${review.is_flagged ? 'border-red-300' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">{review.author_name || 'Anonim'}</p>
                    <span className="text-amber-500">{renderStars(review.rating)}</span>
                    {review.sentiment && (
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sentimentColors[review.sentiment] || ''}`}>
                        {review.sentiment === 'positive' ? 'Olumlu' : review.sentiment === 'negative' ? 'Olumsuz' : 'Nötr'}
                      </span>
                    )}
                  </div>
                  {(review.locations as { name: string })?.name && (
                    <p className="text-xs text-gray-400">{(review.locations as { name: string }).name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFlag(review.id, review.is_flagged)}
                    className={`text-xs ${review.is_flagged ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    {review.is_flagged ? 'İşaretli' : 'İşaretle'}
                  </button>
                  <span className="text-xs text-gray-400">
                    {review.published_at ? new Date(review.published_at).toLocaleDateString('tr-TR') : ''}
                  </span>
                </div>
              </div>

              {review.review_text && (
                <p className="mt-2 text-sm text-gray-700">{review.review_text}</p>
              )}

              {/* Response */}
              {review.response_text ? (
                <div className="mt-3 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Yanıtınız:</p>
                  <p className="mt-1 text-sm text-gray-700">{review.response_text}</p>
                </div>
              ) : (
                <div className="mt-3">
                  {replyingTo === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        rows={3}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-amber-500 focus:outline-none"
                        placeholder="Yanıtınızı yazın..."
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveReply(review.id)}
                          disabled={!replyText}
                          className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                        >
                          Yanıtla
                        </button>
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText('') }}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      className="text-xs font-medium text-amber-600 hover:text-amber-500"
                    >
                      Yanıtla
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-500">Henüz yorum yok.</p>
            <p className="mt-1 text-xs text-gray-400">
              Google Places API bağlantısı kurulduğunda yorumlar otomatik çekilecek.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

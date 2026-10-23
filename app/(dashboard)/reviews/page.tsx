'use client'

import { useEffect, useState } from 'react'
import { Star, MessageSquare, TrendingUp, AlertTriangle, Send } from 'lucide-react'
import { motion } from 'motion/react'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Review {
  id: string
  author_name: string
  rating: number
  review_text: string | null
  sentiment: string | null
  sentiment_score: number | null
  response_text: string | null
  responded_at: string | null
  is_flagged: boolean
  published_at: string
  location_id: string
  location_name?: string
}

interface Location {
  id: string
  name: string
}

interface Stats {
  total: number
  positive: number
  negative: number
  neutral: number
  unreplied: number
  avgRating: number
}

const sentimentColors: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: 'bg-green-100', text: 'text-green-700', label: 'Olumlu' },
  negative: { bg: 'bg-red-100', text: 'text-red-700', label: 'Olumsuz' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Nötr' },
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, positive: 0, negative: 0, neutral: 0, unreplied: 0, avgRating: 0 })
  const [loading, setLoading] = useState(true)
  const [locations, setLocations] = useState<Location[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'unreplied'>('all')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  // Load locations once
  useEffect(() => {
    fetch('/api/locations').then(r => r.ok ? r.json() : []).then((data: Location[]) => setLocations(Array.isArray(data) ? data : []))
  }, [])

  useEffect(() => { loadReviews() }, [filter, selectedLocation])

  async function loadReviews() {
    setLoading(true)
    const params = new URLSearchParams()
    if (filter === 'positive') params.set('sentiment', 'positive')
    if (filter === 'negative') params.set('sentiment', 'negative')
    if (filter === 'unreplied') params.set('replied', 'false')
    if (selectedLocation !== 'all') params.set('locationId', selectedLocation)

    const res = await fetch(`/api/reviews?${params}`)
    if (res.ok) {
      const data = await res.json()
      setReviews(data.reviews || [])
      setStats(data.stats || stats)
    }
    setLoading(false)
  }

  async function handleReply(reviewId: string) {
    if (!replyText.trim()) return
    setSendingReply(true)
    const res = await fetch(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: replyText }),
    })
    if (res.ok) {
      setReplyingTo(null)
      setReplyText('')
      loadReviews()
    } else {
      const err = await res.json().catch(() => ({ error: 'Yanıt gönderilemedi' }))
      alert(err.error || 'Yanıt gönderilemedi')
    }
    setSendingReply(false)
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={14} className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
        ))}
      </div>
    )
  }

  return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Google Yorumlar</h1>
        <p className="mt-1 text-sm text-gray-500">Google yorum takibi ve duygu analizi</p>

        {/* Summary cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Star size={16} className="text-amber-500" />
              <span className="text-xs text-gray-500">Ortalama</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.avgRating ? Number(stats.avgRating).toFixed(1) : '-'}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-blue-500" />
              <span className="text-xs text-gray-500">Toplam</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-xs text-gray-500">Olumlu</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.positive}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <span className="text-xs text-gray-500">Yanıtsız</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.unreplied}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          {/* Location filter */}
          {locations.length > 1 && (
            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">Tüm Şubeler</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="mt-2 flex gap-1">
          {([
            { key: 'all', label: 'Tümü' },
            { key: 'positive', label: 'Olumlu' },
            { key: 'negative', label: 'Olumsuz' },
            { key: 'unreplied', label: 'Yanıtsız' },
          ] as const).map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f.key ? 'bg-amber-100 text-amber-700' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        <div className="mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-400 text-sm">
                {stats.total === 0
                  ? 'Henüz Google yorumu yok. Şubelerinizi Google\'a bağlayın.'
                  : 'Bu filtreyle eşleşen yorum bulunamadı.'}
              </p>
            </div>
          ) : (
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-3">
              {reviews.map(review => {
                const sc = sentimentColors[review.sentiment || 'neutral'] || sentimentColors.neutral
                return (
                  <motion.div key={review.id} variants={staggerItem} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    {/* Header: author + stars + sentiment + date */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                          {review.author_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{review.author_name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {renderStars(review.rating)}
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.text}`}>{sc.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {(review as unknown as { locations?: { name: string } }).locations?.name && (
                          <span className="block text-[10px] text-gray-400">{(review as unknown as { locations?: { name: string } }).locations?.name}</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {review.published_at ? new Date(review.published_at).toLocaleDateString('tr-TR') : ''}
                        </span>
                      </div>
                    </div>

                    {/* Review text */}
                    {review.review_text && (
                      <p className="mt-3 text-sm text-gray-600 leading-relaxed">{review.review_text}</p>
                    )}

                    {/* Existing reply */}
                    {review.response_text && (
                      <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 p-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Yanıtınız</p>
                        <p className="text-sm text-gray-700">{review.response_text}</p>
                      </div>
                    )}

                    {/* Reply form */}
                    {!review.response_text && replyingTo === review.id && (
                      <div className="mt-3">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                          placeholder="Yanıtınızı yazın..."
                        />
                        <div className="mt-2 flex gap-2 justify-end">
                          <button onClick={() => { setReplyingTo(null); setReplyText('') }} className="rounded-lg px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100">
                            İptal
                          </button>
                          <button onClick={() => handleReply(review.id)} disabled={sendingReply || !replyText.trim()} className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700 disabled:opacity-50">
                            <Send size={12} />
                            {sendingReply ? 'Gönderiliyor...' : 'Yanıtla'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reply button */}
                    {!review.response_text && replyingTo !== review.id && (
                      <button
                        onClick={() => { setReplyingTo(review.id); setReplyText('') }}
                        className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium"
                      >
                        <MessageSquare size={12} />
                        Yanıtla
                      </button>
                    )}

                    {/* Flagged indicator */}
                    {review.is_flagged && !review.response_text && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
                        <AlertTriangle size={12} />
                        Dikkat gerektiriyor
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </div>
      </div>
  )
}

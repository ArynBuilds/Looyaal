// lib/sentiment.ts — Turkish sentiment analysis for Google reviews
// MVP: keyword-based. Later: Claude Haiku API.

const POSITIVE_WORDS = [
  'güzel', 'harika', 'muhteşem', 'mükemmel', 'süper', 'bayıldım', 'sevdim',
  'lezzetli', 'taze', 'temiz', 'hızlı', 'ilgili', 'nazik', 'samimi',
  'kaliteli', 'başarılı', 'tavsiye', 'geleceğim', 'tekrar', 'beğendim',
  'enfes', 'şahane', 'kusursuz', 'memnun', 'teşekkür', 'bravo',
  'amazing', 'great', 'excellent', 'perfect', 'love', 'best', 'recommend',
  'delicious', 'fresh', 'clean', 'friendly', 'wonderful', 'fantastic',
]

const NEGATIVE_WORDS = [
  'kötü', 'berbat', 'rezalet', 'felaket', 'iğrenç', 'korkunc', 'kötüydü',
  'soğuk', 'bayat', 'pahalı', 'yavaş', 'ilgisiz', 'kaba', 'kirli',
  'başarısız', 'hayal kırıklığı', 'pişman', 'gelmem', 'tavsiye etmem',
  'berbattı', 'rezillik', 'skandal', 'utanç', 'şikayet',
  'bad', 'terrible', 'awful', 'horrible', 'worst', 'disgusting', 'rude',
  'cold', 'stale', 'expensive', 'slow', 'dirty', 'disappointing', 'never',
]

export function analyzeSentiment(text: string, rating: number): {
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number // -1.0 to 1.0
} {
  if (!text) {
    // No text — use star rating only
    if (rating >= 4) return { sentiment: 'positive', score: rating === 5 ? 1.0 : 0.6 }
    if (rating <= 2) return { sentiment: 'negative', score: rating === 1 ? -1.0 : -0.6 }
    return { sentiment: 'neutral', score: 0.0 }
  }

  const lower = text.toLowerCase()
  let positiveCount = 0
  let negativeCount = 0

  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) positiveCount++
  }
  for (const word of NEGATIVE_WORDS) {
    if (lower.includes(word)) negativeCount++
  }

  // Combine keyword analysis with star rating
  const keywordScore = (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1)
  const ratingScore = (rating - 3) / 2 // -1.0 to 1.0

  // Weight: 40% keywords, 60% rating
  const combinedScore = Math.max(-1, Math.min(1, keywordScore * 0.4 + ratingScore * 0.6))

  const sentiment: 'positive' | 'neutral' | 'negative' =
    combinedScore > 0.2 ? 'positive' :
    combinedScore < -0.2 ? 'negative' :
    'neutral'

  return { sentiment, score: Math.round(combinedScore * 100) / 100 }
}

// lib/hashtag-templates.ts — City-based hashtag generator for influencer discovery

// Turkish city name normalization (remove special chars for hashtags)
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/[^a-z0-9]/g, '')
}

// Istanbul districts are important enough to have their own hashtags
const ISTANBUL_DISTRICTS = [
  'kadikoy', 'besiktas', 'sisli', 'beyoglu', 'uskudar', 'bakirkoy',
  'sariyer', 'maltepe', 'atasehir', 'karakoy', 'nisantasi', 'bebek',
  'cihangir', 'moda', 'balat', 'ortakoy',
]

export function generateHashtags(city: string, district?: string | null): string[] {
  const normalCity = normalize(city)
  const normalDistrict = district ? normalize(district) : null

  const tags: string[] = []

  // City-level hashtags
  tags.push(`${normalCity}kahve`)
  tags.push(`${normalCity}cafe`)
  tags.push(`${normalCity}coffee`)

  // District-level hashtags (more local = better influencers)
  if (normalDistrict) {
    tags.push(`${normalDistrict}kahve`)
    tags.push(`${normalDistrict}cafe`)

    // Istanbul districts get extra food/lifestyle tags
    if (normalCity === 'istanbul' && ISTANBUL_DISTRICTS.includes(normalDistrict)) {
      tags.push(`${normalDistrict}yemek`)
    }
  }

  // Generic Turkish coffee hashtags
  tags.push('turkkahvesi')

  return [...new Set(tags)] // Deduplicate
}

// Coffee/food keywords for content relevance scoring
export const COFFEE_KEYWORDS = [
  'kahve', 'coffee', 'cafe', 'kafe', 'latte', 'espresso', 'cappuccino',
  'barista', 'coffeeshop', 'coffeelover', 'kahvekeyfi', 'turkkahvesi',
]

export const FOOD_KEYWORDS = [
  'yemek', 'food', 'foodie', 'lezzet', 'gastronomi', 'restoran',
  'gurme', 'tatli', 'brunch', 'kahvalti', 'foodblogger',
]

export const LIFESTYLE_KEYWORDS = [
  'lifestyle', 'yasam', 'gunluk', 'daily', 'moda', 'fashion',
  'travel', 'gezi', 'blogger', 'influencer',
]

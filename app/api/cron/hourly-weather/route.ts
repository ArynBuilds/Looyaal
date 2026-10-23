import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { getWeather } from '@/lib/weather'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const supabase = createAdminClient()
  const { data: locations } = await supabase.from('locations').select('id, city, org_id').eq('is_active', true).not('city', 'is', null)
  if (!locations) return NextResponse.json({ success: true, checked: 0 })

  const checkedCities = new Set<string>()
  const weatherCache = new Map<string, Awaited<ReturnType<typeof getWeather>>>()
  let stored = 0

  for (const loc of locations) {
    if (!loc.city || checkedCities.has(loc.city)) continue
    checkedCities.add(loc.city)

    const weather = await getWeather(loc.city)
    if (weather) weatherCache.set(loc.city, weather)
  }

  for (const loc of locations) {
    const weather = weatherCache.get(loc.city!)
    if (!weather) continue

    await supabase.from('weather_data').insert({
      location_id: loc.id,
      temperature: weather.temperature,
      feels_like: weather.feelsLike,
      humidity: weather.humidity,
      weather_main: weather.weatherMain,
      weather_desc: weather.weatherDesc,
      wind_speed: weather.windSpeed,
      is_rainy: weather.isRainy,
      is_cold: weather.isCold,
      is_hot: weather.isHot,
    })
    stored++
  }

  return NextResponse.json({ success: true, cities: checkedCities.size, stored })
}

export { POST as GET }

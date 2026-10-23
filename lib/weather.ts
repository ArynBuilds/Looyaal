const OPENWEATHER_API_KEY = process.env.OPENWEATHERMAP_API_KEY
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

interface WeatherResponse {
  main: { temp: number; feels_like: number; humidity: number }
  weather: { main: string; description: string }[]
  wind: { speed: number }
}

export interface WeatherData {
  temperature: number
  feelsLike: number
  humidity: number
  weatherMain: string
  weatherDesc: string
  windSpeed: number
  isRainy: boolean
  isCold: boolean
  isHot: boolean
}

export async function getWeather(city: string): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) return null

  try {
    const res = await fetch(
      `${BASE_URL}/weather?q=${encodeURIComponent(city)},TR&units=metric&appid=${OPENWEATHER_API_KEY}`
    )
    if (!res.ok) return null

    const data: WeatherResponse = await res.json()
    const weatherMain = data.weather[0]?.main || ''

    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      weatherMain,
      weatherDesc: data.weather[0]?.description || '',
      windSpeed: data.wind.speed,
      isRainy: ['Rain', 'Drizzle', 'Thunderstorm'].includes(weatherMain),
      isCold: data.main.temp < 5,
      isHot: data.main.temp > 30,
    }
  } catch {
    return null
  }
}

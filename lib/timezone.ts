// Location-aware timezone helpers.
//
// All visit timestamps (visited_at) are stored as UTC in Postgres (timestamptz),
// but day_of_week and hour_of_day must be stored in the LOCATION'S local time
// so that dead-hour detection, preferred-visit-hour, and owner-facing analytics
// match what humans actually perceive at the shop.
//
// Example: a visit at 14:30 Istanbul (UTC+3) = 11:30 UTC.
// Without timezone conversion: day_of_week/hour_of_day would be "Sunday 11"
// if this were a late Monday night visit in UTC. That's wrong.
// With conversion: "Monday 14" — what the owner sees on the wall clock.

const WEEKDAY_TO_DOW: Record<string, number> = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
}

/**
 * Get day_of_week (0=Sun..6=Sat) and hour_of_day (0..23) for a date in the given timezone.
 * Uses Intl.DateTimeFormat with hourCycle h23 to ensure 0-23 range (never "24").
 */
export function getLocalDayAndHour(
  date: Date,
  timezone: string | null | undefined
): { day: number; hour: number } {
  const tz = timezone || 'UTC'
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'short',
      hour: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(date)

    const weekdayPart = parts.find((p) => p.type === 'weekday')?.value || 'Sun'
    const hourPart = parts.find((p) => p.type === 'hour')?.value || '0'

    const day = WEEKDAY_TO_DOW[weekdayPart] ?? 0
    const hour = parseInt(hourPart, 10)
    return { day, hour: Number.isNaN(hour) ? 0 : hour }
  } catch {
    // Invalid timezone — fall back to UTC
    return { day: date.getUTCDay(), hour: date.getUTCHours() }
  }
}

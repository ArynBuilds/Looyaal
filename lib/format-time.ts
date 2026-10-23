// Formats an ISO date string into a human-readable Turkish time-remaining label.
// Returns null if no date, or if already expired.

export function formatTimeRemaining(isoDate: string | null | undefined): string | null {
  if (!isoDate) return null
  const ms = new Date(isoDate).getTime() - Date.now()
  if (ms <= 0) return null
  const minutes = Math.floor(ms / 60000)
  if (minutes < 60) return `${minutes} dk kaldı`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} saat kaldı`
  const days = Math.floor(hours / 24)
  return `${days} gün kaldı`
}

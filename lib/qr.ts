const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// The customer app is served at the root of the install's domain.
export function getLocationQRUrl(locationId: string): string {
  return `${BASE_URL}/?loc=${locationId}`
}

export function getDealQRUrl(orgSlug: string, dealCode: string): string {
  return `${BASE_URL}/${orgSlug}/deal/${dealCode}`
}

export function getInfluencerQRUrl(influencerCode: string): string {
  return `${BASE_URL}/?ref=${influencerCode}`
}

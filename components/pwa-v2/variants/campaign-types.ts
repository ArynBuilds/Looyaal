// Shared props for all campaign card variants

export interface Campaign {
  id: string
  name: string
  description?: string
  discount_text?: string   // e.g., "%25 indirim", "1 Alana 1 Bedava"
  valid_until?: string     // e.g., "2026-04-01"
  type?: string            // 'dead_hour' | 'reengagement' | 'birthday' | 'seasonal' | 'custom'
}

export interface CampaignProps {
  campaigns: Campaign[]
  onCampaignPress?: (campaign: Campaign) => void  // opens QR overlay for claim
}

// Shared props for all activity/card-tab variants

export interface Visit {
  date: string      // e.g., "Dun 14:30"
  location: string  // e.g., "Kadikoy Sube"
}

export interface ActivityProps {
  streak: number           // current week visit count
  totalVisits: number
  totalRewards: number
  lastVisits: Visit[]      // last 3-5 visits
  memberSince: string      // e.g., "Mart 2026"
}

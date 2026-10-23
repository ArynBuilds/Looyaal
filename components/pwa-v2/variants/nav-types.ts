// Shared props for all nav variants

export type NavTab = 'kartim' | 'magaza' | 'profil'

export interface NavTabDef { id: NavTab; label: string; icon: string }

export interface NavProps {
  activeTab: NavTab
  onTabChange: (tab: NavTab) => void
  onQrPress?: () => void
  shopName?: string
  tabs?: NavTabDef[] // when omitted, variants render NAV_TABS (base 3)
}

// Base 3 tabs, always present.
export const NAV_TABS: NavTabDef[] = [
  { id: 'kartim', label: 'Kartim', icon: '<path d="M20 12v10H4V12"/><path d="M2 7h20v5H2z"/><path d="M12 22V7"/>' },
  { id: 'magaza', label: 'Magaza', icon: '<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>' },
  { id: 'profil', label: 'Profil', icon: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>' },
]

// QR icon for FAB
export const QR_ICON = '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3z"/><path d="M20 14v3h-3"/><path d="M14 20h3"/><path d="M20 20h0"/>'

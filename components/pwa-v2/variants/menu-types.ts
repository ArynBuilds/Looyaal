// Shared props + expand hook for all menu variants

export interface MenuItem {
  id: string
  name: string
  price: number
  photoUrl?: string | null
  category?: string
  is_featured?: boolean
}

export interface MenuProps {
  items: MenuItem[]
  currency?: string  // default 'TL'
  previewCount?: number  // how many items to show before "Tumunu Gor" (default 4)
}

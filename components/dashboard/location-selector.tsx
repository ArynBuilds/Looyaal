'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

interface Location {
  id: string
  name: string
}

interface LocationSelectorProps {
  value: string | null
  onChange: (locationId: string | null) => void
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('locations')
        .select('id, name')
        .eq('is_active', true)
        .order('name')
      setLocations(data ?? [])
    }
    load()
  }, [])

  if (locations.length <= 1) return null

  return (
    <select
      value={value ?? 'all'}
      onChange={(e) => onChange(e.target.value === 'all' ? null : e.target.value)}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
    >
      <option value="all">Tüm Şubeler</option>
      {locations.map((loc) => (
        <option key={loc.id} value={loc.id}>{loc.name}</option>
      ))}
    </select>
  )
}

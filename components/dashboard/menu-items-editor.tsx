'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, Star, GripVertical, ImageIcon } from 'lucide-react'
import { ImageUpload } from '@/components/dashboard/image-upload'

interface MenuItem {
  id: string
  name: string
  price: number | null
  category: string
  is_featured: boolean
  sort_order: number
  image_url: string | null
}

export function MenuItemsEditor() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newCategory, setNewCategory] = useState('drink')
  const [photoPopoverId, setPhotoPopoverId] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    fetch('/api/menu-items')
      .then(r => r.json())
      .then(data => { setItems(Array.isArray(data) ? data : []); setLoading(false) })
  }, [])

  useEffect(() => {
    if (!photoPopoverId) return
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPhotoPopoverId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [photoPopoverId])

  function updateItemImage(id: string, url: string | null) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, image_url: url } : i))
  }

  const addItem = async () => {
    if (!newName.trim()) return
    const res = await fetch('/api/menu-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newName.trim(),
        price: newPrice ? parseFloat(newPrice) : undefined,
        category: newCategory,
      }),
    })
    if (res.ok) {
      const item = await res.json()
      setItems(prev => [...prev, item])
      setNewName('')
      setNewPrice('')
      setAdding(false)
    }
  }

  const deleteItem = async (id: string) => {
    const res = await fetch(`/api/menu-items/${id}`, { method: 'DELETE' })
    if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    const featuredCount = items.filter(i => i.is_featured).length
    if (!current && featuredCount >= 5) return
    const res = await fetch(`/api/menu-items/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: !current }),
    })
    if (res.ok) {
      setItems(prev => prev.map(i => i.id === id ? { ...i, is_featured: !current } : i))
    }
  }

  const categories: Record<string, string> = {
    drink: 'Icecek',
    food: 'Yiyecek',
    dessert: 'Tatli',
    other: 'Diger',
  }

  if (loading) return <div className="animate-pulse h-40 bg-stone-100 rounded-xl" />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-900">Menu Urunleri</h3>
          <p className="text-sm text-stone-500">{items.length} urun</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Ekle
        </button>
      </div>

      {adding && (
        <div className="bg-stone-50 rounded-xl p-4 space-y-3 border border-stone-200">
          <input
            type="text"
            placeholder="Urun adi"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm"
            autoFocus
          />
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="Fiyat (TL)"
              value={newPrice}
              onChange={e => setNewPrice(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm"
            />
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-sm"
            >
              <option value="drink">Icecek</option>
              <option value="food">Yiyecek</option>
              <option value="dessert">Tatli</option>
              <option value="other">Diger</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={addItem} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700">Kaydet</button>
            <button onClick={() => setAdding(false)} className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg text-sm">Iptal</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="relative flex items-center gap-3 bg-white border border-stone-200 rounded-xl px-4 py-3">
            <GripVertical className="w-4 h-4 text-stone-300 flex-shrink-0" />

            {/* Thumbnail — click to open popover */}
            <button
              type="button"
              onClick={() => setPhotoPopoverId(photoPopoverId === item.id ? null : item.id)}
              className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-stone-200 relative"
              title="Fotoğraf"
            >
              {item.image_url ? (
                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}
                >
                  <ImageIcon className="w-4 h-4 text-amber-700/60" />
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-900 text-sm truncate">{item.name}</p>
              <p className="text-xs text-stone-500">{categories[item.category] || item.category}</p>
            </div>
            {item.price && (
              <span className="text-sm font-medium text-stone-700">{item.price} TL</span>
            )}
            <button
              onClick={() => toggleFeatured(item.id, item.is_featured)}
              className={`p-1.5 rounded-lg transition-colors ${item.is_featured ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-stone-400'}`}
              title={item.is_featured ? 'One cikan (maks 5)' : 'One cikar'}
            >
              <Star className="w-4 h-4" fill={item.is_featured ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Popover */}
            {photoPopoverId === item.id && (
              <div
                ref={popoverRef}
                className="absolute top-full left-0 mt-2 z-10 w-64 rounded-xl border border-stone-200 bg-white p-3 shadow-lg"
              >
                <p className="text-xs font-medium text-stone-700 mb-2">Ürün Fotoğrafı</p>
                <ImageUpload
                  value={item.image_url}
                  onChange={(url) => updateItemImage(item.id, url)}
                  preset="menu"
                  menuItemId={item.id}
                  aspect="banner"
                />
              </div>
            )}
          </div>
        ))}
        {items.length === 0 && !adding && (
          <p className="text-center text-stone-400 py-8 text-sm">Henuz urun eklenmedi</p>
        )}
      </div>
    </div>
  )
}

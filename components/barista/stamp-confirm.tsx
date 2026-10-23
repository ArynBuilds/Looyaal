'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { Coffee, User } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  price: number | null
}

interface StampConfirmProps {
  customerName: string
  stamps: number
  stampsRequired: number
  orgSlug: string
  onConfirm: (drinkName: string, menuItemId?: string) => void
  onCancel: () => void
  offerDetails?: { title: string; offer_type: string; offer_value: number | null; free_item_name: string | null; applies_to_item?: string | null } | null
}

export function StampConfirm({ customerName, stamps, stampsRequired, orgSlug, onConfirm, onCancel, offerDetails }: StampConfirmProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [custom, setCustom] = useState('')

  useEffect(() => {
    fetch(`/api/public/${orgSlug}/menu`)
      .then(r => r.ok ? r.json() : [])
      .then(data => setMenuItems(Array.isArray(data) ? data : []))
  }, [orgSlug])

  const drinkName = selectedId === 'other'
    ? custom
    : menuItems.find(i => i.id === selectedId)?.name ?? null
  const menuItemId = selectedId === 'other' || !selectedId ? undefined : selectedId

  return (
    <div className="p-4 space-y-4">
      {/* Customer card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10"
      >
        <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{customerName}</p>
          <p className="text-xs text-white/40">{stamps}/{stampsRequired} puan</p>
        </div>
      </motion.div>

      {/* Offer details */}
      {offerDetails && (
        <div style={{
          padding: 12, borderRadius: 8,
          background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.3)',
          marginBottom: 12,
        }}>
          <p style={{ fontSize: 12, color: '#d97706', fontWeight: 600, marginBottom: 4 }}>
            Bu müşteriye uygula:
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>
            {offerDetails.offer_type === 'discount_percent' && offerDetails.applies_to_item && `${offerDetails.applies_to_item} üzerinde %${offerDetails.offer_value} indirim`}
            {offerDetails.offer_type === 'discount_percent' && !offerDetails.applies_to_item && `%${offerDetails.offer_value} indirim`}
            {offerDetails.offer_type === 'free_item' && `Bedava ${offerDetails.free_item_name || 'ikram'}`}
            {offerDetails.offer_type === 'double_stamp' && '2x puan'}
          </p>
        </div>
      )}

      {/* Drink selection */}
      <p className="text-xs text-white/40 font-medium">İçecek seçin</p>
      <div className="grid grid-cols-2 gap-2">
        {menuItems.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedId(item.id)}
            className={`p-3 rounded-xl text-left text-sm transition-colors ${
              selectedId === item.id ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/70 border border-white/10'
            }`}
          >
            <p className="font-medium">{item.name}</p>
            {item.price && <p className="text-xs opacity-60">{item.price} TL</p>}
          </motion.button>
        ))}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: menuItems.length * 0.05 }}
          onClick={() => setSelectedId('other')}
          className={`p-3 rounded-xl text-left text-sm transition-colors ${
            selectedId === 'other' ? 'bg-amber-600 text-white' : 'bg-white/5 text-white/70 border border-white/10'
          }`}
        >
          <Coffee className="w-4 h-4 mb-1" />
          <p className="font-medium">Diger</p>
        </motion.button>
      </div>

      {selectedId === 'other' && (
        <input
          type="text"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          placeholder="Icecek adi"
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm outline-none"
          autoFocus
        />
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={onCancel} className="flex-1 py-3 rounded-xl bg-white/5 text-white/60 text-sm font-medium">
          İptal
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => drinkName && onConfirm(drinkName, menuItemId)}
          disabled={!drinkName}
          className="flex-1 py-3 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-40"
        >
          Puan Ver
        </motion.button>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import type { MenuProps } from './menu-types'

// Menu Swipe Stack — Tinder-style one item per screen. Like (favorite) or pass.
// Favorites persist in localStorage per orgSlug — when the customer-favorites
// data model lands, this component reads/writes to the API instead.

const FAVORITES_KEY = 'looyaal_menu_favorites'

export function MenuSwipeStack({ items, currency = 'TL' }: MenuProps) {
  const [index, setIndex] = useState(0)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY)
      if (raw) setFavorites(new Set(JSON.parse(raw)))
    } catch { /* ignore */ }
  }, [])

  const persist = (next: Set<string>) => {
    setFavorites(new Set(next))
    try { localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(next))) } catch { /* ignore */ }
  }

  const item = items[index]
  if (!item) {
    return (
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', padding: 'var(--space-2xl)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Tüm menüyü gördün</p>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', marginTop: 'var(--space-sm)' }}>{favorites.size} ürün favorilere eklendi</p>
        <button onClick={() => setIndex(0)} style={{ marginTop: 'var(--space-lg)', padding: '8px 18px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-brand)', background: 'transparent', color: 'var(--color-brand)', fontWeight: 600, cursor: 'pointer' }}>Baştan başla</button>
      </div>
    )
  }

  const onLike = () => { const next = new Set(favorites); next.add(item.id); persist(next); setIndex(i => i + 1) }
  const onPass = () => setIndex(i => i + 1)
  const isLiked = favorites.has(item.id)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', padding: '0 var(--space-xs)' }}>
        <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: 'var(--letter-spacing-label)', fontWeight: 600, margin: 0 }}>Keşfet</p>
        <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-text-faint)', margin: 0 }}>{index + 1} / {items.length}</p>
      </div>

      <div style={{ position: 'relative' }}>
        {items[index + 1] && (
          <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--radius-card)', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', transform: 'rotate(2deg) translateY(4px)', opacity: 0.6, zIndex: 1 }} />
        )}
        <div style={{ position: 'relative', borderRadius: 'var(--radius-card)', overflow: 'hidden', background: 'var(--color-card)', border: '1px solid var(--color-card-border)', boxShadow: 'var(--shadow-card)', zIndex: 2 }}>
          <div style={{ aspectRatio: '1', background: item.photoUrl ? `url(${item.photoUrl}) center/cover no-repeat` : `linear-gradient(135deg, var(--color-brand-glow-strong), var(--color-brand-muted))` }} />
          <div style={{ padding: 'var(--space-lg)' }}>
            {item.category && <p style={{ fontSize: 'var(--font-size-tiny)', color: 'var(--color-brand)', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 700, margin: 0 }}>{item.category}</p>}
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h1)', fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', margin: '6px 0 0', lineHeight: 1.05 }}>{item.name}</p>
            <p style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--font-size-h2)', color: 'var(--color-brand)', fontWeight: 700, margin: '8px 0 0' }}>{item.price} {currency}</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', marginTop: 'var(--space-lg)' }}>
        <button onClick={onPass} aria-label="Geç" style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid var(--color-card-border)', background: 'var(--color-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
        <button onClick={onLike} aria-label="Beğen" style={{ width: 56, height: 56, borderRadius: '50%', border: 'none', background: isLiked ? 'var(--color-brand-glow)' : 'var(--color-brand)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isLiked ? 'var(--color-brand)' : 'white', boxShadow: '0 4px 12px var(--color-brand-glow-strong)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
        </button>
      </div>
    </div>
  )
}

'use client'
import { Flame } from 'lucide-react'

// Shared streak badge for all stamp card variants. Variants render this
// inline (in their own header / corner / etc.) so the badge feels like
// part of the card design instead of an absolute-positioned overlay.
//
// Color strategy: defaults to a SEMI-TRANSPARENT brand tint with theme-
// aware text. This works on any background — light cards, dark cards,
// brand-colored header bands, metallic gradients — without contrast
// failure. Variants can override via `tone` when the card design demands
// a more specific treatment (e.g. `contrast` for white-on-brand,
// `ghost` for translucent over textured backgrounds, `brand` for solid
// pill where the variant doesn't already use brand color).
//
// Shape: uses --radius-full token (9999px pill). This adapts via the
// token system — variants with sharp/smooth shape preferences inherit
// from the design tokens, but a "pill" is conceptually one shape.

export interface StreakBadgeProps {
  streak: number
  onClick?: () => void
  /** Override outer style (use for absolute positioning, custom bg, etc.) */
  style?: React.CSSProperties
  /** Pick the visual treatment for this variant's background:
   *  - `auto` (default): semi-transparent brand tint + theme-aware text. Adapts everywhere.
   *  - `brand`: solid brand-colored pill with white text. Use on neutral cards where brand color isn't already prominent.
   *  - `contrast`: white pill with brand text. Use on brand-colored backgrounds.
   *  - `ghost`: translucent black with white text. Use on metallic / textured backgrounds. */
  tone?: 'auto' | 'brand' | 'contrast' | 'ghost'
}

export function StreakBadge({ streak, onClick, style, tone = 'auto' }: StreakBadgeProps) {
  const active = streak > 0

  const toneStyles: React.CSSProperties = (() => {
    if (tone === 'brand') {
      return {
        background: 'var(--color-brand)',
        color: 'white',
        boxShadow: '0 1px 4px var(--color-brand-glow-strong)',
      }
    }
    if (tone === 'contrast') {
      return {
        background: 'rgba(255,255,255,0.95)',
        color: 'var(--color-brand)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
      }
    }
    if (tone === 'ghost') {
      return {
        background: 'rgba(0,0,0,0.32)',
        color: 'white',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }
    }
    // tone === 'auto' — adapts to light/dark mode + any card background.
    // Semi-transparent brand bg lets the card color show through subtly,
    // theme-aware text guarantees readability. The thin brand-colored
    // border ties the badge to the brand without overpowering the card.
    return active
      ? {
          background: 'var(--color-brand-glow-strong)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-brand)',
        }
      : {
          background: 'transparent',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-card-border)',
        }
  })()

  const iconColor = (() => {
    if (tone === 'brand') return 'white'
    if (tone === 'contrast') return 'var(--color-brand)'
    if (tone === 'ghost') return 'white'
    return active ? 'var(--color-brand)' : 'var(--color-text-muted)'
  })()

  return (
    <button
      onClick={onClick}
      aria-label={`Seri: ${streak} gün`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease',
        lineHeight: 1,
        // Border defaults to none unless a tone explicitly sets one
        border: 'none',
        ...toneStyles,
        ...style,
      }}
    >
      <Flame
        size={12}
        style={{
          color: iconColor,
          filter: active && tone !== 'auto' ? 'drop-shadow(0 0 3px rgba(255,200,50,0.5))' : 'none',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: 12,
          color: 'inherit',
        }}
      >
        {streak}
      </span>
    </button>
  )
}

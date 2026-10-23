'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

// Reusable detail overlay — backdrop blur + slide-up card + drag to close.
// Follows the finger during a downward swipe from the top; closes past a threshold.
//
// Mobile gotcha: React attaches onTouchMove as a PASSIVE listener on iOS, so
// e.preventDefault() there is a no-op and the page scrolls anyway. We therefore
// bind touch handlers natively with { passive: false } via a ref. We also decide
// drag-vs-scroll on the FIRST move (not on touchstart) and never flip the card to
// overflow:hidden mid-gesture — doing either hands the scroll to the background on
// iOS, which is what made this work on desktop but break on phones.

interface DetailOverlayProps {
  onClose: () => void
  children: React.ReactNode
}

const CLOSE_THRESHOLD = 150 // px drag to trigger close
const DIRECTION_SLOP = 4 // px of movement before we commit to drag-vs-scroll

export function DetailOverlay({ onClose, children }: DetailOverlayProps) {
  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const dragYRef = useRef(0)

  // Keep onClose current without re-binding native listeners every render.
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose }, [onClose])

  const animateClose = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => onCloseRef.current(), 250)
  }, [])

  const setDrag = useCallback((v: number) => {
    dragYRef.current = v
    setDragY(v)
  }, [])

  // Lock scroll on the background. The PWA's real scroller is an inner content div
  // (overflow:auto) whose overflow React controls via inline style — and because an
  // ancestor sets `container-type`, this overlay (position:fixed) is a DOM
  // descendant of that scroller. Locking the document body does nothing here. We add
  // a class that freezes every scrollable ancestor; its `!important` rule beats
  // React's non-important inline overflow, and toggling only classList (never inline
  // styles) means React's own styling is never touched — removing the class on close
  // restores scrolling cleanly.
  useEffect(() => {
    const locked: HTMLElement[] = []
    let el: HTMLElement | null = backdropRef.current?.parentElement ?? null
    while (el && el !== document.documentElement) {
      const oy = getComputedStyle(el).overflowY
      if (oy === 'auto' || oy === 'scroll') {
        el.classList.add('gf-scroll-locked')
        locked.push(el)
      }
      el = el.parentElement
    }
    return () => locked.forEach(node => node.classList.remove('gf-scroll-locked'))
  }, [])

  // Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') animateClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [animateClose])

  // Native touch drag-to-close (non-passive so preventDefault works on iOS).
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    let startY = 0
    let decided = false   // have we chosen drag-vs-scroll for this gesture?
    let dragging = false  // actively close-dragging (vs letting the card scroll)

    const onStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
      decided = false
      dragging = false
    }

    const onMove = (e: TouchEvent) => {
      const delta = e.touches[0].clientY - startY
      if (!decided) {
        if (Math.abs(delta) < DIRECTION_SLOP) return
        decided = true
        // Only hijack as a close-drag when pulling DOWN from the very top.
        // Otherwise it's a normal scroll — leave it entirely to the browser.
        dragging = delta > 0 && (card.scrollTop <= 0)
        if (dragging) setIsDragging(true)
      }
      if (dragging) {
        e.preventDefault() // block native scroll while we translate the card
        setDrag(Math.max(0, delta) * 0.8)
      }
    }

    const onEnd = () => {
      if (dragging) {
        if (dragYRef.current > CLOSE_THRESHOLD) animateClose()
        else setDrag(0)
        setIsDragging(false)
      }
      decided = false
      dragging = false
    }

    card.addEventListener('touchstart', onStart, { passive: true })
    card.addEventListener('touchmove', onMove, { passive: false })
    card.addEventListener('touchend', onEnd)
    card.addEventListener('touchcancel', onEnd)
    return () => {
      card.removeEventListener('touchstart', onStart)
      card.removeEventListener('touchmove', onMove)
      card.removeEventListener('touchend', onEnd)
      card.removeEventListener('touchcancel', onEnd)
    }
  }, [animateClose, setDrag])

  const backdropOpacity = isClosing ? 0 : Math.max(0, 1 - dragY / 400)

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === backdropRef.current) animateClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        background: `rgba(0,0,0,${0.5 * backdropOpacity})`,
        animation: isClosing ? undefined : 'detailBackdropIn 0.2s ease-out',
        transition: isClosing ? 'opacity 0.25s ease-out' : undefined,
        opacity: isClosing ? 0 : 1,
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: '100%',
          maxWidth: 420,
          maxHeight: '85vh',
          background: 'var(--color-bg)',
          borderRadius: 'var(--radius-card) var(--radius-card) 0 0',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          animation: isClosing ? undefined : 'detailSlideUp 0.3s ease-out',
          position: 'relative',
          transform: isClosing
            ? 'translateY(100%)'
            : `translateY(${dragY}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.25s ease-out',
        }}
      >
        {/* Drag handle */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          padding: '12px 0 4px',
          position: 'sticky', top: 0,
          background: 'var(--color-bg)',
          zIndex: 1,
          cursor: 'grab',
        }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: 'var(--color-card-border)',
          }} />
        </div>

        {/* Content */}
        <div style={{ padding: '0 var(--space-xl) var(--space-2xl)' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes detailBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes detailSlideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

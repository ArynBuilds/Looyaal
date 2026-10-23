'use client'
// LOCKED — This file is part of the onboarding flow and must NOT be modified.// It is independent of the PWA design system (tokens, variants, templates).// Any changes to this file require explicit approval.

import { useEffect } from 'react'

export function useConfetti(trigger: boolean) {
  useEffect(() => {
    if (!trigger) return

    // Dynamic import to avoid SSR issues
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default

      // Burst from center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d'],
      })

      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ['#d97706', '#f59e0b'],
        })
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ['#d97706', '#f59e0b'],
        })
      }, 200)
    })

    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100])
    }
  }, [trigger])
}

export function useHaptic(trigger: boolean) {
  useEffect(() => {
    if (!trigger) return
    if (navigator.vibrate) {
      navigator.vibrate([100])
    }
  }, [trigger])
}

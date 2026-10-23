// Animation tokens — consistent across the entire app
export const transitions = {
  fast: { duration: 0.15, ease: 'easeOut' as const },
  normal: { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const },
  slow: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
}

// Stagger children animation
export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: transitions.normal },
}

// Page transition
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: transitions.normal },
  exit: { opacity: 0, y: -8, transition: transitions.fast },
}

// Count up animation config
export const countUpConfig = {
  duration: 0.8,
  ease: [0.4, 0, 0.2, 1] as const,
}

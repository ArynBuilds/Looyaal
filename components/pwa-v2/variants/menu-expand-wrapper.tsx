'use client'

// Shared "Tümünu Gor" button for all menu variants

import { useState } from 'react'

export function useMenuExpand(totalItems: number, previewCount: number = 4) {
  const [isExpanded, setIsExpanded] = useState(false)
  const needsExpand = totalItems > previewCount
  const visibleCount = isExpanded || !needsExpand ? totalItems : previewCount

  return {
    isExpanded,
    toggle: () => setIsExpanded(prev => !prev),
    visibleCount,
    needsExpand,
    totalItems,
  }
}

export function SeeAllButton({ isExpanded, totalItems, onToggle }: {
  isExpanded: boolean
  totalItems: number
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        padding: 'var(--space-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-xs)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <p style={{
        fontSize: 'var(--font-size-label)',
        color: 'var(--color-brand)',
        fontWeight: 600,
      }}>
        {isExpanded ? 'Daralt' : `Tümünu Gor (${totalItems})`}
      </p>
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="var(--color-brand)" strokeWidth="2"
        style={{
          transition: 'transform 0.3s ease',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

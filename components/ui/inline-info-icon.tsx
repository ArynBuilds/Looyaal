'use client'

import { Info } from 'lucide-react'
import { useState } from 'react'

interface InlineInfoIconProps {
  text: string
  className?: string
}

export function InlineInfoIcon({ text, className = '' }: InlineInfoIconProps) {
  const [open, setOpen] = useState(false)
  return (
    <span
      className={`relative inline-flex items-center ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-label={text}
    >
      <Info size={13} className="text-gray-400 hover:text-gray-600" />
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-1 w-64 -translate-x-1/2 rounded-md border border-gray-200 bg-white px-3 py-2 text-[11px] leading-relaxed text-gray-600 shadow-md"
        >
          {text}
        </span>
      )}
    </span>
  )
}

'use client'
// LOCKED — This file is part of the onboarding flow and must NOT be modified.// It is independent of the PWA design system (tokens, variants, templates).// Any changes to this file require explicit approval.

import { useEffect, useState } from 'react'
import { useTheme } from './theme-provider'

interface OnboardingSplashProps {
  onComplete: () => void
}

export function OnboardingSplash({ onComplete }: OnboardingSplashProps) {
  const theme = useTheme()
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => { setShow(false); onComplete() }, 2000)
    return () => clearTimeout(timer)
  }, [onComplete])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg, #0f0f0f)' }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="animate-[scaleIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
          {theme.logo_url ? (
            <img src={theme.logo_url} alt={theme.name} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-amber-600 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>
            </div>
          )}
        </div>
        <h1 className="mt-5 text-xl font-bold text-white animate-[fadeInUp_0.5s_ease-out_0.1s_forwards] opacity-0">
          {theme.name}
        </h1>
        <div className="mt-8 w-40 h-0.5 rounded-full bg-white/5 overflow-hidden animate-[fadeIn_0.4s_ease-out_0.2s_forwards] opacity-0">
          <div className="h-full rounded-full bg-amber-600 animate-[progressBar_1.8s_ease-out_forwards]"
            style={{ animationName: 'progressBar' }} />
        </div>
      </div>
      <div className="pb-10 text-center">
        <p className="text-[10px] text-white/20 tracking-widest uppercase">looyaal</p>
      </div>

      <style jsx>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(0.9); } to { opacity:1; transform:scale(1); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes progressBar { from { width:0%; } to { width:100%; } }
      `}</style>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProfilePillProps {
  user: { full_name: string; email: string }
}

export function ProfilePill({ user }: ProfilePillProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = user.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'


  return (
    <div ref={ref} className="relative border-t border-white/[0.06] px-3 py-3">
      {/* Pill button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2.5 rounded-full bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 transition-colors hover:bg-white/[0.08]"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-[11px] font-bold text-white">
          {initials}
        </div>
        <span className="flex-1 text-left text-[11px] font-medium text-white truncate">
          {user.full_name?.split(' ')[0] || user.email}
        </span>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-3 right-3 mb-2 rounded-xl bg-[#1a1a1a] border border-white/[0.08] shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2.5 border-b border-white/[0.06]">
              <p className="text-xs font-medium text-white">{user.full_name}</p>
              <p className="text-[10px] text-white/40">{user.email}</p>
            </div>
            <div className="py-1">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/70 hover:bg-white/[0.06] transition-colors"
              >
                <Settings size={14} />
                Ayarlar
              </Link>
            </div>
            <div className="border-t border-white/[0.06] py-1">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-white/[0.06] transition-colors"
              >
                <LogOut size={14} />
                Çıkış Yap
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

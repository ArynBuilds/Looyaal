'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  LayoutDashboard,
  Star,
  Megaphone,
  Smartphone,
  MessageSquare,
} from 'lucide-react'

const navItems = [
  { href: '/hub', label: 'Anasayfa', icon: LayoutDashboard },
  { href: '/loyalty', label: 'Şubeler', icon: Star },
  { href: '/editor', label: 'Uygulamam', icon: Smartphone },
  { href: '/influencers', label: 'Influencer', icon: Megaphone },
  { href: '/reviews', label: 'Google Yorumlar', icon: MessageSquare },
]

export function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }


  return (
    <aside className="flex flex-1 flex-col text-white">
      {/* Logo */}
      <div className="border-b border-white/[0.06] px-5 py-5">
        <h1 className="text-xl font-bold tracking-tight">looyaal</h1>
        <p className="mt-1 text-[11px] font-medium text-white/40">{orgName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                active ? '' : 'hover:bg-white/[0.06] active:bg-white/[0.1]'
              }`}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-white/[0.08]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                size={16}
                className={`relative z-10 transition-colors duration-150 ${active ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}
              />
              <span className={`relative z-10 transition-colors duration-150 ${active ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

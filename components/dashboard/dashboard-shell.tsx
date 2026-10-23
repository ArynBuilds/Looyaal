'use client'

import { Sidebar } from '@/components/ui/sidebar'
import { ProfilePill } from '@/components/ui/profile-pill'

interface DashboardShellProps {
  user: { full_name: string; email: string; role: string }
  org: { name: string; slug: string } | null
  children: React.ReactNode
}

export function DashboardShell({ user, org, children }: DashboardShellProps) {
  return (
    <div className="flex h-screen bg-[#f5f5f4]">
      {/* Dark sidebar + profile pill */}
      <div className="flex w-64 shrink-0 flex-col bg-[#0a0a0a]">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <Sidebar orgName={org?.name || ''} />
        </div>
        <ProfilePill user={user} />
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        {children}
      </main>
    </div>
  )
}

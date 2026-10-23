import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BaristaLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ orgSlug: string }>
}) {
  const { orgSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/barista/login')

  const admin = createAdminClient()
  const { data: userData } = await admin
    .from('users')
    .select('org_id, role, is_active')
    .eq('id', user.id)
    .single()

  if (!userData) redirect('/barista/login')
  if (!userData.is_active) redirect('/barista/login')
  if (!['barista', 'manager', 'owner'].includes(userData.role)) redirect('/barista/login')

  const { data: org } = await admin
    .from('organizations')
    .select('slug')
    .eq('id', userData.org_id)
    .single()

  if (!org) redirect('/barista/login')
  if (org.slug !== orgSlug) redirect(`/barista/${org.slug}`)

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-amber-500">looyaal</span>
          <span className="text-xs text-white/40">barista</span>
        </div>
        <span className="text-xs text-white/40">{orgSlug}</span>
      </header>
      {children}
    </div>
  )
}

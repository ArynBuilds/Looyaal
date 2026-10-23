import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { AuthProvider } from '@/lib/auth-context'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Select only the columns we need (smaller payload than `*`)
  const { data: userData } = await supabase
    .from('users')
    .select('id, email, full_name, role, org_id, organizations(id, name, slug, primary_color, pwa_theme, onboarding_completed)')
    .eq('id', user.id)
    .single()

  if (!userData) {
    redirect('/login')
  }

  const org = userData.organizations as unknown as { onboarding_completed: boolean } | null
  if (org && !org.onboarding_completed) {
    redirect('/onboarding')
  }

  return (
    <AuthProvider
      user={{
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        org_id: userData.org_id,
      }}
      org={userData.organizations as unknown as {
        id: string; name: string; slug: string; primary_color: string; pwa_theme: string;
      }}
    >
      <DashboardShell
        user={userData}
        org={userData.organizations as unknown as { name: string; slug: string }}
      >
        {children}
      </DashboardShell>
    </AuthProvider>
  )
}

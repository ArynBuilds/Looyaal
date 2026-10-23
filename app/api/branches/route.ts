import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchBranchMetrics } from '@/lib/dashboard/branch-metrics'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauth' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userRow } = await admin
    .from('users')
    .select('org_id')
    .eq('id', user.id)
    .single()
  if (!userRow?.org_id) return NextResponse.json({ error: 'no_org' }, { status: 400 })

  const branches = await fetchBranchMetrics(admin, userRow.org_id)
  return NextResponse.json({ branches })
}

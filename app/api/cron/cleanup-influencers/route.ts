import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const admin = createAdminClient()

  // Delete discovered influencers older than 90 days (never acted on)
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { count: staleDiscovered } = await admin
    .from('influencers')
    .delete({ count: 'exact' })
    .eq('status', 'discovered')
    .lt('created_at', ninetyDaysAgo)

  // Delete rejected influencers older than 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { count: staleRejected } = await admin
    .from('influencers')
    .delete({ count: 'exact' })
    .eq('status', 'rejected')
    .lt('created_at', thirtyDaysAgo)

  // Delete all influencer data for orgs that have disconnected Instagram
  const { data: disconnectedOrgs } = await admin
    .from('organizations')
    .select('id')
    .is('instagram_access_token', null)

  let orphanedCount = 0
  if (disconnectedOrgs && disconnectedOrgs.length > 0) {
    const orgIds = disconnectedOrgs.map(o => o.id)
    const { count } = await admin
      .from('influencers')
      .delete({ count: 'exact' })
      .in('org_id', orgIds)
    orphanedCount = count || 0
  }

  return NextResponse.json({
    ok: true,
    deleted: {
      staleDiscovered: staleDiscovered || 0,
      staleRejected: staleRejected || 0,
      orphaned: orphanedCount,
    },
  })
}

export { POST as GET }

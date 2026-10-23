import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { computeShopIntelligence } from '@/lib/intelligence'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const supabase = createAdminClient()
  const { data: orgs } = await supabase.from('organizations').select('id').eq('onboarding_completed', true)
  if (!orgs) return NextResponse.json({ error: 'No orgs' }, { status: 404 })

  let updated = 0

  for (const org of orgs) {
    await computeShopIntelligence(supabase, org.id)
    updated++
  }

  return NextResponse.json({ success: true, orgs: updated })
}

export { POST as GET }

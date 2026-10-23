import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCron } from '@/lib/cron-auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError

  const supabase = createAdminClient()
  const { error } = await supabase.rpc('compute_rfm_segments')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

export { POST as GET }

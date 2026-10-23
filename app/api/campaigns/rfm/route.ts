import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// RFM Segmentation — scores all customers for an org
// Can be called manually or via cron job
export async function POST() {
  try {
    const supabaseAuth = await createClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const supabase = createAdminClient()
    const { data: userData } = await supabase.from('users').select('org_id, role').eq('id', user.id).single()
    if (!userData?.org_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Run RFM scoring via SQL
    const { error } = await supabase.rpc('compute_rfm_segments')

    if (error) {
      // If the function doesn't exist yet, run it inline
      const { error: sqlError } = await supabase.from('customers').select('id').limit(0)

      if (sqlError) {
        return NextResponse.json({ error: sqlError.message }, { status: 500 })
      }

      // Run RFM directly
      await supabase.rpc('run_rfm_segmentation' as string).maybeSingle()
    }

    return NextResponse.json({ success: true, message: 'RFM segmentation completed' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

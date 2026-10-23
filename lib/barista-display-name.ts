import { SupabaseClient } from '@supabase/supabase-js'

export async function nextBaristaDisplayName(
  admin: SupabaseClient,
  orgId: string,
): Promise<string> {
  const { data } = await admin
    .from('users')
    .select('full_name')
    .eq('org_id', orgId)
    .like('full_name', 'Barista %')

  let max = 0
  for (const row of data ?? []) {
    const m = /^Barista (\d+)$/.exec((row as { full_name: string | null }).full_name ?? '')
    if (m) {
      const n = parseInt(m[1], 10)
      if (n > max) max = n
    }
  }
  return `Barista ${max + 1}`
}

import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseFetchOptions } from './url'

// Service role client — bypasses RLS. ONLY use in server-side API routes.
export function createAdminClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      ...supabaseFetchOptions,
    }
  )
}

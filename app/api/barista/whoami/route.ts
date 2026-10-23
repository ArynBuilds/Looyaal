import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const handle = url.searchParams.get('handle')
  const includeEmail = url.searchParams.get('includeEmail') === '1'
  if (!handle) return NextResponse.json({ error: 'Missing handle' }, { status: 400 })

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(handle)) {
    return NextResponse.json({ error: 'Invalid handle' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data } = await admin
    .from('users')
    .select('id, full_name, email, is_active, role, org_id')
    .eq('id', handle)
    .single()

  if (!data || !data.is_active) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (data.role !== 'barista' && data.role !== 'manager') {
    return NextResponse.json({ error: 'Not a barista' }, { status: 404 })
  }

  const { data: org } = await admin.from('organizations').select('slug').eq('id', data.org_id).single()

  return NextResponse.json({
    displayName: data.full_name,
    orgSlug: org?.slug ?? null,
    ...(includeEmail ? { email: data.email } : {}),
  })
}

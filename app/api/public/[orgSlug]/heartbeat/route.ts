import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
  locationId: z.string().uuid().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { customerId, locationId } = parsed.data

  const admin = createAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const { error } = await admin
    .from('active_sessions')
    .upsert(
      {
        org_id: org.id,
        customer_id: customerId,
        location_id: locationId || null,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: 'customer_id' }
    )

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }

  // Cleanup old sessions (>10 min)
  await admin
    .from('active_sessions')
    .delete()
    .lt('last_active_at', new Date(Date.now() - 10 * 60 * 1000).toISOString())

  return NextResponse.json({ ok: true })
}

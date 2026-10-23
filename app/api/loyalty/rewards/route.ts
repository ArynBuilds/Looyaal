import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data } = await admin
    .from('rewards')
    .select('*')
    .eq('org_id', userData.org_id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data ?? [])
}

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['free_item', 'discount_percent', 'discount_fixed']),
  value: z.number().optional(),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const admin = createAdminClient()
    const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
    if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (userData.role !== 'owner' && userData.role !== 'manager') {
      return NextResponse.json({ error: 'Owner or manager access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, type, value } = createSchema.parse(body)

    // Get active loyalty program
    const { data: program } = await admin
      .from('loyalty_programs')
      .select('id')
      .eq('org_id', userData.org_id)
      .eq('is_active', true)
      .single()

    if (!program) {
      return NextResponse.json({ error: 'Aktif sadakat programı bulunamadı' }, { status: 400 })
    }

    const { data: reward, error } = await admin
      .from('rewards')
      .insert({
        org_id: userData.org_id,
        program_id: program.id,
        name,
        description: description || null,
        type,
        value: value || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(reward)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

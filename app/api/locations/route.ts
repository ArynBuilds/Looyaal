import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1),
  address: z.string().optional().default(''),
  city: z.string().optional().default(''),
  district: z.string().optional().default(''),
  phone: z.string().optional().default(''),
  opening_time: z.string().optional().default('07:00'),
  closing_time: z.string().optional().default('23:00'),
})

// Owner adds a new branch (location).
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const locationData = schema.parse(await request.json())

    const admin = createAdminClient()
    const { data: userData } = await admin
      .from('users')
      .select('org_id, role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'owner') {
      return NextResponse.json({ error: 'Owner access required' }, { status: 403 })
    }

    const { data: location, error } = await admin
      .from('locations')
      .insert({ org_id: userData.org_id, ...locationData })
      .select()
      .single()

    if (error) {
      console.error('[locations] insert failed:', error.message)
      return NextResponse.json({ error: 'Şube oluşturulamadı' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, location })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

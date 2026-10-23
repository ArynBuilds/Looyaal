import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const menuItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().optional(),
  category: z.enum(['drink', 'food', 'dessert', 'other']).optional(),
  is_featured: z.boolean().optional(),
  sort_order: z.number().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { data, error } = await admin
    .from('menu_items')
    .select('*')
    .eq('org_id', userData.org_id)
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    console.error('DB error:', error.message)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData) return NextResponse.json({ error: 'User not found' }, { status: 404 })
  if (userData.role !== 'owner' && userData.role !== 'manager') {
    return NextResponse.json({ error: 'Owner or manager access required' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const parsed = menuItemSchema.parse(body)

    const { data, error } = await admin
      .from('menu_items')
      .insert({ org_id: userData.org_id, ...parsed })
      .select()
      .single()

    if (error) {
      console.error('DB error:', error.message)
      return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

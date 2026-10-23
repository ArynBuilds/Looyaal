import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Only allow safe fields to be updated
  const allowedFields = ['name', 'description', 'price', 'category', 'is_active', 'sort_order', 'image_url'] as const
  const safeBody: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) safeBody[key] = body[key]
  }

  const { data, error } = await admin
    .from('menu_items')
    .update(safeBody)
    .eq('id', id)
    .eq('org_id', userData.org_id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Remove associated photo from storage (best-effort — don't fail the delete
  // if the file is missing). Path convention: <org_id>/<menu_item_id>.webp
  const path = `${userData.org_id}/${id}.webp`
  const { error: rmError } = await admin.storage.from('menu-items').remove([path])
  if (rmError) {
    console.warn('Menu photo cleanup failed (non-fatal):', rmError.message)
  }

  const { error } = await admin
    .from('menu_items')
    .update({ is_active: false, image_url: null })
    .eq('id', id)
    .eq('org_id', userData.org_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

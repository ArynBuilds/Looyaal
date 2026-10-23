import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export { handlePut as PUT, handlePut as PATCH }

async function handlePut(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') return NextResponse.json({ error: 'Only owners' }, { status: 403 })

  const body = await request.json()

  const allowedFields = ['full_name', 'role', 'assigned_locations', 'is_active', 'phone'] as const
  const safeBody: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) safeBody[key] = body[key]
  }

  if (safeBody.role === 'owner') {
    return NextResponse.json({ error: 'Cannot assign owner role' }, { status: 403 })
  }

  const { data: target } = await admin.from('users').select('org_id').eq('id', id).single()
  if (!target || target.org_id !== userData.org_id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { error } = await admin.from('users').update(safeBody).eq('id', id).eq('org_id', userData.org_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if ('is_active' in safeBody) {
    const banDuration = safeBody.is_active ? 'none' : '876000h'
    const { error: banError } = await admin.auth.admin.updateUserById(id, {
      ban_duration: banDuration,
    } as { ban_duration: string })
    if (banError) console.error('[staff/PUT] ban toggle failed:', banError.message)
  }

  return NextResponse.json({ ok: true })
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
  const { data: userData } = await admin.from('users').select('org_id, role').eq('id', user.id).single()
  if (!userData || userData.role !== 'owner') return NextResponse.json({ error: 'Only owners' }, { status: 403 })

  await admin.from('users').update({ is_active: false }).eq('id', id).eq('org_id', userData.org_id)
  const { error: banError } = await admin.auth.admin.updateUserById(id, {
    ban_duration: '876000h',
  } as { ban_duration: string })
  if (banError) console.error('[staff/DELETE] ban toggle failed:', banError.message)

  return NextResponse.json({ ok: true })
}

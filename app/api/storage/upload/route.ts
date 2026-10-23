import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const typeSchema = z.enum(['logo', 'banner', 'menu'])

const BUCKETS = {
  logo: 'org-assets',
  banner: 'org-assets',
  menu: 'menu-items',
} as const

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const typeRaw = formData.get('type') as string | null
  const menuItemId = formData.get('menu_item_id') as string | null

  const typeParse = typeSchema.safeParse(typeRaw)
  if (!typeParse.success) {
    return NextResponse.json({ error: 'type must be logo, banner, or menu' }, { status: 400 })
  }
  const type = typeParse.data

  if (!file) return NextResponse.json({ error: 'file required' }, { status: 400 })
  if (file.size > 2 * 1024 * 1024) return NextResponse.json({ error: 'Dosya 2MB sınırından büyük' }, { status: 400 })
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Sadece görsel dosyalar yüklenebilir' }, { status: 400 })

  const admin = createAdminClient()

  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  let path: string
  if (type === 'menu') {
    if (!menuItemId) return NextResponse.json({ error: 'menu_item_id required for menu uploads' }, { status: 400 })

    // Verify the menu item belongs to the caller's org
    const { data: menuItem } = await admin
      .from('menu_items')
      .select('id, org_id')
      .eq('id', menuItemId)
      .single()
    if (!menuItem || menuItem.org_id !== userData.org_id) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 403 })
    }
    path = `${userData.org_id}/${menuItemId}.webp`
  } else {
    path = `${userData.org_id}/${type}.webp`
  }

  const bucket = BUCKETS[type]
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    console.error('Upload error:', uploadError.message)
    return NextResponse.json({ error: 'Yükleme başarısız' }, { status: 500 })
  }

  const { data: urlData } = admin.storage.from(bucket).getPublicUrl(path)

  // Append a cache-busting query param so <img> tags refresh after replace
  const publicUrl = `${urlData.publicUrl}?v=${Date.now()}`

  if (type === 'menu') {
    await admin.from('menu_items').update({ image_url: publicUrl }).eq('id', menuItemId)
  } else {
    const field = type === 'logo' ? 'logo_url' : 'banner_url'
    await admin.from('organizations').update({ [field]: publicUrl }).eq('id', userData.org_id)
  }

  return NextResponse.json({ url: publicUrl })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const typeRaw = searchParams.get('type')
  const menuItemId = searchParams.get('menu_item_id')

  // Only menu photos support explicit delete — logo/banner are replaced via upload
  if (typeRaw !== 'menu') return NextResponse.json({ error: 'Only type=menu supported' }, { status: 400 })
  if (!menuItemId) return NextResponse.json({ error: 'menu_item_id required' }, { status: 400 })

  const admin = createAdminClient()
  const { data: userData } = await admin.from('users').select('org_id').eq('id', user.id).single()
  if (!userData?.org_id) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  const { data: menuItem } = await admin
    .from('menu_items')
    .select('id, org_id')
    .eq('id', menuItemId)
    .single()
  if (!menuItem || menuItem.org_id !== userData.org_id) {
    return NextResponse.json({ error: 'Menu item not found' }, { status: 403 })
  }

  const path = `${userData.org_id}/${menuItemId}.webp`
  const { error: rmError } = await admin.storage.from('menu-items').remove([path])
  if (rmError) {
    console.error('Storage remove error:', rmError.message)
    // Don't fail — even if the file is already gone, we want to null the DB column
  }

  await admin.from('menu_items').update({ image_url: null }).eq('id', menuItemId)

  return NextResponse.json({ ok: true })
}

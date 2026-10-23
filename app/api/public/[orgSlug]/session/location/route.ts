import { createAdminClient } from '@/lib/supabase/admin'
import { haversineDistance, isNearLocation } from '@/lib/gps'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  customerId: z.string().uuid(),
  locationId: z.string().uuid(),
  latitude: z.number(),
  longitude: z.number(),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orgSlug: string }> }
) {
  const { orgSlug } = await params
  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  const { customerId, locationId, latitude, longitude } = parsed.data

  const admin = createAdminClient()

  const { data: location } = await admin
    .from('locations')
    .select('latitude, longitude, gps_verification')
    .eq('id', locationId)
    .single()

  if (!location) {
    return NextResponse.json({ error: 'Location not found' }, { status: 404 })
  }

  // If GPS verification disabled for this location, always pass
  if (!location.gps_verification) {
    return NextResponse.json({ verified: true, distance: 0 })
  }

  // If location has no coordinates, can't verify — pass
  if (!location.latitude || !location.longitude) {
    return NextResponse.json({ verified: true, distance: null, reason: 'no_shop_coordinates' })
  }

  const near = isNearLocation(
    latitude, longitude,
    Number(location.latitude), Number(location.longitude),
    100
  )

  const distance = Math.round(
    haversineDistance(
      latitude, longitude,
      Number(location.latitude), Number(location.longitude)
    )
  )

  return NextResponse.json({ verified: near, distance })
}

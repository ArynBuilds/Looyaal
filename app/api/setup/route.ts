import { createAdminClient } from '@/lib/supabase/admin'
import { getInstallState } from '@/lib/install'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const setupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  orgName: z.string().min(1),
})

// Whether the one-time owner account still needs to be created.
export async function GET() {
  const { hasOwner } = await getInstallState()
  return NextResponse.json({ needsSetup: !hasOwner })
}

// One-time owner account creation. Refused once an owner exists.
export async function POST(request: Request) {
  try {
    const { hasOwner } = await getInstallState()
    if (hasOwner) {
      return NextResponse.json({ error: 'Kurulum zaten tamamlandı.' }, { status: 403 })
    }

    const { email, password, fullName, orgName } = setupSchema.parse(await request.json())
    const admin = createAdminClient()

    // The handle_new_user trigger creates the organization, the owner row
    // and the default loyalty program from this metadata.
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, org_name: orgName },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ userId: data.user.id })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

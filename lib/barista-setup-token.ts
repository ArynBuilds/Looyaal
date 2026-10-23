import { SupabaseClient } from '@supabase/supabase-js'
import { createHmac, randomBytes } from 'crypto'

const TOKEN_TTL_HOURS = 24

function generateRawToken(): string {
  const secret = process.env.BARISTA_SETUP_SECRET
  if (!secret) throw new Error('BARISTA_SETUP_SECRET not set')
  const raw = randomBytes(12).toString('hex')
  const sig = createHmac('sha256', secret).update(raw).digest('hex').slice(0, 8)
  return raw + sig
}

export interface IssueResult {
  token: string
  expiresAt: string
}

export async function issueBaristaSetupToken(
  admin: SupabaseClient,
  params: { userId: string; orgId: string; issuedBy: string },
): Promise<IssueResult> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_HOURS * 3600 * 1000)

  await admin
    .from('barista_setup_tokens')
    .update({ revoked_at: now.toISOString() })
    .eq('user_id', params.userId)
    .is('consumed_at', null)
    .is('revoked_at', null)

  const token = generateRawToken()

  const { error } = await admin.from('barista_setup_tokens').insert({
    user_id: params.userId,
    org_id: params.orgId,
    token,
    issued_by: params.issuedBy,
    expires_at: expiresAt.toISOString(),
  })
  if (error) throw new Error(`Failed to issue setup token: ${error.message}`)

  return { token, expiresAt: expiresAt.toISOString() }
}

export interface LookupResult {
  userId: string
  orgId: string
  rowId: string
}

export async function lookupBaristaSetupToken(
  admin: SupabaseClient,
  token: string,
): Promise<LookupResult | null> {
  if (!token || token.length !== 32) return null

  const secret = process.env.BARISTA_SETUP_SECRET
  if (!secret) throw new Error('BARISTA_SETUP_SECRET not set')

  const raw = token.slice(0, 24)
  const sig = token.slice(24)
  const expectedSig = createHmac('sha256', secret).update(raw).digest('hex').slice(0, 8)
  if (sig !== expectedSig) return null

  const { data } = await admin
    .from('barista_setup_tokens')
    .select('id, user_id, org_id, expires_at, consumed_at, revoked_at')
    .eq('token', token)
    .single()

  if (!data) return null
  if (data.consumed_at) return null
  if (data.revoked_at) return null
  if (new Date(data.expires_at) < new Date()) return null

  return { userId: data.user_id, orgId: data.org_id, rowId: data.id }
}

export async function consumeBaristaSetupToken(
  admin: SupabaseClient,
  rowId: string,
): Promise<boolean> {
  const { data } = await admin
    .from('barista_setup_tokens')
    .update({ consumed_at: new Date().toISOString() })
    .eq('id', rowId)
    .is('consumed_at', null)
    .is('revoked_at', null)
    .select('id')
    .maybeSingle()

  return data !== null
}

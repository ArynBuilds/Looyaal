// Signed customer login token (HMAC-SHA256) + cookie config. Proves a phone was
// OTP-verified, without a DB session table. httpOnly so JS can't read it; signed
// so the phone can't be forged.

import { createHmac, timingSafeEqual } from 'node:crypto'

export const SESSION_COOKIE = 'looyaal_session'
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

function secret(): string {
  const s = process.env.CUSTOMER_SESSION_SECRET
  if (!s) throw new Error('CUSTOMER_SESSION_SECRET is not set')
  return s
}

function hmac(payloadB64: string): string {
  return createHmac('sha256', secret()).update(payloadB64).digest('base64url')
}

interface SessionPayload { phone: string; exp: number }

export function signSession(phone: string, ttlSeconds: number = ONE_YEAR_SECONDS): string {
  const payload: SessionPayload = { phone, exp: Math.floor(Date.now() / 1000) + ttlSeconds }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  return `${payloadB64}.${hmac(payloadB64)}`
}

export function verifySession(token: string): { phone: string } | null {
  if (!token || !token.includes('.')) return null
  const [payloadB64, sig] = token.split('.')
  if (!payloadB64 || !sig) return null

  const expected = hmac(payloadB64)
  // Constant-time compare; lengths must match for timingSafeEqual.
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString()) as SessionPayload
    if (!payload.phone || typeof payload.exp !== 'number') return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return { phone: payload.phone }
  } catch {
    return null
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ONE_YEAR_SECONDS,
  }
}

#!/usr/bin/env node
// Creates .env from .env.example (if missing) and fills every empty secret:
// POSTGRES_PASSWORD, JWT_SECRET, anon/service_role JWTs, VAPID keys and the
// app secrets. Existing values are never overwritten unless --force is given
// (do not --force after the database was initialised: POSTGRES_PASSWORD and
// JWT_SECRET are stored in it).
//
// Usage: node scripts/generate-secrets.mjs [--force] [--out path]

import { createHmac, randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import webpush from 'web-push'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const force = args.includes('--force')
const outArg = args.indexOf('--out')
const envPath = resolve(root, outArg >= 0 ? args[outArg + 1] : '.env')
const examplePath = resolve(root, '.env.example')

const hex = bytes => randomBytes(bytes).toString('hex')
const b64url = input => Buffer.from(input).toString('base64url')

function signJwt(payload, secret) {
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64url(JSON.stringify(payload))
  const sig = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

function supabaseKey(role, secret) {
  const iat = Math.floor(Date.now() / 1000)
  return signJwt({ role, iss: 'supabase', iat, exp: iat + 10 * 365 * 24 * 3600 }, secret)
}

// ---- load .env (or start from .env.example) ----
let text
if (existsSync(envPath)) text = readFileSync(envPath, 'utf8')
else if (existsSync(examplePath)) text = readFileSync(examplePath, 'utf8')
else text = ''
const lines = text.split(/\r?\n/)

const current = new Map()
for (const line of lines) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=(.*)$/)
  if (m) current.set(m[1], m[2].trim().replace(/^["']|["']$/g, ''))
}

const updates = new Map()
const isEmpty = key => force || !current.get(key)
const value = key => updates.get(key) ?? current.get(key)
const setIfEmpty = (key, gen) => { if (isEmpty(key)) updates.set(key, gen()) }

setIfEmpty('POSTGRES_PASSWORD', () => hex(24))
setIfEmpty('JWT_SECRET', () => hex(32))

// API keys must be signed with the (possibly existing) JWT_SECRET.
const jwtChanged = updates.has('JWT_SECRET')
if (jwtChanged || isEmpty('NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
  updates.set('NEXT_PUBLIC_SUPABASE_ANON_KEY', supabaseKey('anon', value('JWT_SECRET')))
}
if (jwtChanged || isEmpty('SUPABASE_SERVICE_ROLE_KEY')) {
  updates.set('SUPABASE_SERVICE_ROLE_KEY', supabaseKey('service_role', value('JWT_SECRET')))
}

for (const key of ['CRON_SECRET', 'QR_TOKEN_SECRET', 'BARISTA_SETUP_SECRET', 'CUSTOMER_SESSION_SECRET', 'POS_WEBHOOK_SECRET']) {
  setIfEmpty(key, () => hex(32))
}
setIfEmpty('DASHBOARD_PASSWORD', () => hex(16))
setIfEmpty('PG_META_CRYPTO_KEY', () => hex(32))

if (isEmpty('NEXT_PUBLIC_VAPID_PUBLIC_KEY') || isEmpty('VAPID_PRIVATE_KEY')) {
  const { publicKey, privateKey } = webpush.generateVAPIDKeys()
  updates.set('NEXT_PUBLIC_VAPID_PUBLIC_KEY', publicKey)
  updates.set('VAPID_PRIVATE_KEY', privateKey)
}

// ---- write back, preserving comments and order ----
const written = new Set()
const out = lines.map(line => {
  const m = line.match(/^(\s*)([A-Z0-9_]+)\s*=/)
  if (!m || !updates.has(m[2])) return line
  written.add(m[2])
  return `${m[1]}${m[2]}=${updates.get(m[2])}`
})
const missing = [...updates.keys()].filter(k => !written.has(k))
if (missing.length) {
  if (out.length && out[out.length - 1] === '') out.pop()
  out.push('', '# Added by scripts/generate-secrets.mjs', ...missing.map(k => `${k}=${updates.get(k)}`), '')
}
writeFileSync(envPath, out.join('\n'))

const keys = [...updates.keys()]
console.log(keys.length
  ? `Wrote ${keys.length} value(s) to ${envPath}:\n  ${keys.join('\n  ')}`
  : `${envPath} already has all secrets (use --force to regenerate).`)

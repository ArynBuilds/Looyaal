import { randomBytes } from 'crypto'

const BASE32 = 'abcdefghijklmnopqrstuvwxyz234567'

function base32(len: number): string {
  const bytes = randomBytes(len)
  let out = ''
  for (let i = 0; i < len; i++) out += BASE32[bytes[i] % 32]
  return out
}

export function syntheticBaristaEmail(): string {
  return `b-${base32(8)}@staff.looyaal.local`
}

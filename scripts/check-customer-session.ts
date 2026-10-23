process.env.CUSTOMER_SESSION_SECRET = 'test-secret-123'
import assert from 'node:assert/strict'
import { signSession, verifySession } from '../lib/customer-session'

// Round-trip: a freshly signed token verifies back to the phone.
const token = signSession('+905551112233')
assert.deepEqual(verifySession(token), { phone: '+905551112233' })

// Tampered payload fails (swap the phone in the base64 part).
const [, sig] = token.split('.')
const forged = Buffer.from(JSON.stringify({ phone: '+905559998877', exp: 9999999999 })).toString('base64url') + '.' + sig
assert.equal(verifySession(forged), null)

// Garbage / wrong shape fails.
assert.equal(verifySession('not-a-token'), null)
assert.equal(verifySession(''), null)

// Expired token fails (negative ttl).
const expired = signSession('+905551112233', -10)
assert.equal(verifySession(expired), null)

console.log('customer-session OK')

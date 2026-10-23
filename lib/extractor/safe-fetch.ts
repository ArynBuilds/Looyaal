// SSRF-safe fetch for user-supplied URLs: only http(s), every hop's hostname
// must resolve to public IPs, redirects are followed manually and re-checked,
// response bodies are size-capped.

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const MAX_REDIRECTS = 4
const USER_AGENT = 'Mozilla/5.0 (compatible; LooyaalBrandExtractor/1.0)'

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number)
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isPrivateIP(ip: string): boolean {
  if (isIP(ip) === 4) return isPrivateIPv4(ip)
  const v6 = ip.toLowerCase()
  if (v6.startsWith('::ffff:')) return isPrivateIPv4(v6.slice(7))
  return (
    v6 === '::' || v6 === '::1' ||
    v6.startsWith('fc') || v6.startsWith('fd') ||  // unique local
    v6.startsWith('fe8') || v6.startsWith('fe9') || v6.startsWith('fea') || v6.startsWith('feb') || // link local
    v6.startsWith('ff')                            // multicast
  )
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  const url = new URL(raw)
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Only http(s) URLs are allowed')
  const host = url.hostname.replace(/^\[|\]$/g, '')
  const addresses = isIP(host) ? [host] : (await lookup(host, { all: true })).map(a => a.address)
  if (addresses.length === 0 || addresses.some(isPrivateIP)) {
    throw new Error('URL resolves to a private address')
  }
  return url
}

export async function safeFetch(raw: string, timeoutMs: number): Promise<Response> {
  const signal = AbortSignal.timeout(timeoutMs)
  let current = raw
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current)
    const res = await fetch(url, {
      redirect: 'manual',
      signal,
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,text/css,image/*,*/*;q=0.8' },
    })
    const location = res.headers.get('location')
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, url).href
      continue
    }
    return res
  }
  throw new Error('Too many redirects')
}

async function readCapped(res: Response, maxBytes: number, strict = false): Promise<Uint8Array> {
  if (!res.body) return new Uint8Array()
  const reader = res.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done || !value) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      if (strict) throw new Error('Response too large')
      break
    }
    chunks.push(value)
  }
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.byteLength, 0))
  let offset = 0
  for (const c of chunks) { out.set(c, offset); offset += c.byteLength }
  return out
}

/** Fetch a URL as text. Returns the final URL (after redirects) for relative-link resolution. */
export async function fetchText(raw: string, opts: { timeoutMs: number; maxBytes: number }) {
  const res = await safeFetch(raw, opts.timeoutMs)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const bytes = await readCapped(res, opts.maxBytes)
  return { text: new TextDecoder().decode(bytes), finalUrl: res.url || raw }
}

/** Fetch a URL as binary (e.g. a logo image). */
export async function fetchBinary(raw: string, opts: { timeoutMs: number; maxBytes: number }) {
  const res = await safeFetch(raw, opts.timeoutMs)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const bytes = await readCapped(res, opts.maxBytes, true)
  return { bytes, contentType: res.headers.get('content-type') || '' }
}

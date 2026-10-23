// In-process cron scheduler. Started from instrumentation.ts on the Node.js
// runtime; ticks once per minute (aligned to the minute) and calls the cron
// routes over HTTP on this same server.

import { cronMatches, parseCron } from './cron-expression'
import { CRON_JOBS } from './jobs'

const RUN_TIMEOUT_MS = 15 * 60 * 1000

type GlobalWithScheduler = typeof globalThis & { __looyaalSchedulerStarted?: boolean }

function baseUrl(): string {
  if (process.env.LOOYAAL_SCHEDULER_URL) return process.env.LOOYAAL_SCHEDULER_URL.replace(/\/$/, '')
  return `http://127.0.0.1:${process.env.PORT || 3000}`
}

async function runJob(name: string, secret: string, running: Set<string>): Promise<void> {
  if (running.has(name)) {
    console.log(`[scheduler] ${name} skipped (previous run still in progress)`)
    return
  }
  running.add(name)
  const started = Date.now()
  try {
    const res = await fetch(`${baseUrl()}/api/cron/${name}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(RUN_TIMEOUT_MS),
    })
    await res.text().catch(() => '')
    console.log(`[scheduler] ${name} -> ${res.status} in ${Date.now() - started}ms`)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[scheduler] ${name} failed after ${Date.now() - started}ms: ${message}`)
  } finally {
    running.delete(name)
  }
}

export function startScheduler(): void {
  const g = globalThis as GlobalWithScheduler
  if (g.__looyaalSchedulerStarted) return

  const mode = (process.env.LOOYAAL_SCHEDULER || 'on').toLowerCase()
  if (['off', 'false', '0', 'no', 'disabled'].includes(mode)) {
    console.log('[scheduler] disabled (LOOYAAL_SCHEDULER=off)')
    return
  }
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn('[scheduler] CRON_SECRET is not set, scheduler not started')
    return
  }
  g.__looyaalSchedulerStarted = true

  const jobs = CRON_JOBS.map(job => ({ ...job, cron: parseCron(job.schedule) }))
  const running = new Set<string>()

  const tick = () => {
    const now = new Date()
    for (const job of jobs) {
      if (cronMatches(job.cron, now)) void runJob(job.name, secret, running)
    }
  }

  // Align to the start of the next minute, then tick every 60s.
  const delay = 60_000 - (Date.now() % 60_000) + 500
  setTimeout(() => {
    tick()
    setInterval(tick, 60_000).unref?.()
  }, delay).unref?.()

  console.log(`[scheduler] started with ${jobs.length} jobs (UTC), target ${baseUrl()}`)
}

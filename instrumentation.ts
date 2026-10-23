// Next.js server startup hook. Starts the built-in cron scheduler on the
// Node.js runtime (disable with LOOYAAL_SCHEDULER=off).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { startScheduler } = await import('./lib/scheduler/scheduler')
  startScheduler()
}

// Cron schedule for the built-in scheduler (all times UTC).
// Each job POSTs to /api/cron/<name> with `Authorization: Bearer $CRON_SECRET`.
// Prefer an external cron? Set LOOYAAL_SCHEDULER=off and call the same URLs.

export interface CronJob {
  name: string
  schedule: string
}

export const CRON_JOBS: readonly CronJob[] = [
  { name: 'daily-intelligence',   schedule: '0 5 * * *' },
  { name: 'hourly-weather',       schedule: '0 8-21 * * *' },
  { name: 'weekly-rfm',           schedule: '0 4 * * 1' },
  { name: 'notification-queue',   schedule: '*/15 9-21 * * *' },
  { name: 'weekly-model-update',  schedule: '30 4 * * 1' },
  { name: 'weekly-measurement',   schedule: '0 6 * * *' },
  { name: 'campaign-scheduler',   schedule: '*/15 9-21 * * *' },
  { name: 'sync-reviews',         schedule: '0 7,13,19 * * *' },
  { name: 'discover-influencers', schedule: '0 6 * * *' },
  { name: 'cleanup-influencers',  schedule: '0 3 * * *' },
  { name: 'dead-hour-trigger',    schedule: '0 8-21 * * *' },
  { name: 'birthday-check',       schedule: '0 7 * * *' },
]

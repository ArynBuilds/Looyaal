import { verifyCron } from '@/lib/cron-auth'
import { NextResponse } from 'next/server'

// DEPRECATED 2026-04-11: the Monday weekly dead-hour push has been replaced
// by the daily dead-hour targeting system in lib/dead-hour-targeting.ts,
// which runs inside the daily-intelligence cron after the NBA loop.
// This endpoint is kept as a no-op so the Vercel cron schedule continues to
// hit a valid route, and so the file history is preserved for git archeology.
export async function POST(request: Request) {
  const authError = verifyCron(request)
  if (authError) return authError
  return NextResponse.json({ ok: true, note: 'replaced by dead-hour-targeting in daily-intelligence' })
}

export { POST as GET }

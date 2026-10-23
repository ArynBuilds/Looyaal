// Minimal 5-field cron matcher (minute hour day-of-month month day-of-week).
// Supports: *  n  a-b  */n  a-b/n  and comma lists. Evaluated in UTC.

type FieldSet = Set<number>

interface ParsedCron {
  minute: FieldSet
  hour: FieldSet
  dayOfMonth: FieldSet
  month: FieldSet
  dayOfWeek: FieldSet
  domRestricted: boolean
  dowRestricted: boolean
}

const RANGES: ReadonlyArray<[number, number]> = [
  [0, 59], // minute
  [0, 23], // hour
  [1, 31], // day of month
  [1, 12], // month
  [0, 7],  // day of week (0 and 7 = Sunday)
]

function parseField(field: string, [min, max]: [number, number]): FieldSet {
  const values = new Set<number>()
  for (const part of field.split(',')) {
    const [rangePart, stepPart] = part.split('/')
    const step = stepPart === undefined ? 1 : Number(stepPart)
    if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step "${part}"`)

    let start: number
    let end: number
    if (rangePart === '*') {
      start = min
      end = max
    } else if (rangePart.includes('-')) {
      const [a, b] = rangePart.split('-').map(Number)
      start = a
      end = b
    } else {
      start = Number(rangePart)
      end = stepPart === undefined ? start : max
    }
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < min || end > max || start > end) {
      throw new Error(`Invalid cron field "${part}"`)
    }
    for (let v = start; v <= end; v += step) values.add(v)
  }
  return values
}

export function parseCron(expression: string): ParsedCron {
  const fields = expression.trim().split(/\s+/)
  if (fields.length !== 5) throw new Error(`Cron "${expression}" must have 5 fields`)
  const [minute, hour, dayOfMonth, month, dayOfWeek] = fields.map((f, i) => parseField(f, RANGES[i]))
  if (dayOfWeek.has(7)) dayOfWeek.add(0)
  return {
    minute, hour, dayOfMonth, month, dayOfWeek,
    domRestricted: fields[2] !== '*',
    dowRestricted: fields[4] !== '*',
  }
}

export function cronMatches(cron: ParsedCron, date: Date): boolean {
  if (!cron.minute.has(date.getUTCMinutes())) return false
  if (!cron.hour.has(date.getUTCHours())) return false
  if (!cron.month.has(date.getUTCMonth() + 1)) return false

  const domOk = cron.dayOfMonth.has(date.getUTCDate())
  const dowOk = cron.dayOfWeek.has(date.getUTCDay())
  // Standard cron: if both day fields are restricted, either may match.
  if (cron.domRestricted && cron.dowRestricted) return domOk || dowOk
  return domOk && dowOk
}

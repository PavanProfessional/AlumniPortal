// Fixed "now" anchor so all sample data reads as current/realistic without drifting on every load.
export const NOW = new Date('2026-08-29T09:00:00Z')

export function daysAgo(n: number): string {
  const d = new Date(NOW)
  d.setUTCDate(d.getUTCDate() - n)
  return d.toISOString()
}

export function daysFromNow(n: number): string {
  const d = new Date(NOW)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString()
}

export function hoursAgo(n: number): string {
  const d = new Date(NOW)
  d.setUTCHours(d.getUTCHours() - n)
  return d.toISOString()
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }): string {
  return new Date(iso).toLocaleDateString('en-US', opts)
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
}

export function formatRelative(iso: string): string {
  const diffMs = new Date(iso).getTime() - NOW.getTime()
  const diffMin = Math.round(diffMs / 60000)
  const abs = Math.abs(diffMin)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  if (abs < 60) return rtf.format(diffMin, 'minute')
  if (abs < 1440) return rtf.format(Math.round(diffMin / 60), 'hour')
  if (abs < 43200) return rtf.format(Math.round(diffMin / 1440), 'day')
  return rtf.format(Math.round(diffMin / 43200), 'month')
}

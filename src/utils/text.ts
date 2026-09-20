export function cleanStr(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

export function titleCase(s: string): string {
  if (!s) return s
  return s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
}

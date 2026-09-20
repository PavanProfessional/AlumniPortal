// Shared CSV/JSON parsing + lightweight field-mapping and validation, used by
// both the admin Import console and the onboarding "Import alumni" step so
// the two never drift into two different (and differently honest) analyses.
export interface ParsedFile {
  columns: string[]
  rows: Record<string, string>[]
}

export interface FileAnalysis {
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  missingEmail: number
  invalidEmail: number
  emailColumn?: string
  requiredPresent: boolean
}

const destFieldGuesses: { dest: string; keywords: string[] }[] = [
  { dest: 'email', keywords: ['email', 'mail'] },
  { dest: 'phone', keywords: ['phone', 'number', 'mobile', 'contact'] },
  { dest: 'firstName', keywords: ['firstname', 'fname'] },
  { dest: 'lastName', keywords: ['lastname', 'lname'] },
  { dest: 'name', keywords: ['name'] },
  { dest: 'batch', keywords: ['batch'] },
  { dest: 'graduationYear', keywords: ['passout', 'grad', 'year'] },
  { dest: 'occupation', keywords: ['occupation', 'job', 'designation', 'role'] },
  { dest: 'occupationType', keywords: ['occupationtype', 'type'] },
  { dest: 'education', keywords: ['education', 'degree', 'qualification'] },
  { dest: 'nativePlace', keywords: ['native'] },
  { dest: 'workingPlace', keywords: ['working', 'workplace'] },
  { dest: 'location', keywords: ['place', 'location', 'city', 'address', 'district'] },
  { dest: 'linkedin', keywords: ['linkedin', 'linkdin'] },
]

export function guessDestination(column: string): string {
  const c = column.toLowerCase().replace(/[^a-z]/g, '')
  for (const g of destFieldGuesses) {
    if (g.keywords.some((k) => c.includes(k.replace(/[^a-z]/g, '')))) return g.dest
  }
  return 'ignored'
}

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') { inQuotes = !inQuotes; continue }
    if (ch === ',' && !inQuotes) { out.push(cur.trim()); cur = ''; continue }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

function parseDelimited(text: string): ParsedFile {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { columns: [], rows: [] }
  const columns = splitCsvLine(lines[0])
  const rows = lines.slice(1).map((line) => {
    const cells = splitCsvLine(line)
    const row: Record<string, string> = {}
    columns.forEach((c, i) => { row[c] = cells[i] ?? '' })
    return row
  })
  return { columns, rows }
}

export function parseUploadedFile(fileName: string, text: string): ParsedFile {
  if (fileName.toLowerCase().endsWith('.json')) {
    try {
      const data: unknown = JSON.parse(text)
      const arr: unknown[] = Array.isArray(data)
        ? data
        : (Object.values(data as Record<string, unknown>).find((v) => Array.isArray(v)) as unknown[] | undefined) ?? []
      const rows = arr.map((r) => Object.fromEntries(
        Object.entries(r as Record<string, unknown>).map(([k, v]) => [k, v == null ? '' : String(v)]),
      ))
      const columns = rows.length ? Object.keys(rows[0]) : []
      return { columns, rows }
    } catch {
      return { columns: [], rows: [] }
    }
  }
  return parseDelimited(text)
}

export function analyzeRows(columns: string[], rows: Record<string, string>[]): FileAnalysis {
  const emailColumn = columns.find((c) => guessDestination(c) === 'email')
  const nameLike = columns.some((c) => ['name', 'firstName', 'lastName'].includes(guessDestination(c)))
  let missingEmail = 0
  let invalidEmail = 0
  let duplicateRows = 0
  const seen = new Set<string>()
  rows.forEach((r) => {
    const email = emailColumn ? (r[emailColumn] ?? '').trim() : ''
    if (!email) { missingEmail += 1; return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { invalidEmail += 1; return }
    const key = email.toLowerCase()
    if (seen.has(key)) duplicateRows += 1
    else seen.add(key)
  })
  const invalidRows = missingEmail + invalidEmail
  const validRows = Math.max(0, rows.length - invalidRows - duplicateRows)
  return { totalRows: rows.length, validRows, invalidRows, duplicateRows, missingEmail, invalidEmail, emailColumn, requiredPresent: nameLike }
}

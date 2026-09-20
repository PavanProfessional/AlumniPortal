// Single source of truth for reading src/assets/data/alumni_data.json — a real
// alumni-association export. Per explicit direction, this exposes the alumnus's
// own directory/contact fields (name, phone, email, batch, occupation,
// education, native/working place, LinkedIn) for use in the member-only
// alumni directory. It still never touches A_Password, Password, token,
// reset or verified — every other module that needs "real alumni" data (the
// community feed, the member directory) reads it through here so that
// exclusion only has to be enforced in one place.
import alumniRaw from '../assets/data/alumni_data.json'
import { cleanStr, titleCase } from '../utils/text'

interface RawAlumniRecord {
  A_Name?: string
  A_Number?: string
  A_Email?: string
  A_Batch?: string
  A_Passoutyear?: string
  A_Occupation?: string
  A_OccupationType?: string
  A_Education?: string
  A_NativePlace?: string
  A_WorkingPlace?: string
  A_Linkdin?: string
}

const rawAlumni = alumniRaw as RawAlumniRecord[]

export interface SafeAlumniRecord {
  index: number
  id: string
  name: string
  firstName: string
  lastName: string
  phone: string
  email: string
  batch: string
  passoutYear: string
  graduationYear: number | null
  occupation: string
  occupationType: string
  education: string
  nativePlace: string
  workingPlace: string
  linkedin?: string
}

function isLikelyUrl(s: string): boolean {
  return /^https?:\/\//i.test(s) || /linkedin\.com/i.test(s)
}

function parseGraduationYear(passoutYear: string, batch: string): number | null {
  const y = Number(passoutYear)
  if (Number.isInteger(y) && y > 1950 && y < 2035) return y
  const end = Number(batch.split('-')[1] ?? batch.split('-')[0])
  if (Number.isInteger(end) && end > 1950 && end < 2035) return end
  return null
}

export const safeAlumniRecords: SafeAlumniRecord[] = rawAlumni.map((r, index) => {
  const name = cleanStr(r.A_Name) || `KLE Tech Alumnus ${index + 1}`
  const [firstName, ...rest] = name.split(/\s+/)
  const batch = cleanStr(r.A_Batch)
  const passoutYear = cleanStr(r.A_Passoutyear)
  const linkedinRaw = cleanStr(r.A_Linkdin)
  return {
    index,
    id: `alum_${index}`,
    name,
    firstName: firstName || name,
    lastName: rest.join(' '),
    phone: cleanStr(r.A_Number),
    email: cleanStr(r.A_Email),
    batch,
    passoutYear,
    graduationYear: parseGraduationYear(passoutYear, batch),
    occupation: titleCase(cleanStr(r.A_Occupation)),
    occupationType: titleCase(cleanStr(r.A_OccupationType)),
    education: cleanStr(r.A_Education),
    nativePlace: titleCase(cleanStr(r.A_NativePlace)),
    workingPlace: titleCase(cleanStr(r.A_WorkingPlace)),
    linkedin: isLikelyUrl(linkedinRaw) ? linkedinRaw : undefined,
  }
})

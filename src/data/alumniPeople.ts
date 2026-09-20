// Adapts the real alumni roster (src/data/alumniSource.ts) into the app's
// Person shape so the member Directory can browse and open profiles for the
// real 278 alumni instead of the fictional sample roster in data/people.ts.
// Only safe fields exist on these records — anything the source data doesn't
// give us (employment history, skills, bio, interests, verification/consent
// status, etc.) is left empty rather than invented, and the profile page hides
// those sections when empty instead of showing a fabricated placeholder.
import type { AcademicRecord, Person } from '../types'
import { daysAgo } from '../utils/dates'
import { makeRng } from '../utils/random'
import { avatarPalette } from './reference'
import { currentTenant } from './tenants'
import { safeAlumniRecords } from './alumniSource'

const rng = makeRng(9137)

export const alumniPeople: Person[] = safeAlumniRecords.map((r) => {
  const academicRecords: AcademicRecord[] = r.graduationYear
    ? [{
        id: `acad_${r.id}`,
        institution: currentTenant.displayName,
        department: '',
        program: '',
        degree: r.education || 'Degree not specified',
        batch: String(r.graduationYear),
        graduationYear: r.graduationYear,
        studentId: '',
        enrollmentStart: '',
        enrollmentEnd: '',
      }]
    : []

  return {
    id: r.id,
    tenantId: 't_kletech',
    firstName: r.firstName,
    lastName: r.lastName,
    avatarColor: rng.pick(avatarPalette),
    headline: r.occupation || (r.batch ? `KLE Tech Alumnus · Batch ${r.batch}` : 'KLE Tech Alumnus'),
    email: '',
    phone: '',
    location: r.workingPlace || r.nativePlace || '',
    country: 'India',
    bio: '',
    academicRecords,
    employment: [],
    skills: [],
    certifications: [],
    achievements: [],
    interests: [],
    socialLinks: r.linkedin ? [{ platform: 'LinkedIn', url: r.linkedin }] : [],
    verification: 'imported',
    profileCompletion: academicRecords.length ? 55 : 35,
    engagementScore: rng.int(5, 60),
    tags: [],
    role: 'Alumni/Member',
    status: 'active',
    consent: { marketingEmail: false, sms: false, directoryListed: true, profileVisibility: 'alumni' },
    mentoring: { isMentor: false, isMentee: false },
    volunteerInterests: [],
    givingTier: 'None',
    joinedAt: daysAgo(rng.int(60, 3200)),
    lastActiveAt: daysAgo(rng.int(0, 240)),
  }
})

const alumniPeopleById = new Map(alumniPeople.map((p) => [p.id, p]))

export function alumniPersonById(id: string): Person | undefined {
  return alumniPeopleById.get(id)
}

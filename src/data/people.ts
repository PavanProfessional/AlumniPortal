import type { Person, EmploymentRecord, AcademicRecord, VerificationStatus, FieldVisibility } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo } from '../utils/dates'
import { firstNames, lastNames } from './names'
import {
  avatarPalette, batches, cities, companies, degreeTypes,
  industries, programs, skillsPool, departments,
} from './reference'

const rng = makeRng(1001)

const titles = [
  'Software Engineer', 'Senior Software Engineer', 'Product Manager', 'Data Scientist',
  'Engineering Manager', 'UX Designer', 'Marketing Manager', 'Business Analyst',
  'Investment Associate', 'Operations Lead', 'Founder & CEO', 'VP of Engineering',
  'Consultant', 'Research Scientist', 'Financial Analyst', 'Solutions Architect',
  'Growth Lead', 'Chief of Staff', 'Program Director', 'Account Executive',
]

const bios = [
  'Passionate about building products that scale and mentoring the next generation of builders.',
  'Focused on turning data into decisions across fast-growing teams.',
  'Enjoys bridging engineering and business, currently exploring applied AI.',
  'Believes in giving back — active volunteer with campus recruiting and mentoring circles.',
  'Career spans three continents; loves helping alumni relocate and settle in.',
  'Building in public and always happy to jam on early-stage ideas with fellow alumni.',
  'Long-time advocate for diversity in tech hiring pipelines.',
  'Enjoys judging hackathons and speaking at alumni-run bootcamps.',
]

const verificationOptions: VerificationStatus[] = ['institution-verified', 'self-verified', 'imported', 'unverified', 'disputed']
const visibilityOptions: FieldVisibility[] = ['alumni', 'organisation', 'public', 'private']

function makeName(i: number) {
  const first = firstNames[i % firstNames.length]
  const last = lastNames[(i * 7 + 3) % lastNames.length]
  return { first, last }
}

function makeAcademic(i: number, gradYear: number): AcademicRecord {
  return {
    id: `acad_${i}`,
    institution: 'KLE Technological University',
    campus: 'Main Campus',
    faculty: rng.pick(departments),
    department: rng.pick(departments),
    program: rng.pick(programs),
    degree: rng.pick(degreeTypes),
    batch: String(gradYear),
    graduationYear: gradYear,
    studentId: `KT${gradYear}${String(1000 + i).slice(-4)}`,
    enrollmentStart: `${gradYear - 4}-08-01`,
    enrollmentEnd: `${gradYear}-05-30`,
  }
}

function makeEmployment(i: number): EmploymentRecord[] {
  const count = rng.int(1, 3)
  const out: EmploymentRecord[] = []
  let yearsBack = rng.int(0, 2)
  for (let e = 0; e < count; e++) {
    const company = rng.pick(companies)
    const start = 2026 - yearsBack - rng.int(1, 4)
    const end = e === 0 ? undefined : start + rng.int(1, 3)
    out.push({
      id: `emp_${i}_${e}`,
      company: company.name,
      title: rng.pick(titles),
      industry: rng.pick(industries),
      location: rng.pick(cities),
      startDate: `${start}-0${rng.int(1, 9)}-01`,
      endDate: end ? `${end}-0${rng.int(1, 9)}-01` : undefined,
      current: e === 0,
    })
    yearsBack += rng.int(2, 5)
  }
  return out
}

export const people: Person[] = Array.from({ length: 72 }).map((_, idx) => {
  const i = idx + 1
  const { first, last } = makeName(idx)
  const gradYear = Number(rng.pick(batches))
  const academic = [makeAcademic(i, gradYear)]
  if (rng.bool(0.15)) academic.push(makeAcademic(i + 1000, gradYear - rng.int(2, 4)))
  const employment = makeEmployment(i)
  const skills = rng.pickMany(skillsPool, rng.int(3, 7))
  const isMentor = rng.bool(0.22)
  const isMentee = !isMentor && rng.bool(0.18)
  const status: Person['status'] = rng.bool(0.9) ? 'active' : rng.pick(['pending', 'invited', 'suspended'])
  const completion = rng.int(35, 100)
  const engagement = rng.int(5, 98)

  return {
    id: `p_${String(i).padStart(4, '0')}`,
    tenantId: 't_kletech',
    firstName: first,
    lastName: last,
    avatarColor: rng.pick(avatarPalette),
    headline: `${employment[0]?.title ?? 'Alumnus'} at ${employment[0]?.company ?? 'KLE Technological University'}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${i}@alumnimail.com`,
    phone: `+1 415-555-${String(1000 + i).slice(-4)}`,
    location: rng.pick(cities),
    country: rng.pick(['United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany', 'Singapore']),
    bio: rng.pick(bios),
    academicRecords: academic,
    employment,
    skills,
    certifications: rng.bool(0.4) ? rng.pickMany(['PMP', 'AWS Certified Solutions Architect', 'CFA Level II', 'Six Sigma Black Belt', 'CPA', 'Google UX Design Certificate'], rng.int(1, 2)) : [],
    achievements: rng.bool(0.3) ? [`${rng.pick(["Dean's List", 'Alumni Excellence Award', 'Top 40 Under 40', 'Departmental Gold Medal'])} (${2020 + rng.int(0, 5)})`] : [],
    interests: rng.pickMany(['Photography', 'Startups', 'Running', 'Investing', 'Travel', 'Public Speaking', 'Chess', 'Cooking', 'Music', 'Volunteering'], rng.int(2, 4)),
    socialLinks: [
      { platform: 'LinkedIn', url: `https://linkedin.com/in/${first.toLowerCase()}${last.toLowerCase()}` },
      ...(rng.bool(0.3) ? [{ platform: 'Twitter', url: `https://x.com/${first.toLowerCase()}${last[0].toLowerCase()}` }] : []),
    ],
    verification: rng.pick(verificationOptions),
    profileCompletion: completion,
    engagementScore: engagement,
    tags: rng.pickMany(['high-engagement', 'donor-prospect', 'speaker', 'volunteer', 'mentor-ready', 'needs-verification', 'career-active', 'event-champion'], rng.int(0, 3)),
    role: i === 1 ? 'Organisation Owner' : rng.pick(['Alumni/Member', 'Alumni/Member', 'Alumni/Member', 'Alumni Relations Officer', 'Event Manager', 'Content Editor']),
    status,
    consent: {
      marketingEmail: rng.bool(0.82),
      sms: rng.bool(0.4),
      directoryListed: rng.bool(0.88),
      profileVisibility: rng.pick(visibilityOptions),
    },
    mentoring: { isMentor, isMentee },
    volunteerInterests: rng.bool(0.35) ? rng.pickMany(['Campus Recruiting', 'Guest Lecturing', 'Fundraising Ambassador', 'Mentoring', 'Regional Chapter Lead'], rng.int(1, 2)) : [],
    givingTier: rng.bool(0.3) ? rng.pick(['Bronze', 'Silver', 'Gold', 'Platinum'] as const) : 'None',
    joinedAt: daysAgo(rng.int(30, 2400)),
    lastActiveAt: daysAgo(rng.int(0, 120)),
  }
})

// The signed-in demo member — you.
export const currentPerson: Person = {
  ...people[3],
  id: 'p_me',
  firstName: 'Pavan',
  lastName: 'Kumar',
  headline: 'Alumnia Program Lead',
  email: 'pavan.kumar@alumnimail.com',
  bio: 'Administers the Alumnia demo workspace for KLE Technological University.',
  location: 'Bengaluru, India',
  country: 'India',
  profileCompletion: 86,
  engagementScore: 91,
  verification: 'institution-verified',
  role: 'Alumni/Member',
  status: 'active',
  mentoring: { isMentor: true, isMentee: false },
  givingTier: 'Gold',
  tags: ['high-engagement', 'mentor-ready', 'donor-prospect', 'speaker'],
}

export function personById(id: string): Person | undefined {
  if (id === currentPerson.id) return currentPerson
  return people.find((p) => p.id === id)
}

export const allPeople = [currentPerson, ...people]

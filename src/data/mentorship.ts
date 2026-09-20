import type { MentorProfile, Mentorship, MentorshipLifecycle } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo } from '../utils/dates'
import { industries, skillsPool } from './reference'
import { currentPerson, people } from './people'

const rng = makeRng(5005)

const mentorPeople = people.filter((p) => p.mentoring.isMentor).slice(0, 16)
const menteePeople = people.filter((p) => p.mentoring.isMentee).slice(0, 20)

export const mentors: MentorProfile[] = mentorPeople.map((p, idx) => ({
  id: `mentor_${String(idx + 1).padStart(3, '0')}`,
  personId: p.id,
  expertise: rng.pickMany(skillsPool, rng.int(2, 4)),
  industries: rng.pickMany(industries, rng.int(1, 2)),
  yearsExperience: rng.int(4, 20),
  capacity: rng.int(2, 5),
  activeMentees: rng.int(0, 4),
  languages: rng.pickMany(['English', 'Hindi', 'Spanish', 'Mandarin', 'French', 'German'], rng.int(1, 2)),
  timezone: rng.pick(['PT (UTC-8)', 'ET (UTC-5)', 'GMT (UTC+0)', 'IST (UTC+5:30)', 'SGT (UTC+8)']),
  bio: 'Happy to help with career transitions, technical growth, and navigating early leadership roles.',
  rating: Number((3.9 + rng.next() * 1.1).toFixed(1)),
}))

export const currentMentorProfile: MentorProfile = {
  id: 'mentor_me',
  personId: currentPerson.id,
  expertise: ['Product Management', 'Leadership', 'Public Speaking'],
  industries: ['Software & Technology'],
  yearsExperience: 9,
  capacity: 4,
  activeMentees: 2,
  languages: ['English', 'Hindi'],
  timezone: 'PT (UTC-8)',
  bio: 'PM leader passionate about helping early-career alumni break into product roles.',
  rating: 4.8,
}

const programs = ['Career Launch Cohort 9', 'Executive Mentoring Circle', 'Women in Tech Mentoring', 'Founders Mentoring Track', 'General Mentoring Pool']
const statuses: MentorshipLifecycle[] = ['application', 'screening', 'eligible', 'matched', 'invited', 'accepted', 'active', 'completed', 'ended']
const goalsPool = ['Switch into product management', 'Prepare for engineering leadership', 'Explore founding a startup', 'Negotiate a promotion', 'Break into a new industry', 'Build an executive network', 'Improve public speaking']

export const mentorships: Mentorship[] = menteePeople.map((mentee, idx) => {
  const mentor = rng.pick(mentorPeople)
  const status = rng.pick(statuses)
  const active = ['active', 'completed'].includes(status)
  return {
    id: `ment_${String(idx + 1).padStart(3, '0')}`,
    mentorId: mentors.find((m) => m.personId === mentor.id)?.id ?? mentors[0].id,
    menteeId: mentee.id,
    program: rng.pick(programs),
    status,
    goals: rng.pickMany(goalsPool, rng.int(1, 2)),
    matchScore: rng.int(64, 97),
    startedAt: active ? daysAgo(rng.int(20, 200)) : undefined,
    sessionsCompleted: active ? rng.int(1, 10) : 0,
    sessionsPlanned: active ? rng.int(4, 12) : 0,
    lastSessionAt: active ? daysAgo(rng.int(1, 30)) : undefined,
    satisfactionScore: status === 'completed' ? rng.int(3, 5) : undefined,
  }
})

export const myMentorships: Mentorship[] = [
  { id: 'ment_me_1', mentorId: 'mentor_me', menteeId: people[10].id, program: 'Career Launch Cohort 9', status: 'active', goals: ['Switch into product management'], matchScore: 93, startedAt: daysAgo(64), sessionsCompleted: 5, sessionsPlanned: 8, lastSessionAt: daysAgo(6) },
  { id: 'ment_me_2', mentorId: 'mentor_me', menteeId: people[24].id, program: 'Women in Tech Mentoring', status: 'active', goals: ['Build an executive network'], matchScore: 88, startedAt: daysAgo(30), sessionsCompleted: 2, sessionsPlanned: 6, lastSessionAt: daysAgo(12) },
]

export function mentorByPersonId(personId: string) {
  if (personId === currentPerson.id) return currentMentorProfile
  return mentors.find((m) => m.personId === personId)
}

export const allMentors = [currentMentorProfile, ...mentors]

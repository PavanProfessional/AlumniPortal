import type { EventItem, Registration, EventLifecycle, EventType, RegistrationState } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo, daysFromNow } from '../utils/dates'
import { avatarPalette } from './reference'
import { allPeople, currentPerson } from './people'

const rng = makeRng(2002)

interface EventSeed {
  title: string
  type: EventType
  status: EventLifecycle
  startOffset: number
  endOffset: number
  mode: EventItem['mode']
  venue?: string
  capacity: number
  price: number
  description: string
}

const seeds: EventSeed[] = [
  { title: 'Class of 2016 — 10 Year Reunion', type: 'Reunion', status: 'registration_open', startOffset: 34, endOffset: 34, mode: 'In-person', venue: 'KLE Tech Main Campus, Great Hall', capacity: 400, price: 45, description: 'Reconnect with your batch a decade on — campus tours, a keynote from the Dean, and an evening gala.' },
  { title: 'AI in Product: Fireside Chat', type: 'Webinar', status: 'registration_open', startOffset: 9, endOffset: 9, mode: 'Virtual', capacity: 500, price: 0, description: 'A candid conversation on shipping AI features with three alumni PM leaders from Nimbus Cloud, Vertex Analytics and Lumen Financial.' },
  { title: 'Bay Area Alumni Networking Night', type: 'Networking', status: 'registration_open', startOffset: 16, endOffset: 16, mode: 'In-person', venue: 'The Pier Rooftop, San Francisco', capacity: 150, price: 15, description: 'Casual evening mixer for alumni working in the Bay Area — drinks and appetizers included.' },
  { title: 'Resume & LinkedIn Bootcamp', type: 'Career Event', status: 'registration_open', startOffset: 5, endOffset: 5, mode: 'Virtual', capacity: 200, price: 0, description: 'Hands-on workshop with the careers team — bring your resume for live feedback.' },
  { title: 'Mentor Circle Kickoff — Cohort 9', type: 'Mentoring Event', status: 'registration_closed', startOffset: -3, endOffset: -3, mode: 'Virtual', capacity: 120, price: 0, description: 'Kickoff session pairing new mentors and mentees for the Fall cohort.' },
  { title: 'Founders & Builders Meetup', type: 'Networking', status: 'published', startOffset: 47, endOffset: 47, mode: 'In-person', venue: 'Innovation Hub, Austin', capacity: 100, price: 0, description: 'For alumni founders, operators and anyone building something new.' },
  { title: 'Annual Giving Day Livestream', type: 'Fundraising Event', status: 'registration_open', startOffset: 21, endOffset: 21, mode: 'Virtual', capacity: 1000, price: 0, description: '24-hour giving celebration with live leaderboards, matching gifts, and alumni stories.' },
  { title: 'Data Careers Panel', type: 'Career Event', status: 'draft', startOffset: 60, endOffset: 60, mode: 'Hybrid', venue: 'KLE Tech Innovation Center', capacity: 250, price: 0, description: 'Panel of data science and analytics leaders discussing career transitions.' },
  { title: 'Cricket & Cultural Fest', type: 'Sports/Cultural', status: 'completed', startOffset: -40, endOffset: -39, mode: 'In-person', venue: 'KLE Tech Sports Complex', capacity: 600, price: 10, description: 'Annual cricket tournament and cultural showcase for the South Asia chapter.' },
  { title: 'Product Management Deep Dive Workshop', type: 'Workshop', status: 'completed', startOffset: -18, endOffset: -18, mode: 'Virtual', capacity: 180, price: 20, description: 'A 3-hour practitioner workshop on roadmap prioritization frameworks.' },
  { title: 'Campus Homecoming Weekend', type: 'Campus Event', status: 'completed', startOffset: -75, endOffset: -73, mode: 'In-person', venue: 'KLE Tech Main Campus', capacity: 800, price: 30, description: 'Three days of campus tours, sports matches and department open houses.' },
  { title: 'Women in Leadership Roundtable', type: 'Networking', status: 'registration_open', startOffset: 12, endOffset: 12, mode: 'Virtual', capacity: 150, price: 0, description: 'Roundtable discussion with senior alumnae across industries.' },
  { title: 'European Chapter Winter Social', type: 'Networking', status: 'cancelled', startOffset: -10, endOffset: -10, mode: 'In-person', venue: 'The Ivy, London', capacity: 80, price: 25, description: 'Cancelled due to venue availability — will be rescheduled for Q1.' },
  { title: 'Scholarship Donor Appreciation Dinner', type: 'Fundraising Event', status: 'published', startOffset: 55, endOffset: 55, mode: 'In-person', venue: 'KLE Tech Alumni Center', capacity: 120, price: 0, description: 'An evening honoring donors funding the KLE Tech scholarship program.' },
]

export const events: EventItem[] = seeds.map((s, idx) => {
  const id = `ev_${String(idx + 1).padStart(3, '0')}`
  const registered = s.status === 'draft' ? 0 : Math.min(s.capacity, rng.int(Math.floor(s.capacity * 0.2), Math.floor(s.capacity * 0.95)))
  const attended = ['completed'].includes(s.status) ? Math.floor(registered * (0.7 + rng.next() * 0.25)) : 0
  return {
    id,
    title: s.title,
    type: s.type,
    status: s.status,
    description: s.description,
    coverColor: rng.pick(avatarPalette),
    startAt: s.startOffset >= 0 ? daysFromNow(s.startOffset) : daysAgo(-s.startOffset),
    endAt: s.endOffset >= 0 ? daysFromNow(s.endOffset) : daysAgo(-s.endOffset),
    mode: s.mode,
    venue: s.venue,
    meetingLink: s.mode !== 'In-person' ? 'https://meet.alumnia.io/room/' + id : undefined,
    capacity: s.capacity,
    registeredCount: registered,
    waitlistCount: registered >= s.capacity ? rng.int(3, 40) : 0,
    attendedCount: attended,
    price: s.price,
    currency: 'USD',
    organizer: 'Alumni Relations Office',
    speakers: rng.bool(0.6) ? rng.pickMany(allPeople, rng.int(1, 3)).map((p) => ({ name: `${p.firstName} ${p.lastName}`, title: p.headline })) : [],
    agenda: s.mode === 'In-person' || s.type === 'Workshop'
      ? [
          { time: '9:30 AM', item: 'Check-in & Registration' },
          { time: '10:00 AM', item: 'Welcome Address' },
          { time: '11:00 AM', item: s.type === 'Reunion' ? 'Campus Tour' : 'Main Session' },
          { time: '1:00 PM', item: 'Lunch & Networking' },
          { time: '3:00 PM', item: 'Closing Remarks' },
        ]
      : [
          { time: '5:00 PM', item: 'Doors Open' },
          { time: '5:15 PM', item: 'Main Session' },
          { time: '6:00 PM', item: 'Q&A' },
        ],
    tags: [s.type.toLowerCase().replace(/\s+/g, '-')],
  }
})

const sources = ['Direct', 'Email Campaign', 'Directory', 'Referral', 'Community Post']

export const registrations: Registration[] = events.flatMap((ev) => {
  const count = ev.registeredCount + ev.waitlistCount
  const pool = rng.pickMany(allPeople, Math.min(count, allPeople.length))
  return pool.map((p, i) => {
    let state: RegistrationState = 'registered'
    if (ev.status === 'completed') {
      state = i < ev.attendedCount ? 'attended' : rng.bool(0.7) ? 'no_show' : 'cancelled'
    } else if (i >= ev.registeredCount) {
      state = 'waitlisted'
    } else if (ev.status === 'live') {
      state = rng.bool(0.6) ? 'checked_in' : 'approved'
    } else if (ev.status === 'cancelled') {
      state = 'cancelled'
    } else {
      state = rng.bool(0.85) ? 'registered' : 'approved'
    }
    return {
      id: `reg_${ev.id}_${i}`,
      eventId: ev.id,
      personId: p.id,
      state,
      registeredAt: daysAgo(rng.int(1, 60)),
      source: rng.pick(sources),
    }
  })
})

export const myRegistrations: Registration[] = [
  { id: 'reg_me_1', eventId: 'ev_001', personId: currentPerson.id, state: 'registered', registeredAt: daysAgo(5), source: 'Email Campaign' },
  { id: 'reg_me_2', eventId: 'ev_003', personId: currentPerson.id, state: 'registered', registeredAt: daysAgo(2), source: 'Directory' },
  { id: 'reg_me_3', eventId: 'ev_010', personId: currentPerson.id, state: 'attended', registeredAt: daysAgo(30), source: 'Direct' },
  { id: 'reg_me_4', eventId: 'ev_011', personId: currentPerson.id, state: 'attended', registeredAt: daysAgo(90), source: 'Direct' },
]

export function eventById(id: string) {
  return events.find((e) => e.id === id)
}

export function registrationsForEvent(eventId: string) {
  return registrations.filter((r) => r.eventId === eventId)
}

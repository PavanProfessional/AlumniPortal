import { makeRng } from '../utils/random'
import { daysAgo, daysFromNow } from '../utils/dates'

const rng = makeRng(1212)

export interface CommsCampaign {
  id: string
  name: string
  channel: 'Email' | 'SMS' | 'Push' | 'In-app'
  status: 'draft' | 'scheduled' | 'processing' | 'sent' | 'completed' | 'cancelled'
  audience: string
  audienceSize: number
  sentAt?: string
  scheduledAt?: string
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
}

const seeds: Omit<CommsCampaign, 'id' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed'>[] = [
  { name: 'Fall Reunion Save-the-Date', channel: 'Email', status: 'sent', audience: 'Class of 2016', audienceSize: 1240, sentAt: daysAgo(6) },
  { name: 'Giving Day Kickoff', channel: 'Email', status: 'sent', audience: 'All active donors', audienceSize: 3820, sentAt: daysAgo(2) },
  { name: 'Bay Area Networking Night Reminder', channel: 'SMS', status: 'scheduled', audience: 'Bay Area registrants', audienceSize: 148, scheduledAt: daysFromNow(2) },
  { name: 'Mentor Cohort 9 Kickoff', channel: 'Email', status: 'sent', audience: 'Mentoring program', audienceSize: 240, sentAt: daysAgo(10) },
  { name: 'Q3 Newsletter', channel: 'Email', status: 'draft', audience: 'All members', audienceSize: 24186 },
  { name: 'Incomplete Profile Nudge', channel: 'In-app', status: 'processing', audience: 'Profile completion < 60%', audienceSize: 4210 },
  { name: 'New Job Board Launch', channel: 'Push', status: 'completed', audience: 'Careers opt-in', audienceSize: 6120, sentAt: daysAgo(22) },
  { name: 'Winter Chapter Social — EU', channel: 'Email', status: 'cancelled', audience: 'European chapter', audienceSize: 410, sentAt: daysAgo(14) },
]

export const commsCampaigns: CommsCampaign[] = seeds.map((s, idx) => {
  const delivered = s.status === 'draft' || s.status === 'scheduled' ? 0 : Math.round(s.audienceSize * (0.94 + rng.next() * 0.05))
  const opened = delivered ? Math.round(delivered * (0.35 + rng.next() * 0.25)) : 0
  const clicked = opened ? Math.round(opened * (0.15 + rng.next() * 0.2)) : 0
  return {
    id: `cc_${String(idx + 1).padStart(3, '0')}`,
    ...s,
    sent: s.status === 'draft' || s.status === 'scheduled' ? 0 : s.audienceSize,
    delivered,
    opened,
    clicked,
    bounced: delivered ? Math.round(s.audienceSize * rng.next() * 0.02) : 0,
    unsubscribed: delivered ? Math.round(s.audienceSize * rng.next() * 0.005) : 0,
  }
})

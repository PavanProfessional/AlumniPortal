import type { FundraisingCampaign, Donation, CampaignFundraisingType, DonationLifecycle } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo, daysFromNow } from '../utils/dates'
import { avatarPalette } from './reference'
import { allPeople, currentPerson } from './people'

const rng = makeRng(6006)

interface CampaignSeed { title: string; type: CampaignFundraisingType; goal: number; status: FundraisingCampaign['status']; start: number; end: number; description: string }

const seeds: CampaignSeed[] = [
  { title: 'KLE Tech Scholarship Fund 2026', type: 'Scholarship', goal: 500000, status: 'active', start: -60, end: 45, description: 'Funding need-based scholarships for the incoming class of 500+ students.' },
  { title: 'New Innovation Center Capital Campaign', type: 'Infrastructure', goal: 5000000, status: 'active', start: -180, end: 300, description: 'Building a state-of-the-art innovation and maker space on the main campus.' },
  { title: 'Annual Giving Day', type: 'General Fund', goal: 250000, status: 'active', start: -5, end: 16, description: '24-hour campus-wide giving celebration with matching gift challenges.' },
  { title: 'Emergency Student Relief Fund', type: 'Emergency Relief', goal: 100000, status: 'active', start: -30, end: 60, description: 'Immediate financial support for students facing unexpected hardship.' },
  { title: 'Endowed Faculty Chair — Computer Science', type: 'Endowment', goal: 2000000, status: 'active', start: -240, end: 400, description: 'Establishing a permanently endowed faculty chair in the CS department.' },
  { title: 'Athletics Facility Upgrade', type: 'Athletics', goal: 750000, status: 'paused', start: -400, end: -10, description: 'Renovation of the track and field complex — currently paused pending design review.' },
  { title: 'AI Research Lab Fund', type: 'Research', goal: 1200000, status: 'completed', start: -500, end: -30, description: 'Seed funding for the applied AI research lab, successfully completed.' },
]

export const campaigns: FundraisingCampaign[] = seeds.map((s, idx) => {
  const raisedPct = s.status === 'completed' ? 1 + rng.next() * 0.1 : rng.next() * 0.85 + 0.05
  return {
    id: `camp_${String(idx + 1).padStart(3, '0')}`,
    title: s.title,
    type: s.type,
    description: s.description,
    coverColor: rng.pick(avatarPalette),
    goal: s.goal,
    raised: Math.round(s.goal * raisedPct),
    currency: 'USD',
    donorCount: rng.int(40, 1800),
    startAt: s.start >= 0 ? daysFromNow(s.start) : daysAgo(-s.start),
    endAt: s.end >= 0 ? daysFromNow(s.end) : daysAgo(-s.end),
    status: s.status,
    recurringRevenue: Math.round(s.goal * rng.next() * 0.02),
  }
})

const donationStatuses: DonationLifecycle[] = ['captured', 'captured', 'captured', 'captured', 'authorized', 'refunded', 'failed']

export const donations: Donation[] = campaigns.flatMap((c) => {
  const count = rng.int(14, 26)
  const donors = rng.pickMany(allPeople, count)
  return donors.map((d, i) => {
    const recurring = rng.bool(0.25)
    return {
      id: `don_${c.id}_${i}`,
      campaignId: c.id,
      donorId: d.id,
      amount: rng.pick([25, 50, 100, 150, 250, 500, 1000, 2500, 5000]),
      currency: 'USD',
      recurring,
      frequency: recurring ? rng.pick(['Monthly', 'Quarterly', 'Annually'] as const) : undefined,
      status: rng.pick(donationStatuses),
      providerTxnId: `txn_${Math.random().toString(36).slice(2, 10)}`,
      createdAt: daysAgo(rng.int(0, 90)),
      receiptSent: rng.bool(0.9),
      anonymous: rng.bool(0.12),
      dedicatedTo: rng.bool(0.15) ? 'In honor of Professor Rangan' : undefined,
    } satisfies Donation
  })
})

export const myDonations: Donation[] = [
  { id: 'don_me_1', campaignId: 'camp_001', donorId: currentPerson.id, amount: 500, currency: 'USD', recurring: true, frequency: 'Monthly', status: 'captured', providerTxnId: 'txn_me001', createdAt: daysAgo(45), receiptSent: true, anonymous: false },
  { id: 'don_me_2', campaignId: 'camp_003', donorId: currentPerson.id, amount: 250, currency: 'USD', recurring: false, status: 'captured', providerTxnId: 'txn_me002', createdAt: daysAgo(5), receiptSent: true, anonymous: false },
]

export function campaignById(id: string) {
  return campaigns.find((c) => c.id === id)
}

export function donationsForCampaign(id: string) {
  return donations.filter((d) => d.campaignId === id)
}

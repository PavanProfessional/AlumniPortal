import type { JobPosting, JobApplication, JobLifecycle } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo, daysFromNow } from '../utils/dates'
import { companies, cities, skillsPool } from './reference'
import { allPeople, currentPerson } from './people'

const rng = makeRng(4004)

interface JobSeed { title: string; type: JobPosting['employmentType']; remote: JobPosting['remoteMode']; status: JobLifecycle; experience: string }

const seeds: JobSeed[] = [
  { title: 'Senior Backend Engineer', type: 'Full-time', remote: 'Remote', status: 'published', experience: '5-8 years' },
  { title: 'Product Designer', type: 'Full-time', remote: 'Hybrid', status: 'published', experience: '3-5 years' },
  { title: 'Data Analyst Intern', type: 'Internship', remote: 'On-site', status: 'published', experience: '0-1 years' },
  { title: 'Engineering Manager, Platform', type: 'Full-time', remote: 'Hybrid', status: 'published', experience: '8-12 years' },
  { title: 'Growth Marketing Lead', type: 'Full-time', remote: 'Remote', status: 'published', experience: '4-7 years' },
  { title: 'Investment Banking Analyst', type: 'Full-time', remote: 'On-site', status: 'pending_review', experience: '0-2 years' },
  { title: 'Freelance UX Researcher', type: 'Contract', remote: 'Remote', status: 'published', experience: '3+ years' },
  { title: 'Solutions Architect', type: 'Full-time', remote: 'Hybrid', status: 'paused', experience: '6-9 years' },
  { title: 'Summer Software Engineering Intern', type: 'Internship', remote: 'On-site', status: 'published', experience: 'Students only' },
  { title: 'VP of Sales', type: 'Full-time', remote: 'On-site', status: 'draft', experience: '10+ years' },
  { title: 'DevOps Engineer', type: 'Full-time', remote: 'Remote', status: 'published', experience: '3-6 years' },
  { title: 'Community & Events Coordinator', type: 'Part-time', remote: 'Hybrid', status: 'published', experience: '1-3 years' },
  { title: 'ML Research Engineer', type: 'Full-time', remote: 'Hybrid', status: 'published', experience: '2-5 years' },
  { title: 'Corporate Development Associate', type: 'Full-time', remote: 'On-site', status: 'closed', experience: '2-4 years' },
  { title: 'Alumni Startup — Founding Engineer', type: 'Full-time', remote: 'Remote', status: 'published', experience: '4+ years, early-stage comfort' },
  { title: 'Financial Planning Analyst', type: 'Full-time', remote: 'Hybrid', status: 'published', experience: '2-4 years' },
  { title: 'Nonprofit Program Manager', type: 'Full-time', remote: 'On-site', status: 'published', experience: '5+ years' },
  { title: 'Referral Project — API Integration', type: 'Project', remote: 'Remote', status: 'published', experience: 'Any' },
]

export const jobs: JobPosting[] = seeds.map((s, idx) => {
  const id = `job_${String(idx + 1).padStart(3, '0')}`
  const company = rng.pick(companies)
  const poster = rng.pick(allPeople)
  return {
    id,
    title: s.title,
    employer: company.name,
    employerLogo: company.initials,
    location: rng.pick(cities),
    remoteMode: s.remote,
    employmentType: s.type,
    experience: s.experience,
    skills: rng.pickMany(skillsPool, rng.int(3, 6)),
    salaryVisible: rng.bool(0.55),
    salaryRange: rng.bool(0.55) ? `$${rng.int(70, 190)}k – $${rng.int(190, 260)}k` : undefined,
    status: s.status,
    postedById: poster.id,
    postedAt: daysAgo(rng.int(1, 50)),
    expiresAt: daysFromNow(rng.int(5, 60)),
    applicantCount: rng.int(0, 84),
    viewCount: rng.int(20, 1400),
    referralAllowed: rng.bool(0.7),
    description: `${company.name} is looking for a ${s.title.toLowerCase()} to join a growing team. This opportunity was shared through the KLE Tech alumni network and prioritizes referrals from verified alumni.`,
  }
})

const appStatuses: JobApplication['status'][] = ['submitted', 'under_review', 'shortlisted', 'interview', 'offer', 'rejected', 'withdrawn']
const matchReasonsPool = ['Skills overlap', 'Same industry background', 'Alumni referral available', 'Location match', 'Similar past role', 'Program alignment']

export const applications: JobApplication[] = jobs.flatMap((job) => {
  const count = Math.min(job.applicantCount, 14)
  const applicants = rng.pickMany(allPeople, count)
  return applicants.map((a, i) => ({
    id: `apl_${job.id}_${i}`,
    jobId: job.id,
    applicantId: a.id,
    status: rng.pick(appStatuses),
    appliedAt: daysAgo(rng.int(1, 40)),
    referredById: rng.bool(0.3) ? rng.pick(allPeople).id : undefined,
    matchScore: rng.int(52, 98),
    matchReasons: rng.pickMany(matchReasonsPool, rng.int(1, 3)),
  }))
})

export const myApplications: JobApplication[] = [
  { id: 'apl_me_1', jobId: 'job_002', applicantId: currentPerson.id, status: 'interview', appliedAt: daysAgo(9), matchScore: 91, matchReasons: ['Skills overlap', 'Similar past role'] },
  { id: 'apl_me_2', jobId: 'job_005', applicantId: currentPerson.id, status: 'under_review', appliedAt: daysAgo(3), matchScore: 84, matchReasons: ['Program alignment'] },
]

export const savedJobIds = ['job_001', 'job_004', 'job_011', 'job_013']

export function jobById(id: string) {
  return jobs.find((j) => j.id === id)
}

export function applicationsForJob(id: string) {
  return applications.filter((a) => a.jobId === id)
}

import type { UserRoleContext } from '../types'
import { currentTenant, tenants } from '../data/tenants'
import { safeAlumniRecords, type SafeAlumniRecord } from '../data/alumniSource'
import { events } from '../data/events'
import { jobs } from '../data/careers'
import { mentorships, mentors } from '../data/mentorship'
import { campaigns, donations } from '../data/fundraising'
import { communities } from '../data/communities'
import { supportTickets } from '../data/support'
import { formatCompact, formatCurrency } from './format'
import { formatDate, NOW } from './dates'

// ---- Alumnus-specific lookups (name, batch, company, occupation, education, hometown) ----

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function distinctValues(field: 'workingPlace' | 'occupation' | 'education' | 'nativePlace'): string[] {
  return [...new Set(safeAlumniRecords.map((r) => r[field]?.trim()).filter((v): v is string => Boolean(v)))]
    .sort((a, b) => b.length - a.length)
}

const workingPlaces = distinctValues('workingPlace')
const occupations = distinctValues('occupation')
const educations = distinctValues('education')
const nativePlaces = distinctValues('nativePlace')

function formatAlumnusLine(r: SafeAlumniRecord): string {
  const role = [r.occupation, r.workingPlace ? `at ${r.workingPlace}` : ''].filter(Boolean).join(' ')
  return `${r.name} (${r.batch || r.passoutYear || 'batch unknown'})${role ? ` — ${role}` : ''}`
}

function alumnusProfileAnswer(r: SafeAlumniRecord): string {
  const parts: string[] = [
    `${r.name} is a KLE Tech alumnus${r.batch ? `, Batch of ${r.batch}` : r.passoutYear ? `, passed out in ${r.passoutYear}` : ''}.`,
  ]
  if (r.occupation) parts.push(`They work as ${r.occupation}${r.workingPlace ? ` at ${r.workingPlace}` : ''}.`)
  else if (r.workingPlace) parts.push(`Currently at ${r.workingPlace}.`)
  if (r.education) parts.push(`Education: ${r.education}.`)
  if (r.nativePlace) parts.push(`From ${r.nativePlace}.`)
  parts.push('Open their card in the Directory for contact details and LinkedIn.')
  return parts.join(' ')
}

function findByName(nq: string): SafeAlumniRecord[] {
  const fullMatches = safeAlumniRecords.filter((r) => r.name && nq.includes(normalize(r.name)))
  if (fullMatches.length) return [fullMatches.sort((a, b) => b.name.length - a.name.length)[0]]

  const words = new Set(nq.split(' '))
  return safeAlumniRecords.filter((r) => r.firstName && words.has(normalize(r.firstName)))
}

function findBatchYear(nq: string): number | null {
  const years = nq.match(/\b(19|20)\d{2}\b/g)
  if (!years) return null
  for (const y of years) {
    const year = Number(y)
    if (safeAlumniRecords.some((r) => r.graduationYear === year || r.batch.includes(y))) return year
  }
  return null
}

function findFieldMatch(nq: string, values: string[]): string | null {
  const hit = values.find((v) => v.length >= 3 && nq.includes(normalize(v)))
  return hit ? normalize(hit) : null
}

/** High-confidence lookups (a specific person or batch) — safe to check before generic topics. */
function alumnusLookupSpecific(rawQuery: string): string | null {
  const nq = normalize(rawQuery)
  if (!nq) return null

  const byName = findByName(nq)
  if (byName.length === 1) return alumnusProfileAnswer(byName[0])
  if (byName.length > 1) {
    return `I found ${byName.length} alumni with that first name: ${byName.slice(0, 5).map(formatAlumnusLine).join('; ')}. Ask me with their full name for details.`
  }

  const year = findBatchYear(nq)
  if (year !== null) {
    const matches = safeAlumniRecords.filter((r) => r.graduationYear === year || r.batch.includes(String(year)))
    if (matches.length) {
      const sample = matches.slice(0, 5).map((r) => r.name).join(', ')
      return `${matches.length} alumni are from the ${year} batch, including ${sample}${matches.length > 5 ? ', and more' : ''}. Open the Directory and filter by batch to see everyone.`
    }
  }
  return null
}

/** Broader field search (company, occupation, education, hometown) — tried as a fallback after generic topics. */
function alumnusLookupBroad(rawQuery: string): string | null {
  const nq = normalize(rawQuery)
  if (!nq) return null

  const company = findFieldMatch(nq, workingPlaces)
  if (company) {
    const matches = safeAlumniRecords.filter((r) => normalize(r.workingPlace) === company)
    const sample = matches.slice(0, 5).map((r) => r.name).join(', ')
    return `${matches.length} alumni currently work at ${matches[0]?.workingPlace ?? company}: ${sample}${matches.length > 5 ? ', and more' : ''}.`
  }

  const occupation = findFieldMatch(nq, occupations)
  if (occupation) {
    const matches = safeAlumniRecords.filter((r) => normalize(r.occupation) === occupation)
    const sample = matches.slice(0, 5).map((r) => r.name).join(', ')
    return `${matches.length} alumni work as ${matches[0]?.occupation ?? occupation}: ${sample}${matches.length > 5 ? ', and more' : ''}.`
  }

  const education = findFieldMatch(nq, educations)
  if (education) {
    const matches = safeAlumniRecords.filter((r) => normalize(r.education) === education)
    const sample = matches.slice(0, 5).map((r) => r.name).join(', ')
    return `${matches.length} alumni studied ${matches[0]?.education ?? education}: ${sample}${matches.length > 5 ? ', and more' : ''}.`
  }

  const place = findFieldMatch(nq, nativePlaces)
  if (place) {
    const matches = safeAlumniRecords.filter((r) => normalize(r.nativePlace) === place)
    const sample = matches.slice(0, 5).map((r) => r.name).join(', ')
    return `${matches.length} alumni are originally from ${matches[0]?.nativePlace ?? place}: ${sample}${matches.length > 5 ? ', and more' : ''}.`
  }

  return null
}

interface Intent {
  keywords: string[]
  workspaces?: UserRoleContext[]
  answer: (workspace: UserRoleContext) => string
}

const upcomingEvents = () => events.filter((e) => new Date(e.startAt).getTime() >= NOW.getTime() && e.status !== 'cancelled')
const openJobs = () => jobs.filter((j) => j.status === 'published')
const activeCampaigns = () => campaigns.filter((c) => c.status === 'active')
const activeMentorships = () => mentorships.filter((m) => m.status === 'active')

const intents: Intent[] = [
  {
    keywords: ['how many alumni', 'alumni count', 'total alumni', 'member count', 'how many members'],
    answer: () => `${currentTenant.displayName} has ${formatCompact(safeAlumniRecords.length)} alumni records loaded, out of ${formatCompact(currentTenant.memberCount)} total members on the tenant.`,
  },
  {
    keywords: ['find an alumnus', 'find alumnus', 'look up alumnus', 'look up an alumnus', 'search for alumnus'],
    answer: () => {
      const example = safeAlumniRecords[Math.floor(safeAlumniRecords.length / 2)]
      return `Ask me by name, batch, company or hometown — for example: "Tell me about ${example?.name}"${example?.graduationYear ? `, "Who graduated in ${example.graduationYear}"` : ''}${example?.workingPlace ? `, or "Who works at ${example.workingPlace}"` : ''}.`
    },
  },
  {
    keywords: ['directory', 'find alumni', 'search alumni'],
    workspaces: ['member', 'admin'],
    answer: (ws) => `The Directory lists all ${formatCompact(safeAlumniRecords.length)} alumni with batch, occupation and contact details. Open it from the sidebar under "${ws === 'admin' ? 'Alumni' : 'My Network'}".`,
  },
  {
    keywords: ['event', 'events'],
    workspaces: ['member', 'admin'],
    answer: () => {
      const up = upcomingEvents()
      if (!up.length) return 'There are no upcoming events scheduled right now.'
      const next = up[0]
      return `There are ${up.length} upcoming event${up.length === 1 ? '' : 's'}. The next one is "${next.title}" on ${formatDate(next.startAt)}, with ${next.registeredCount}/${next.capacity} registered.`
    },
  },
  {
    keywords: ['job', 'career', 'opening', 'hiring'],
    workspaces: ['member', 'admin'],
    answer: () => {
      const open = openJobs()
      return `There are ${open.length} open job posting${open.length === 1 ? '' : 's'} on the Careers board right now, out of ${jobs.length} total postings.`
    },
  },
  {
    keywords: ['mentor', 'mentorship', 'mentoring'],
    workspaces: ['member', 'admin'],
    answer: () => {
      const active = activeMentorships()
      return `${mentors.length} alumni are registered as mentors, with ${active.length} active mentorship pairing${active.length === 1 ? '' : 's'} in progress.`
    },
  },
  {
    keywords: ['donation', 'giving', 'fundrais', 'campaign'],
    workspaces: ['member', 'admin'],
    answer: () => {
      const active = activeCampaigns()
      const raised = campaigns.reduce((s, c) => s + c.raised, 0)
      return `${active.length} fundraising campaign${active.length === 1 ? '' : 's'} ${active.length === 1 ? 'is' : 'are'} active, with ${formatCurrency(raised)} raised across ${donations.length} donations to date.`
    },
  },
  {
    keywords: ['community', 'communities', 'group'],
    workspaces: ['member', 'admin'],
    answer: () => `There are ${communities.length} communities on the platform, covering ${communities.reduce((s, c) => s + c.memberCount, 0).toLocaleString()} total memberships.`,
  },
  {
    keywords: ['dashboard', 'widget', 'insight', 'analytic'],
    workspaces: ['admin'],
    answer: () => 'The Admin dashboard is fully customizable — use the sidebar to switch dashboards, or the "+" action to create a new one and add widgets with your own filters, grouping and timescale.',
  },
  {
    keywords: ['import', 'upload', 'data quality', 'csv'],
    workspaces: ['admin'],
    answer: () => 'Go to Alumni → Imports & Data Quality to upload a CSV or JSON file — it will be parsed and analysed for duplicates, missing emails and invalid rows before you confirm the import.',
  },
  {
    keywords: ['ticket', 'support'],
    workspaces: ['admin', 'superadmin'],
    answer: () => {
      const open = supportTickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed')
      return `There ${open.length === 1 ? 'is' : 'are'} ${open.length} open support ticket${open.length === 1 ? '' : 's'} out of ${supportTickets.length} total.`
    },
  },
  {
    keywords: ['tenant', 'institution', 'customer'],
    workspaces: ['superadmin'],
    answer: () => {
      const active = tenants.filter((t) => t.status === 'active').length
      return `The platform has ${tenants.length} registered tenants — ${active} active. Total MRR across all tenants is ${formatCurrency(tenants.reduce((s, t) => s + t.mrr, 0))}.`
    },
  },
  {
    keywords: ['license', 'licence', 'seat'],
    workspaces: ['superadmin'],
    answer: () => {
      const adminEnabled = tenants.filter((t) => t.adminCount > 0).length
      return `Open Commercial → License to see every tenant's license key, seat usage and expiry. ${adminEnabled} of ${tenants.length} tenants currently have admin access enabled.`
    },
  },
  {
    keywords: ['billing', 'mrr', 'revenue', 'plan'],
    workspaces: ['superadmin'],
    answer: () => `Total MRR is ${formatCurrency(tenants.reduce((s, t) => s + t.mrr, 0))} across ${tenants.length} tenants. See Commercial → Billing & Plans for the full breakdown.`,
  },
  {
    keywords: ['feature flag', 'flag'],
    workspaces: ['superadmin'],
    answer: () => 'Feature flags for every tenant can be toggled from Platform → Feature Flags.',
  },
  {
    keywords: ['health', 'uptime', 'status', 'incident'],
    workspaces: ['superadmin'],
    answer: () => 'System Health shows live uptime, error rate and incident history for the platform — find it under Support in the sidebar.',
  },
  {
    keywords: ['career guidance'],
    answer: () => 'Career Guidance opens an external counselling tool in a new tab — you\'ll find it under Opportunities in the sidebar.',
  },
  {
    keywords: ['who am i', 'my profile', 'my account'],
    answer: (ws) => `You're signed in to the ${ws === 'admin' ? 'Institution Admin' : ws === 'superadmin' ? 'Platform Super Admin' : 'Alumni Member'} workspace for ${currentTenant.displayName}. Use the workspace switcher at the top of the sidebar to change views.`,
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    answer: () => 'Hi! Ask me about alumni, events, careers, mentorship, giving, dashboards, tenants or licenses — or ask about a specific alumnus by name, batch, company or hometown — and I\'ll pull the live numbers for you.',
  },
  {
    keywords: ['help', 'what can you do'],
    answer: (ws) => {
      const base = ws === 'superadmin'
        ? 'I can answer questions about tenants, licenses, billing, feature flags and platform health.'
        : ws === 'admin'
        ? 'I can answer questions about members, imports, dashboards, events, careers, mentorship, giving and support tickets.'
        : 'I can answer questions about the alumni directory, events, careers, mentorship, giving and communities.'
      return `${base} I can also look up individual alumni — try asking by name (e.g. "Tell me about Veerendra Kamble"), by batch year, by company ("who works at Infosys"), or by hometown.`
    },
  },
]

export function assistantWorkspaceGreeting(workspace: UserRoleContext) {
  if (workspace === 'superadmin') return `Ask me about tenants, licenses, billing or platform health for ${currentTenant.displayName} and beyond.`
  if (workspace === 'admin') return `Ask me about members, imports, dashboards, events, fundraising — or a specific alumnus — for ${currentTenant.displayName}.`
  return `Ask me about alumni, events, careers, mentorship, giving — or a specific alumnus — at ${currentTenant.displayName}.`
}

export function answerQuestion(question: string, workspace: UserRoleContext): string {
  const q = question.toLowerCase().trim()
  if (!q) return 'Ask me anything about this workspace — alumni, events, careers, mentorship, giving and more.'

  // A specific person or batch is unambiguous — check it before generic topics.
  const specificAlumnus = alumnusLookupSpecific(q)
  if (specificAlumnus) return specificAlumnus

  const match = intents.find((intent) => {
    if (intent.workspaces && !intent.workspaces.includes(workspace)) return false
    return intent.keywords.some((kw) => q.includes(kw))
  })
  if (match) return match.answer(workspace)

  const genericMatch = intents.find((intent) => intent.keywords.some((kw) => q.includes(kw)))
  if (genericMatch) {
    return `That lives in a different workspace. Switch to ${genericMatch.workspaces?.[0] === 'superadmin' ? 'Platform Console' : genericMatch.workspaces?.[0] === 'admin' ? 'Admin Console' : 'Member Portal'} using the workspace switcher to see it.`
  }

  // Broader alumnus field search (company, occupation, education, hometown) as a last resort.
  const broadAlumnus = alumnusLookupBroad(q)
  if (broadAlumnus) return broadAlumnus

  return `I couldn't find a direct match for that. Try asking about alumni (by name, batch, company or hometown), events, careers, mentorship, giving${workspace !== 'member' ? ', dashboards' : ''}${workspace === 'superadmin' ? ', tenants or licenses' : ''}.`
}

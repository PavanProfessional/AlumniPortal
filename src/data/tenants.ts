import type { Tenant } from '../types'
import { daysAgo, daysFromNow } from '../utils/dates'

export const currentTenant: Tenant = {
  id: 't_kletech',
  legalName: 'KLE Technological University',
  displayName: 'KLE Technological University',
  slug: 'kletech',
  institutionType: 'University',
  domains: ['alumni.kletech.ac.in'],
  logoInitials: 'KT',
  logoImageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQgVzrUaPtWiUJhWGfJJGOFGeUWuhkajkowDjKaTxK4NDnpZINgIRUzbTQ&s=10',
  brandColor: '#c1272d',
  timezone: 'Asia/Kolkata',
  locale: 'en-IN',
  currency: 'INR',
  status: 'active',
  plan: 'enterprise',
  memberCount: 24186,
  adminCount: 34,
  storageUsedGb: 412,
  storageLimitGb: 1000,
  mrr: 18500,
  createdAt: daysAgo(1180),
  csm: 'Grace Hall',
  region: 'IN',
  featureFlags: ['mentoring', 'fundraising', 'careers', 'communities', 'sso', 'scim', 'custom-domain', 'advanced-analytics'],
  healthScore: 92,
}

export const tenants: Tenant[] = [
  currentTenant,
  { id: 't_riverside', legalName: 'Riverside College', displayName: 'Riverside College', slug: 'riverside', institutionType: 'College', domains: ['alumni.riverside.edu'], logoInitials: 'RC', brandColor: '#23ae80', timezone: 'America/Chicago', locale: 'en-US', currency: 'USD', status: 'active', plan: 'growth', memberCount: 8420, adminCount: 12, storageUsedGb: 140, storageLimitGb: 250, mrr: 4200, createdAt: daysAgo(760), csm: 'Marcus Boyd', region: 'US', featureFlags: ['mentoring', 'careers', 'communities'], healthScore: 78 },
  { id: 't_ashfield', legalName: 'Ashfield Institute of Technology', displayName: 'Ashfield Tech', slug: 'ashfield', institutionType: 'Professional Institute', domains: ['alumni.ashfieldtech.ac.in'], logoInitials: 'AT', brandColor: '#e6a23c', timezone: 'Asia/Kolkata', locale: 'en-IN', currency: 'INR', status: 'trial', plan: 'core', memberCount: 2130, adminCount: 4, storageUsedGb: 22, storageLimitGb: 50, mrr: 0, createdAt: daysAgo(18), trialEndsAt: daysFromNow(12), csm: 'Grace Hall', region: 'IN', featureFlags: [], healthScore: 61 },
  { id: 't_lakeside', legalName: 'Lakeside School District Alumni Foundation', displayName: 'Lakeside Alumni Foundation', slug: 'lakeside', institutionType: 'Non-profit/Association', domains: ['giving.lakesidealumni.org'], logoInitials: 'LA', brandColor: '#e6595f', timezone: 'America/New_York', locale: 'en-US', currency: 'USD', status: 'active', plan: 'growth', memberCount: 5310, adminCount: 6, storageUsedGb: 61, storageLimitGb: 250, mrr: 2600, createdAt: daysAgo(540), csm: 'Marcus Boyd', region: 'US', featureFlags: ['fundraising', 'communities'], healthScore: 84 },
  { id: 't_solworth', legalName: 'Solworth Business School', displayName: 'Solworth Business School', slug: 'solworth', institutionType: 'College', domains: ['alumni.solworth.edu'], logoInitials: 'SB', brandColor: '#3f9bdc', timezone: 'Europe/London', locale: 'en-GB', currency: 'GBP', status: 'suspended', plan: 'core', memberCount: 3640, adminCount: 5, storageUsedGb: 38, storageLimitGb: 50, mrr: 0, createdAt: daysAgo(910), csm: 'Priya Anand', region: 'EU', featureFlags: [], healthScore: 22 },
  { id: 't_veridian', legalName: 'Veridian Global Academy', displayName: 'Veridian Global Academy', slug: 'veridian', institutionType: 'School', domains: ['alumni.veridian.edu.sg'], logoInitials: 'VG', brandColor: '#c95bd8', timezone: 'Asia/Singapore', locale: 'en-SG', currency: 'SGD', status: 'active', plan: 'enterprise', memberCount: 11940, adminCount: 18, storageUsedGb: 205, storageLimitGb: 500, mrr: 9800, createdAt: daysAgo(1420), csm: 'Priya Anand', region: 'APAC', featureFlags: ['mentoring', 'fundraising', 'careers', 'communities', 'sso'], healthScore: 88 },
  { id: 't_harbourline', legalName: 'Harbourline Corporate University', displayName: 'Harbourline Corporate University', slug: 'harbourline', institutionType: 'Corporate Alumni Network', domains: ['alumni.harbourline.com'], logoInitials: 'HC', brandColor: '#2fb6a7', timezone: 'America/New_York', locale: 'en-US', currency: 'USD', status: 'archived', plan: 'core', memberCount: 940, adminCount: 2, storageUsedGb: 9, storageLimitGb: 50, mrr: 0, createdAt: daysAgo(1900), csm: 'Grace Hall', region: 'US', featureFlags: [], healthScore: 10 },
]

export function tenantById(id: string) {
  return tenants.find((t) => t.id === id)
}

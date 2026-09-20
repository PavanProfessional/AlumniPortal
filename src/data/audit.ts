import type { AuditEvent } from '../types'
import { makeRng } from '../utils/random'
import { hoursAgo, daysAgo } from '../utils/dates'
import { allPeople } from './people'

const rng = makeRng(8008)

interface AuditSeed { action: string; resource: string; category: AuditEvent['category']; outcome: AuditEvent['outcome'] }

const seeds: AuditSeed[] = [
  { action: 'role.permission.updated', resource: 'Role: Event Manager', category: 'security', outcome: 'success' },
  { action: 'member.exported', resource: 'Directory export (2,481 rows)', category: 'export', outcome: 'success' },
  { action: 'member.bulk_updated', resource: 'Tag added: "high-engagement"', category: 'data', outcome: 'success' },
  { action: 'auth.login.failed', resource: 'Login attempt', category: 'security', outcome: 'failure' },
  { action: 'consent.updated', resource: 'Profile visibility changed', category: 'data', outcome: 'success' },
  { action: 'donation.refunded', resource: 'Donation don_camp_003_4', category: 'billing', outcome: 'success' },
  { action: 'integration.connected', resource: 'Workday SIS connector', category: 'config', outcome: 'success' },
  { action: 'user.impersonation.started', resource: 'Support session for tenant t_riverside', category: 'security', outcome: 'success' },
  { action: 'event.published', resource: 'Event: Bay Area Alumni Networking Night', category: 'data', outcome: 'success' },
  { action: 'campaign.sent', resource: 'Campaign: Fall Newsletter', category: 'data', outcome: 'success' },
  { action: 'admin.role.assigned', resource: 'Assigned Content Editor to Tara Wilson', category: 'security', outcome: 'success' },
  { action: 'auth.mfa.enforced', resource: 'MFA policy updated for privileged roles', category: 'security', outcome: 'success' },
  { action: 'data.deletion_request.completed', resource: 'Person p_0042 anonymized', category: 'data', outcome: 'success' },
  { action: 'webhook.delivery.failed', resource: 'member.updated → CRM endpoint', category: 'config', outcome: 'failure' },
  { action: 'billing.plan.changed', resource: 'Tenant plan upgraded to Enterprise', category: 'billing', outcome: 'success' },
  { action: 'access.denied', resource: 'Cross-tenant read attempt blocked', category: 'access', outcome: 'failure' },
  { action: 'import.batch.committed', resource: 'Import batch imp_2026_08_21 (1,204 rows)', category: 'data', outcome: 'success' },
  { action: 'content.published', resource: 'Page: Welcome to the New Alumni Portal', category: 'data', outcome: 'success' },
]

export const auditEvents: AuditEvent[] = seeds.map((s, idx) => {
  const actor = rng.pick(allPeople)
  return {
    id: `aud_${String(idx + 1).padStart(3, '0')}`,
    actor: `${actor.firstName} ${actor.lastName}`,
    actorRole: rng.pick(['Organisation Admin', 'Alumni Relations Officer', 'Organisation Owner', 'Event Manager', 'System']),
    action: s.action,
    resource: s.resource,
    resourceId: `res_${rng.int(1000, 9999)}`,
    outcome: s.outcome,
    ip: `10.${rng.int(0, 255)}.${rng.int(0, 255)}.${rng.int(0, 255)}`,
    timestamp: idx < 4 ? hoursAgo(rng.int(1, 30)) : daysAgo(rng.int(1, 60)),
    category: s.category,
    details: s.outcome === 'failure' ? 'Blocked by policy — see security runbook.' : undefined,
  }
}).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))

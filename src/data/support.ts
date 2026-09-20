import type { SupportTicket, ImportBatch, DataQualitySnapshot } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo } from '../utils/dates'
import { tenants } from './tenants'

const rng = makeRng(1111)

const subjects = [
  'SSO login failing for admin group', 'Unable to export directory to CSV', 'Duplicate alumni records after import',
  'Feature request: bulk tag removal', 'Billing invoice discrepancy for August', 'Webhook retries exhausted for CRM sync',
  'Need help configuring approval workflow', 'Custom domain SSL certificate renewal', 'Question about data residency options',
  'Event check-in QR codes not scanning', 'Request to increase API rate limit', 'Donor report showing incorrect totals',
]

export const supportTickets: SupportTicket[] = subjects.map((s, idx) => {
  const tenant = rng.pick(tenants)
  const status = rng.pick(['new', 'assigned', 'in_progress', 'waiting_customer', 'resolved', 'closed'] as const)
  return {
    id: `tk_${String(idx + 1).padStart(4, '0')}`,
    tenantId: tenant.id,
    subject: s,
    tier: rng.pick(['Tier 1', 'Tier 2', 'Tier 3', 'Critical'] as const),
    status,
    requester: `${tenant.displayName} Admin`,
    assignee: ['new'].includes(status) ? undefined : rng.pick(['Grace Hall', 'Marcus Boyd', 'Priya Anand', 'Dev Support Team']),
    createdAt: daysAgo(rng.int(0, 30)),
    updatedAt: daysAgo(rng.int(0, 5)),
    priority: rng.pick(['Low', 'Medium', 'High', 'Urgent'] as const),
  }
})

export const importBatches: ImportBatch[] = [
  { id: 'imp_1', fileName: 'kletech_alumni_2026_08_21.csv', source: 'CSV', status: 'completed', totalRows: 1204, validRows: 1148, invalidRows: 32, duplicateRows: 24, uploadedAt: daysAgo(8), uploadedBy: 'Ananya Sharma', mappingTemplate: 'Standard Alumni Import v3' },
  { id: 'imp_2', fileName: 'sis_export_batch_07.xlsx', source: 'XLSX', status: 'completed', totalRows: 3980, validRows: 3820, invalidRows: 88, duplicateRows: 72, uploadedAt: daysAgo(40), uploadedBy: 'Kabir Nair', mappingTemplate: 'SIS Extract Mapping' },
  { id: 'imp_3', fileName: 'legacy_alumni_db_final.csv', source: 'Legacy Export', status: 'processing', totalRows: 6210, validRows: 5602, invalidRows: 340, duplicateRows: 268, uploadedAt: daysAgo(0), uploadedBy: 'Pavan Kumar', mappingTemplate: 'Legacy Migration Template' },
  { id: 'imp_4', fileName: 'careers_office_contacts.xlsx', source: 'XLSX', status: 'failed', totalRows: 410, validRows: 0, invalidRows: 410, duplicateRows: 0, uploadedAt: daysAgo(15), uploadedBy: 'Rahul Gupta', mappingTemplate: 'Standard Alumni Import v3' },
  { id: 'imp_5', fileName: 'donor_crm_sync.csv', source: 'API', status: 'ready', totalRows: 890, validRows: 872, invalidRows: 18, duplicateRows: 6, uploadedAt: daysAgo(1), uploadedBy: 'System (Salesforce sync)', mappingTemplate: 'CRM Donor Mapping' },
]

export const dataQuality: DataQualitySnapshot = {
  completeness: 78,
  validity: 91,
  uniqueness: 96,
  freshness: 68,
  reachability: 83,
  duplicateRecords: 214,
  missingEmail: 340,
  staleRecords: 1820,
}

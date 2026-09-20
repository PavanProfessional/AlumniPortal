import type { IntegrationConnector, WebhookDelivery } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo, hoursAgo } from '../utils/dates'

const rng = makeRng(9009)

export const integrations: IntegrationConnector[] = [
  { id: 'int_1', name: 'Workday SIS', category: 'SIS', status: 'connected', logoInitials: 'WD', syncMode: 'Scheduled', lastSyncAt: hoursAgo(4), recordsSynced: 21482, description: 'Nightly sync of student and alumni records from the student information system.' },
  { id: 'int_2', name: 'Salesforce', category: 'CRM', status: 'connected', logoInitials: 'SF', syncMode: 'Bidirectional', lastSyncAt: hoursAgo(1), recordsSynced: 18320, description: 'Syncs donor and prospect records for advancement office use.' },
  { id: 'int_3', name: 'Okta', category: 'Identity', status: 'connected', logoInitials: 'OK', syncMode: 'Scheduled', lastSyncAt: hoursAgo(2), recordsSynced: 640, description: 'SSO/SCIM provisioning for institution administrators.' },
  { id: 'int_4', name: 'SendGrid', category: 'Email', status: 'connected', logoInitials: 'SG', syncMode: 'One-way export', lastSyncAt: hoursAgo(1), recordsSynced: 94210, description: 'Transactional and campaign email delivery provider.' },
  { id: 'int_5', name: 'Twilio', category: 'SMS', status: 'connected', logoInitials: 'TW', syncMode: 'One-way export', lastSyncAt: daysAgo(1), recordsSynced: 8410, description: 'SMS and WhatsApp delivery for event reminders and OTP.' },
  { id: 'int_6', name: 'Stripe', category: 'Payments', status: 'connected', logoInitials: 'ST', syncMode: 'Bidirectional', lastSyncAt: hoursAgo(1), recordsSynced: 4218, description: 'Donation and ticketing payment processing.' },
  { id: 'int_7', name: 'Google Calendar', category: 'Calendar', status: 'connected', logoInitials: 'GC', syncMode: 'Bidirectional', lastSyncAt: hoursAgo(6), recordsSynced: 1204, description: 'Two-way sync of event schedules with admin calendars.' },
  { id: 'int_8', name: 'Zoom', category: 'Video', status: 'connected', logoInitials: 'ZM', syncMode: 'One-way export', lastSyncAt: daysAgo(2), recordsSynced: 312, description: 'Auto-creates meeting links for virtual and hybrid events.' },
  { id: 'int_9', name: 'NetSuite', category: 'Accounting', status: 'error', logoInitials: 'NS', syncMode: 'Scheduled', lastSyncAt: daysAgo(3), recordsSynced: 990, description: 'Donation reconciliation sync — currently failing on auth token refresh.' },
  { id: 'int_10', name: 'Snowflake', category: 'Data Warehouse', status: 'not_configured', logoInitials: 'SN', syncMode: 'Scheduled', recordsSynced: 0, description: 'Analytics warehouse connector for advanced BI — not yet configured.' },
  { id: 'int_11', name: 'Canvas LMS', category: 'LMS', status: 'disconnected', logoInitials: 'CV', syncMode: 'One-way import', lastSyncAt: daysAgo(40), recordsSynced: 3021, description: 'Was used during pilot phase for course/program taxonomy import.' },
  { id: 'int_12', name: 'SAP', category: 'ERP', status: 'not_configured', logoInitials: 'SP', syncMode: 'Manual', recordsSynced: 0, description: 'Available for enterprise customers with SAP-based student records.' },
]

export const webhookDeliveries: WebhookDelivery[] = Array.from({ length: 14 }).map((_, i) => ({
  id: `wh_${i + 1}`,
  event: rng.pick(['member.created', 'member.updated', 'event.registered', 'event.attended', 'donation.completed', 'job.published']),
  endpoint: rng.pick(['https://hooks.crm.kletech.ac.in/alumnia', 'https://api.datawarehouse.io/ingest', 'https://hooks.slack.com/services/T0.../alumnia']),
  status: rng.pick(['delivered', 'delivered', 'delivered', 'retrying', 'failed']),
  attempt: rng.int(1, 4),
  respondedAt: hoursAgo(rng.int(1, 72)),
  statusCode: rng.pick([200, 200, 200, 429, 500, 503]),
}))

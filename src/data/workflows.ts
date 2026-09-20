import type { WorkflowAutomation, WorkflowExecution } from '../types'
import { makeRng } from '../utils/random'
import { hoursAgo, daysAgo } from '../utils/dates'

const rng = makeRng(1010)

export const workflows: WorkflowAutomation[] = [
  { id: 'wf_1', name: 'Welcome series after verification', trigger: 'Profile verified', description: 'Sends a 3-part welcome email series once a profile becomes institution-verified.', enabled: true, actionsSummary: ['Send campaign: Welcome Series', 'Add tag: onboarded'], runsLast30d: 412, successRate: 99.2, lastRunAt: hoursAgo(2) },
  { id: 'wf_2', name: 'Event reminder — 24 hours before', trigger: 'Scheduled', description: 'Sends a reminder email/SMS 24 hours before any published event to all registered attendees.', enabled: true, actionsSummary: ['Send notification', 'Send SMS if opted in'], runsLast30d: 58, successRate: 100, lastRunAt: hoursAgo(9) },
  { id: 'wf_3', name: 'Incomplete profile nudge', trigger: 'Schedule (weekly)', description: 'If profile completion < 60% after 14 days, sends a reminder to finish onboarding.', enabled: true, actionsSummary: ['Condition: completion < 60%', 'Send notification', 'Add tag: needs-follow-up'], runsLast30d: 210, successRate: 97.6, lastRunAt: daysAgo(3) },
  { id: 'wf_4', name: 'Mentor application routing', trigger: 'Record created', description: 'Routes new mentor applications to the Mentor Coordinator for screening.', enabled: true, actionsSummary: ['Create approval request', 'Assign task: Mentor Coordinator'], runsLast30d: 34, successRate: 100, lastRunAt: daysAgo(1) },
  { id: 'wf_5', name: 'Donation receipt & acknowledgement', trigger: 'Payment status: captured', description: 'Generates a tax receipt and sends a personalized thank-you note after a successful donation.', enabled: true, actionsSummary: ['Call webhook: receipt service', 'Send notification'], runsLast30d: 186, successRate: 99.5, lastRunAt: hoursAgo(5) },
  { id: 'wf_6', name: 'Job posting auto-expiry', trigger: 'Event time', description: 'Automatically moves job postings to closed status after their expiry date.', enabled: true, actionsSummary: ['Change status: closed', 'Notify poster'], runsLast30d: 22, successRate: 100, lastRunAt: daysAgo(2) },
  { id: 'wf_7', name: 'Suspicious login escalation', trigger: 'Engagement threshold', description: 'Flags repeated failed logins from new locations for security review.', enabled: true, actionsSummary: ['Create approval request', 'Notify security'], runsLast30d: 6, successRate: 100, lastRunAt: daysAgo(6) },
  { id: 'wf_8', name: 'Import completion summary', trigger: 'Import completion', description: 'Sends a summary report to the admin who ran an import batch once processing finishes.', enabled: false, actionsSummary: ['Create report', 'Send notification'], runsLast30d: 0, successRate: 0, lastRunAt: daysAgo(45) },
]

export const executions: WorkflowExecution[] = workflows.flatMap((wf) =>
  Array.from({ length: rng.int(2, 4) }).map((_, i) => {
    const status = wf.enabled ? rng.pick(['success', 'success', 'success', 'failed', 'retrying'] as const) : 'failed'
    return {
      id: `exec_${wf.id}_${i}`,
      workflowId: wf.id,
      status,
      startedAt: hoursAgo(rng.int(1, 200)),
      durationMs: rng.int(120, 8400),
      trigger: wf.trigger,
      steps: wf.actionsSummary.map((a) => ({ name: a, status: status === 'failed' && rng.bool(0.4) ? 'failed' : 'success' as const })),
    }
  })
)

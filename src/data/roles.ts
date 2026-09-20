import type { Permission, Role } from '../types'

export const permissionCatalog: Permission[] = [
  { key: 'alumni.profile.view', module: 'Alumni', resource: 'Profile', action: 'view', label: 'View alumni profiles' },
  { key: 'alumni.profile.update', module: 'Alumni', resource: 'Profile', action: 'update', label: 'Edit alumni profiles' },
  { key: 'alumni.directory.export', module: 'Alumni', resource: 'Directory', action: 'export', label: 'Export directory data' },
  { key: 'alumni.profile.import', module: 'Alumni', resource: 'Profile', action: 'import', label: 'Import alumni records' },
  { key: 'events.event.create', module: 'Events', resource: 'Event', action: 'create', label: 'Create events' },
  { key: 'events.event.publish', module: 'Events', resource: 'Event', action: 'publish', label: 'Publish events' },
  { key: 'events.registration.approve', module: 'Events', resource: 'Registration', action: 'approve', label: 'Approve registrations' },
  { key: 'comms.campaign.create', module: 'Communications', resource: 'Campaign', action: 'create', label: 'Create campaigns' },
  { key: 'comms.campaign.publish', module: 'Communications', resource: 'Campaign', action: 'publish', label: 'Send campaigns' },
  { key: 'communities.group.manage', module: 'Communities', resource: 'Group', action: 'manage', label: 'Manage communities' },
  { key: 'communities.post.delete', module: 'Communities', resource: 'Post', action: 'delete', label: 'Remove community posts' },
  { key: 'careers.job.approve', module: 'Careers', resource: 'Job', action: 'approve', label: 'Approve job postings' },
  { key: 'careers.job.manage', module: 'Careers', resource: 'Job', action: 'manage', label: 'Manage job board' },
  { key: 'mentoring.program.manage', module: 'Mentorship', resource: 'Program', action: 'manage', label: 'Manage mentoring programs' },
  { key: 'fundraising.campaign.manage', module: 'Fundraising', resource: 'Campaign', action: 'manage', label: 'Manage fundraising campaigns' },
  { key: 'fundraising.donation.view', module: 'Fundraising', resource: 'Donation', action: 'view', label: 'View donation records' },
  { key: 'content.page.publish', module: 'Content', resource: 'Page', action: 'publish', label: 'Publish content' },
  { key: 'reports.report.export', module: 'Reporting', resource: 'Report', action: 'export', label: 'Export reports' },
  { key: 'admin.role.manage', module: 'Admin', resource: 'Role', action: 'manage', label: 'Manage roles & permissions' },
  { key: 'admin.audit.view', module: 'Admin', resource: 'Audit Log', action: 'view', label: 'View audit log' },
  { key: 'admin.integration.manage', module: 'Admin', resource: 'Integration', action: 'manage', label: 'Manage integrations' },
  { key: 'admin.workflow.manage', module: 'Admin', resource: 'Workflow', action: 'manage', label: 'Manage automations' },
  { key: 'admin.org.manage', module: 'Admin', resource: 'Organisation Settings', action: 'manage', label: 'Manage organisation settings' },
  { key: 'platform.tenant.manage', module: 'Platform', resource: 'Tenant', action: 'manage', label: 'Manage tenants' },
  { key: 'platform.tenant.impersonate', module: 'Platform', resource: 'Tenant', action: 'impersonate', label: 'Impersonate tenant users' },
  { key: 'platform.billing.manage', module: 'Platform', resource: 'Billing', action: 'manage', label: 'Manage billing & plans' },
]

export const roles: Role[] = [
  { id: 'role_super_admin', name: 'Platform Super Admin', description: 'Full access across all tenants for platform operations.', scope: 'platform', isSystem: true, memberCount: 4, permissions: permissionCatalog.map((p) => p.key) },
  { id: 'role_org_owner', name: 'Organisation Owner', description: 'Full administrative control within the tenant.', scope: 'organisation', isSystem: true, memberCount: 2, permissions: permissionCatalog.filter((p) => p.module !== 'Platform').map((p) => p.key) },
  { id: 'role_org_admin', name: 'Organisation Admin', description: 'Manage members, configuration and most modules.', scope: 'organisation', isSystem: true, memberCount: 6, permissions: ['alumni.profile.view', 'alumni.profile.update', 'alumni.directory.export', 'events.event.create', 'events.event.publish', 'comms.campaign.create', 'communities.group.manage', 'careers.job.approve', 'admin.audit.view', 'admin.org.manage'] },
  { id: 'role_alumni_officer', name: 'Alumni Relations Officer', description: 'Owns member data quality, verification and directory.', scope: 'organisation', isSystem: true, memberCount: 5, permissions: ['alumni.profile.view', 'alumni.profile.update', 'alumni.directory.export', 'alumni.profile.import'] },
  { id: 'role_event_manager', name: 'Event Manager', description: 'Creates and manages events end to end.', scope: 'organisation', isSystem: true, memberCount: 4, permissions: ['events.event.create', 'events.event.publish', 'events.registration.approve'] },
  { id: 'role_comms_manager', name: 'Communications Manager', description: 'Builds and sends campaigns and announcements.', scope: 'organisation', isSystem: true, memberCount: 3, permissions: ['comms.campaign.create', 'comms.campaign.publish', 'content.page.publish'] },
  { id: 'role_career_manager', name: 'Career Manager', description: 'Moderates and manages the job board.', scope: 'organisation', isSystem: true, memberCount: 2, permissions: ['careers.job.approve', 'careers.job.manage'] },
  { id: 'role_mentor_coordinator', name: 'Mentor Coordinator', description: 'Runs mentoring cohorts and matching.', scope: 'organisation', isSystem: true, memberCount: 2, permissions: ['mentoring.program.manage'] },
  { id: 'role_fundraising_manager', name: 'Fundraising Manager', description: 'Manages campaigns, donors and reconciliation.', scope: 'organisation', isSystem: true, memberCount: 3, permissions: ['fundraising.campaign.manage', 'fundraising.donation.view'] },
  { id: 'role_finance_viewer', name: 'Finance/Donations Viewer', description: 'Read-only visibility into donation records.', scope: 'organisation', isSystem: true, memberCount: 2, permissions: ['fundraising.donation.view'] },
  { id: 'role_content_editor', name: 'Content Editor', description: 'Authors and edits CMS content, cannot publish.', scope: 'organisation', isSystem: true, memberCount: 4, permissions: ['content.page.publish'] },
  { id: 'role_reporting_analyst', name: 'Reporting Analyst', description: 'Builds and exports analytics reports.', scope: 'organisation', isSystem: true, memberCount: 2, permissions: ['reports.report.export'] },
  { id: 'role_auditor', name: 'Auditor', description: 'Read-only access to audit trails and configuration history.', scope: 'organisation', isSystem: true, memberCount: 1, permissions: ['admin.audit.view'] },
  { id: 'role_readonly_admin', name: 'Read-only Admin', description: 'View-only access across administrative modules.', scope: 'organisation', isSystem: true, memberCount: 3, permissions: ['alumni.profile.view', 'admin.audit.view'] },
  { id: 'role_member', name: 'Alumni/Member', description: 'Standard member access to their own profile and public modules.', scope: 'self', isSystem: true, memberCount: 21482, permissions: ['alumni.profile.view', 'alumni.profile.update'] },
]

export function roleById(id: string) {
  return roles.find((r) => r.id === id)
}

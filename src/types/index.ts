// Core enterprise domain model for the Alumnia platform.
// Mirrors the entities called out across the product skill pack:
// Tenant, User, Person, Membership, Role, Permission, Profile, AcademicRecord,
// Event, Registration, Group, Post, Job, Application, Mentor, Mentorship,
// Campaign, Donation, Content, Notification, Consent, AuditEvent, Integration, Subscription.

export type ID = string

export type TenantStatus = 'trial' | 'active' | 'suspended' | 'archived'
export type PlanTier = 'core' | 'growth' | 'enterprise'

export interface Tenant {
  id: ID
  legalName: string
  displayName: string
  slug: string
  institutionType: 'School' | 'College' | 'University' | 'Professional Institute' | 'Training Academy' | 'Non-profit/Association' | 'Corporate Alumni Network'
  domains: string[]
  logoInitials: string
  /** Uploaded logo image (data URL). When set, takes precedence over logoInitials in the UI. */
  logoImageUrl?: string
  brandColor: string
  timezone: string
  locale: string
  currency: string
  status: TenantStatus
  plan: PlanTier
  memberCount: number
  adminCount: number
  storageUsedGb: number
  storageLimitGb: number
  mrr: number
  createdAt: string
  trialEndsAt?: string
  csm: string
  region: 'US' | 'EU' | 'APAC' | 'IN'
  featureFlags: string[]
  healthScore: number
}

export type VerificationStatus = 'unverified' | 'self-verified' | 'institution-verified' | 'imported' | 'disputed'
export type FieldVisibility = 'private' | 'organisation' | 'alumni' | 'public' | 'custom'

export interface AcademicRecord {
  id: ID
  institution: string
  campus?: string
  faculty?: string
  department: string
  program: string
  degree: string
  batch: string
  graduationYear: number
  studentId: string
  enrollmentStart: string
  enrollmentEnd: string
}

export interface EmploymentRecord {
  id: ID
  company: string
  title: string
  industry: string
  location: string
  startDate: string
  endDate?: string
  current: boolean
}

export interface Person {
  id: ID
  tenantId: ID
  firstName: string
  lastName: string
  avatarColor: string
  headline: string
  email: string
  phone: string
  location: string
  country: string
  bio: string
  academicRecords: AcademicRecord[]
  employment: EmploymentRecord[]
  skills: string[]
  certifications: string[]
  achievements: string[]
  interests: string[]
  socialLinks: { platform: string; url: string }[]
  verification: VerificationStatus
  profileCompletion: number
  engagementScore: number
  tags: string[]
  role: string
  status: 'invited' | 'pending' | 'verified' | 'active' | 'suspended' | 'deactivated'
  consent: {
    marketingEmail: boolean
    sms: boolean
    directoryListed: boolean
    profileVisibility: FieldVisibility
  }
  mentoring: { isMentor: boolean; isMentee: boolean }
  volunteerInterests: string[]
  givingTier?: 'None' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum'
  joinedAt: string
  lastActiveAt: string
}

export interface Role {
  id: ID
  name: string
  description: string
  scope: 'platform' | 'organisation' | 'campus' | 'department' | 'community' | 'self'
  isSystem: boolean
  memberCount: number
  permissions: string[]
}

export interface Permission {
  key: string
  module: string
  resource: string
  action: 'view' | 'create' | 'update' | 'delete' | 'approve' | 'publish' | 'export' | 'import' | 'manage' | 'impersonate'
  label: string
}

export type EventLifecycle = 'draft' | 'review' | 'published' | 'registration_open' | 'registration_closed' | 'live' | 'completed' | 'cancelled'
export type EventType = 'Reunion' | 'Webinar' | 'Workshop' | 'Networking' | 'Campus Event' | 'Career Event' | 'Mentoring Event' | 'Fundraising Event' | 'Sports/Cultural'

export interface EventItem {
  id: ID
  title: string
  type: EventType
  status: EventLifecycle
  description: string
  coverColor: string
  startAt: string
  endAt: string
  mode: 'In-person' | 'Virtual' | 'Hybrid'
  venue?: string
  meetingLink?: string
  capacity: number
  registeredCount: number
  waitlistCount: number
  attendedCount: number
  price: number
  currency: string
  organizer: string
  speakers: { name: string; title: string }[]
  agenda: { time: string; item: string }[]
  tags: string[]
}

export type RegistrationState = 'registered' | 'waitlisted' | 'approved' | 'checked_in' | 'attended' | 'no_show' | 'cancelled'

export interface Registration {
  id: ID
  eventId: ID
  personId: ID
  state: RegistrationState
  registeredAt: string
  source: string
}

export type GroupType = 'Batch' | 'Department' | 'City' | 'Country' | 'Profession' | 'Interest' | 'Private Committee' | 'Chapter' | 'Official'

export interface CommunityGroup {
  id: ID
  name: string
  type: GroupType
  description: string
  coverColor: string
  privacy: 'public' | 'private'
  memberCount: number
  postCount: number
  pendingReports: number
  owners: string[]
  createdAt: string
}

export interface GroupPost {
  id: ID
  groupId: ID
  authorId: ID
  content: string
  createdAt: string
  likeCount: number
  commentCount: number
  flagged: boolean
}

// Module — Community Feed. A LinkedIn/Facebook-style feed mixing official
// institution announcements with alumni milestone updates and reactions.
export type ReactionType = 'like' | 'celebrate' | 'support' | 'love' | 'insightful'
export type FeedPostKind = 'update' | 'milestone' | 'announcement' | 'event' | 'job' | 'festival'
export type FeedAuthorKind = 'alumni' | 'institution'

export interface FeedAuthor {
  id: ID
  name: string
  kind: FeedAuthorKind
  avatarColor: string
  avatarImageUrl?: string
  /** Short line shown under the author name — batch/role for alumni, tagline for institution. */
  meta?: string
  batch?: string
  passoutYear?: string
  occupation?: string
  education?: string
  nativePlace?: string
  workingPlace?: string
}

export interface FeedPostMedia {
  type: 'image' | 'video'
  url: string
  alt?: string
}

export interface FeedComment {
  id: ID
  authorId: ID
  content: string
  createdAt: string
  likeCount: number
}

export type FeedReactionSummary = Record<ReactionType, number>

export interface FeedPost {
  id: ID
  authorId: ID
  kind: FeedPostKind
  content: string
  media?: FeedPostMedia[]
  createdAt: string
  reactions: FeedReactionSummary
  myReaction: ReactionType | null
  comments: FeedComment[]
  shareCount: number
  saved: boolean
  tags?: string[]
}

export type JobLifecycle = 'draft' | 'pending_review' | 'published' | 'paused' | 'closed' | 'archived'

export interface JobPosting {
  id: ID
  title: string
  employer: string
  employerLogo: string
  location: string
  remoteMode: 'On-site' | 'Remote' | 'Hybrid'
  employmentType: 'Full-time' | 'Part-time' | 'Internship' | 'Contract' | 'Project'
  experience: string
  skills: string[]
  salaryVisible: boolean
  salaryRange?: string
  status: JobLifecycle
  postedById: ID
  postedAt: string
  expiresAt: string
  applicantCount: number
  viewCount: number
  referralAllowed: boolean
  description: string
}

export interface JobApplication {
  id: ID
  jobId: ID
  applicantId: ID
  status: 'submitted' | 'under_review' | 'shortlisted' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  appliedAt: string
  referredById?: ID
  matchScore: number
  matchReasons: string[]
}

export type MentorshipLifecycle = 'application' | 'screening' | 'eligible' | 'matched' | 'invited' | 'accepted' | 'active' | 'completed' | 'ended'

export interface MentorProfile {
  id: ID
  personId: ID
  expertise: string[]
  industries: string[]
  yearsExperience: number
  capacity: number
  activeMentees: number
  languages: string[]
  timezone: string
  bio: string
  rating: number
}

export interface Mentorship {
  id: ID
  mentorId: ID
  menteeId: ID
  program: string
  status: MentorshipLifecycle
  goals: string[]
  matchScore: number
  startedAt?: string
  sessionsCompleted: number
  sessionsPlanned: number
  lastSessionAt?: string
  satisfactionScore?: number
}

export type CampaignFundraisingType = 'General Fund' | 'Scholarship' | 'Infrastructure' | 'Endowment' | 'Emergency Relief' | 'Athletics' | 'Research'

export interface FundraisingCampaign {
  id: ID
  title: string
  type: CampaignFundraisingType
  description: string
  coverColor: string
  goal: number
  raised: number
  currency: string
  donorCount: number
  startAt: string
  endAt: string
  status: 'draft' | 'active' | 'completed' | 'paused'
  recurringRevenue: number
}

export type DonationLifecycle = 'initiated' | 'authorized' | 'captured' | 'failed' | 'refunded' | 'chargeback'

export interface Donation {
  id: ID
  campaignId: ID
  donorId: ID
  amount: number
  currency: string
  recurring: boolean
  frequency?: 'Monthly' | 'Quarterly' | 'Annually'
  status: DonationLifecycle
  providerTxnId: string
  createdAt: string
  receiptSent: boolean
  anonymous: boolean
  dedicatedTo?: string
}

export type ContentType = 'Page' | 'Announcement' | 'News' | 'Story' | 'Resource' | 'FAQ' | 'Policy' | 'Banner'
export type ContentWorkflowState = 'draft' | 'review' | 'approved' | 'scheduled' | 'published' | 'archived'

export interface ContentItem {
  id: ID
  title: string
  type: ContentType
  state: ContentWorkflowState
  summary: string
  body: string
  authorId: ID
  coverColor: string
  publishedAt?: string
  scheduledAt?: string
  updatedAt: string
  views: number
  version: number
  tags: string[]
}

export interface NotificationItem {
  id: ID
  personId: ID
  category: 'event' | 'community' | 'career' | 'mentorship' | 'giving' | 'system' | 'content'
  title: string
  body: string
  createdAt: string
  read: boolean
  actionLabel?: string
  actionHref?: string
}

export interface AuditEvent {
  id: ID
  actor: string
  actorRole: string
  action: string
  resource: string
  resourceId: string
  outcome: 'success' | 'failure'
  ip: string
  timestamp: string
  category: 'security' | 'data' | 'access' | 'billing' | 'export' | 'config'
  details?: string
}

export interface IntegrationConnector {
  id: ID
  name: string
  category: 'SIS' | 'CRM' | 'ERP' | 'LMS' | 'Identity' | 'Email' | 'SMS' | 'Payments' | 'Calendar' | 'Video' | 'Accounting' | 'Data Warehouse'
  status: 'connected' | 'disconnected' | 'error' | 'not_configured'
  logoInitials: string
  syncMode: 'One-way import' | 'One-way export' | 'Bidirectional' | 'Scheduled' | 'Manual'
  lastSyncAt?: string
  recordsSynced: number
  description: string
}

export interface WebhookDelivery {
  id: ID
  event: string
  endpoint: string
  status: 'delivered' | 'retrying' | 'failed'
  attempt: number
  respondedAt: string
  statusCode: number
}

export interface WorkflowAutomation {
  id: ID
  name: string
  trigger: string
  description: string
  enabled: boolean
  actionsSummary: string[]
  runsLast30d: number
  successRate: number
  lastRunAt: string
}

export interface WorkflowExecution {
  id: ID
  workflowId: ID
  status: 'success' | 'failed' | 'running' | 'retrying'
  startedAt: string
  durationMs: number
  trigger: string
  steps: { name: string; status: 'success' | 'failed' | 'skipped' }[]
}

export interface SupportTicket {
  id: ID
  tenantId: ID
  subject: string
  tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Critical'
  status: 'new' | 'assigned' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed'
  requester: string
  assignee?: string
  createdAt: string
  updatedAt: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
}

export interface ImportBatch {
  id: ID
  fileName: string
  source: 'CSV' | 'XLSX' | 'API' | 'Legacy Export'
  status: 'validating' | 'ready' | 'processing' | 'completed' | 'failed'
  totalRows: number
  validRows: number
  invalidRows: number
  duplicateRows: number
  uploadedAt: string
  uploadedBy: string
  mappingTemplate: string
}

export interface DataQualitySnapshot {
  completeness: number
  validity: number
  uniqueness: number
  freshness: number
  reachability: number
  duplicateRecords: number
  missingEmail: number
  staleRecords: number
}

export type UserRoleContext = 'member' | 'admin' | 'superadmin'

// Module — Custom Dashboards. User-configurable dashboards built from a
// library of widgets, each backed by a real data source in the product
// (members, events, communities, careers, mentorship, fundraising, content).
export type WidgetDataSourceKey = 'members' | 'events' | 'communities' | 'careers' | 'mentorship' | 'fundraising' | 'content'
export type WidgetChartType = 'panel' | 'table' | 'bar' | 'line' | 'area' | 'pie'
export type WidgetTimescale = 'all_time' | 'today' | 'this_week' | 'this_month' | 'last_7' | 'last_30' | 'last_90' | 'last_365'
export type WidgetAutoReload = 'off' | '5m' | '15m' | '30m' | '1h'
export type WidgetSize = 'S' | 'M' | 'L' | 'XL'
export type ColorPaletteKey = 'brand' | 'sunset' | 'ocean' | 'forest'

export interface WidgetFilterRule {
  id: ID
  field: string
  value: string
}

export interface DashboardWidget {
  id: ID
  title: string
  dataSource: WidgetDataSourceKey
  groupBy: string
  metric: string
  top: number
  showAll: boolean
  timescale: WidgetTimescale
  autoReload: WidgetAutoReload
  chartType: WidgetChartType
  colorPalette: ColorPaletteKey
  filters: WidgetFilterRule[]
  size: WidgetSize
  lastUpdatedAt: string
}

export interface CustomDashboard {
  id: ID
  name: string
  createdAt: string
  updatedAt: string
  dashboardTimescale: WidgetTimescale | null
  widgets: DashboardWidget[]
}

import type { UserRoleContext } from '../../types'
import {
  LayoutDashboard, UserCircle, Users, CalendarDays, MessagesSquare, Briefcase,
  Handshake, Gift, Newspaper, Settings, UploadCloud, ShieldCheck, Megaphone,
  BarChart3, Plug, Workflow, ScrollText, Building2, CreditCard, Flag, LifeBuoy,
  Activity, Bell, Rss,
} from 'lucide-react'
import type { ComponentType } from 'react'

export interface NavItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
  end?: boolean
}

// Main menu = NavGroup, sub menus = NavGroup.items. Grouped module-wise so the
// sidebar can render a two-level (main menu / sub menu) tree per workspace.
export interface NavGroup {
  label: string
  icon: ComponentType<{ className?: string }>
  items: NavItem[]
}

export interface WorkspaceMeta {
  label: string
  base: string
  tagline: string
  home: NavItem
  groups: NavGroup[]
  /** Flattened home + all group items — used for title lookup, mobile nav and command palette. */
  nav: NavItem[]
}

const memberHome: NavItem = { label: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true }
const memberGroups: NavGroup[] = [
  { label: 'Feed', icon: Rss, items: [{ label: 'Feed', to: '/app/feed', icon: Rss }] },
  {
    label: 'My Network', icon: Users,
    items: [
      { label: 'My Profile', to: '/app/profile', icon: UserCircle },
      { label: 'Directory', to: '/app/directory', icon: Users },
    ],
  },
  {
    label: 'Engagement', icon: CalendarDays,
    items: [
      { label: 'Events', to: '/app/events', icon: CalendarDays },
      { label: 'Communities', to: '/app/communities', icon: MessagesSquare },
    ],
  },
  {
    label: 'Opportunities', icon: Briefcase,
    items: [
      { label: 'Careers', to: '/app/careers', icon: Briefcase },
      { label: 'Mentorship', to: '/app/mentorship', icon: Handshake },
    ],
  },
  { label: 'Giving', icon: Gift, items: [{ label: 'Giving', to: '/app/giving', icon: Gift }] },
  {
    label: 'Updates', icon: Newspaper,
    items: [
      { label: 'News & Content', to: '/app/content', icon: Newspaper },
      { label: 'Notifications', to: '/app/notifications', icon: Bell },
    ],
  },
  { label: 'Account', icon: Settings, items: [{ label: 'Settings', to: '/app/settings', icon: Settings }] },
]

const adminHome: NavItem = { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true }
const adminGroups: NavGroup[] = [
  {
    label: 'Alumni', icon: Users,
    items: [
      { label: 'Members', to: '/admin/members', icon: Users },
      { label: 'Imports & Data Quality', to: '/admin/import', icon: UploadCloud },
      { label: 'Roles & Permissions', to: '/admin/roles', icon: ShieldCheck },
    ],
  },
  {
    label: 'Engagement', icon: CalendarDays,
    items: [
      { label: 'Events', to: '/admin/events', icon: CalendarDays },
      { label: 'Communications', to: '/admin/communications', icon: Megaphone },
      { label: 'Communities', to: '/admin/communities', icon: MessagesSquare },
    ],
  },
  {
    label: 'Growth', icon: Briefcase,
    items: [
      { label: 'Careers', to: '/admin/careers', icon: Briefcase },
      { label: 'Mentorship', to: '/admin/mentorship', icon: Handshake },
    ],
  },
  { label: 'Advancement', icon: Gift, items: [{ label: 'Fundraising', to: '/admin/fundraising', icon: Gift }] },
  { label: 'Content', icon: Newspaper, items: [{ label: 'Content (CMS)', to: '/admin/content', icon: Newspaper }] },
  {
    label: 'Insights', icon: BarChart3,
    items: [
      { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
      { label: 'Audit Log', to: '/admin/audit', icon: ScrollText },
    ],
  },
  {
    label: 'Platform Ops', icon: Plug,
    items: [
      { label: 'Integrations', to: '/admin/integrations', icon: Plug },
      { label: 'Workflows', to: '/admin/workflows', icon: Workflow },
    ],
  },
  { label: 'Settings', icon: Settings, items: [{ label: 'Organisation Settings', to: '/admin/settings', icon: Settings }] },
]

const platformHome: NavItem = { label: 'Tenants', to: '/platform', icon: Building2, end: true }
const platformGroups: NavGroup[] = [
  { label: 'Commercial', icon: CreditCard, items: [{ label: 'Billing & Plans', to: '/platform/billing', icon: CreditCard }] },
  { label: 'Platform', icon: Flag, items: [{ label: 'Feature Flags', to: '/platform/flags', icon: Flag }] },
  {
    label: 'Support', icon: LifeBuoy,
    items: [
      { label: 'Support', to: '/platform/support', icon: LifeBuoy },
      { label: 'System Health', to: '/platform/health', icon: Activity },
    ],
  },
]

function flatten(home: NavItem, groups: NavGroup[]): NavItem[] {
  return [home, ...groups.flatMap((g) => g.items)]
}

export const workspaceMeta: Record<UserRoleContext, WorkspaceMeta> = {
  member: { label: 'Member Portal', base: '/app', tagline: 'Alumni experience', home: memberHome, groups: memberGroups, nav: flatten(memberHome, memberGroups) },
  admin: { label: 'Admin Console', base: '/admin', tagline: 'Institution administration', home: adminHome, groups: adminGroups, nav: flatten(adminHome, adminGroups) },
  superadmin: { label: 'Platform Console', base: '/platform', tagline: 'SaaS operations', home: platformHome, groups: platformGroups, nav: flatten(platformHome, platformGroups) },
}

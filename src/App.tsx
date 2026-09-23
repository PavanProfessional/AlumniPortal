import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppStateProvider } from './context/AppStateContext'
import { DashboardsProvider } from './context/DashboardsContext'
import { TourProvider } from './context/TourContext'
import { ToastProvider } from './components/ui/Toast'
import { AppShell } from './components/layout/AppShell'

import Landing from './pages/marketing/Landing'
import Login from './pages/auth/Login'
import Onboarding from './pages/auth/Onboarding'

import MemberDashboard from './pages/member/Dashboard'
import MemberFeed from './pages/member/Feed'
import MemberProfile from './pages/member/Profile'
import MemberDirectory from './pages/member/Directory'
import MemberDirectoryProfile from './pages/member/DirectoryProfile'
import MemberEvents from './pages/member/Events'
import MemberEventDetail from './pages/member/EventDetail'
import MemberCommunities from './pages/member/Communities'
import MemberCommunityDetail from './pages/member/CommunityDetail'
import MemberCareers from './pages/member/Careers'
import MemberJobDetail from './pages/member/JobDetail'
import MemberMentorship from './pages/member/Mentorship'
import MemberGiving from './pages/member/Giving'
import MemberContent from './pages/member/Content'
import MemberNotifications from './pages/member/Notifications'
import MemberSettings from './pages/member/Settings'

import AdminDashboard from './pages/admin/Dashboard'
import AdminMembers from './pages/admin/Members'
import AdminMemberDetail from './pages/admin/MemberDetail'
import AdminImport from './pages/admin/Import'
import AdminRoles from './pages/admin/Roles'
import AdminEvents from './pages/admin/Events'
import AdminEventDetail from './pages/admin/EventDetail'
import AdminCommunications from './pages/admin/Communications'
import AdminCommunities from './pages/admin/Communities'
import AdminCareers from './pages/admin/Careers'
import AdminMentorship from './pages/admin/Mentorship'
import AdminFundraising from './pages/admin/Fundraising'
import AdminContent from './pages/admin/Content'
import AdminAnalytics from './pages/admin/Analytics'
import AdminIntegrations from './pages/admin/Integrations'
import AdminWorkflows from './pages/admin/Workflows'
import AdminAudit from './pages/admin/Audit'
import AdminSettings from './pages/admin/Settings'

import PlatformTenants from './pages/platform/Tenants'
import PlatformTenantDetail from './pages/platform/TenantDetail'
import PlatformBilling from './pages/platform/Billing'
import PlatformLicense from './pages/platform/License'
import PlatformFlags from './pages/platform/Flags'
import PlatformSupport from './pages/platform/Support'
import PlatformHealth from './pages/platform/Health'

export default function App() {
  return (
    <AppStateProvider>
      <DashboardsProvider>
      <ToastProvider>
      <TourProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          <Route path="/app" element={<AppShell />}>
            <Route index element={<MemberDashboard />} />
            <Route path="feed" element={<MemberFeed />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="directory" element={<MemberDirectory />} />
            <Route path="directory/:personId" element={<MemberDirectoryProfile />} />
            <Route path="events" element={<MemberEvents />} />
            <Route path="events/:eventId" element={<MemberEventDetail />} />
            <Route path="communities" element={<MemberCommunities />} />
            <Route path="communities/:groupId" element={<MemberCommunityDetail />} />
            <Route path="careers" element={<MemberCareers />} />
            <Route path="careers/:jobId" element={<MemberJobDetail />} />
            <Route path="mentorship" element={<MemberMentorship />} />
            <Route path="giving" element={<MemberGiving />} />
            <Route path="content" element={<MemberContent />} />
            <Route path="notifications" element={<MemberNotifications />} />
            <Route path="settings" element={<MemberSettings />} />
          </Route>

          <Route path="/admin" element={<AppShell />}>
            <Route index element={<AdminDashboard />} />
            <Route path="members" element={<AdminMembers />} />
            <Route path="members/:personId" element={<AdminMemberDetail />} />
            <Route path="import" element={<AdminImport />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="events/:eventId" element={<AdminEventDetail />} />
            <Route path="communications" element={<AdminCommunications />} />
            <Route path="communities" element={<AdminCommunities />} />
            <Route path="careers" element={<AdminCareers />} />
            <Route path="mentorship" element={<AdminMentorship />} />
            <Route path="fundraising" element={<AdminFundraising />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="integrations" element={<AdminIntegrations />} />
            <Route path="workflows" element={<AdminWorkflows />} />
            <Route path="audit" element={<AdminAudit />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="/platform" element={<AppShell />}>
            <Route index element={<PlatformTenants />} />
            <Route path="tenants/:tenantId" element={<PlatformTenantDetail />} />
            <Route path="billing" element={<PlatformBilling />} />
            <Route path="license" element={<PlatformLicense />} />
            <Route path="flags" element={<PlatformFlags />} />
            <Route path="support" element={<PlatformSupport />} />
            <Route path="health" element={<PlatformHealth />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </TourProvider>
      </ToastProvider>
      </DashboardsProvider>
    </AppStateProvider>
  )
}

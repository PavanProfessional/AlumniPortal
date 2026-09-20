import { Link } from 'react-router-dom'
import { CalendarDays, Users, Briefcase, Gift, TrendingUp, MapPin } from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard, ProgressBar, Avatar, Button } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { useAppState } from '../../context/AppStateContext'
import { myRegistrations, eventById } from '../../data/events'
import { alumniPeople } from '../../data/alumniPeople'
import { jobs } from '../../data/careers'
import { myMentorships } from '../../data/mentorship'
import { notifications } from '../../data/notifications'
import { formatDate, formatRelative } from '../../utils/dates'
import { formatCurrency } from '../../utils/format'
import { myDonations } from '../../data/fundraising'

export default function MemberDashboard() {
  const { currentUser } = useAppState()
  const upcoming = myRegistrations.map((r) => eventById(r.eventId)!).filter((e) => new Date(e.startAt) > new Date()).slice(0, 3)
  const suggested = alumniPeople.filter((p) => p.id !== currentUser.id).slice(5, 9)
  const recommendedJobs = jobs.filter((j) => j.status === 'published').slice(0, 3)
  const recentActivity = notifications.slice(0, 4)
  const totalGiven = myDonations.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Welcome back"
        title={`Good to see you, ${currentUser.firstName}`}
        description="Here's what's happening across your network this week."
        action={<Link to="/app/directory"><Button variant="outline" icon={<Users className="h-4 w-4" />}>Browse directory</Button></Link>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Profile completion" value={`${currentUser.profileCompletion}%`} icon={<TrendingUp className="h-4 w-4" />} sub="Add certifications to reach 100%" />
        <StatCard label="Engagement score" value={currentUser.engagementScore} delta="+6 this month" icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Upcoming events" value={upcoming.length} icon={<CalendarDays className="h-4 w-4" />} sub="Registered & confirmed" />
        <StatCard label="Lifetime giving" value={formatCurrency(totalGiven)} icon={<Gift className="h-4 w-4" />} sub={`${currentUser.givingTier} tier donor`} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Your upcoming events" subtitle="Registrations you're confirmed for" action={<Link to="/app/events" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">View all</Link>} />
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {upcoming.map((e) => (
                <Link key={e.id} to={`/app/events/${e.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-ink-50 dark:hover:bg-ink-800/50">
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg text-white" style={{ backgroundColor: e.coverColor }}>
                    <span className="text-[10px] font-medium uppercase leading-none">{formatDate(e.startAt, { month: 'short' })}</span>
                    <span className="text-base font-bold leading-none">{formatDate(e.startAt, { day: 'numeric' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{e.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400"><MapPin className="h-3 w-3" /> {e.mode === 'In-person' ? e.venue : e.mode}</p>
                  </div>
                  <StatusBadge status={e.status} />
                </Link>
              ))}
              {upcoming.length === 0 && <p className="px-5 py-8 text-center text-sm text-ink-400">No upcoming registrations — explore the events calendar.</p>}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recommended for you" subtitle="Jobs matched to your skills and profile" action={<Link to="/app/careers" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">View all</Link>} />
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {recommendedJobs.map((j) => (
                <Link key={j.id} to={`/app/careers/${j.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-ink-50 dark:hover:bg-ink-800/50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">{j.employerLogo}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{j.title}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-400">{j.employer} · {j.location}</p>
                  </div>
                  <Briefcase className="h-4 w-4 shrink-0 text-ink-300" />
                </Link>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="People you may know" subtitle="From your batch and city" />
            <div className="divide-y divide-ink-100 p-2 dark:divide-ink-800">
              {suggested.map((p) => (
                <Link key={p.id} to={`/app/directory/${p.id}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-ink-50 dark:hover:bg-ink-800/50">
                  <Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</p>
                    <p className="truncate text-xs text-ink-400">{p.headline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Mentoring" subtitle="Active mentorships" action={<Link to="/app/mentorship" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">Open</Link>} />
            <div className="space-y-3 p-5">
              {myMentorships.map((m) => (
                <div key={m.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-ink-700 dark:text-ink-200">{m.program}</span>
                    <span className="text-ink-400">{m.sessionsCompleted}/{m.sessionsPlanned} sessions</span>
                  </div>
                  <ProgressBar value={(m.sessionsCompleted / m.sessionsPlanned) * 100} className="mt-1.5" tone="success" />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader title="Recent activity" />
            <div className="space-y-4 p-5">
              {recentActivity.map((n) => (
                <div key={n.id} className="flex gap-3">
                  <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="text-xs font-medium text-ink-700 dark:text-ink-200">{n.title}</p>
                    <p className="text-[11px] text-ink-400">{formatRelative(n.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

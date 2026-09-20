import { Link } from 'react-router-dom'
import {
  GraduationCap, ArrowRight, Users, CalendarDays, Briefcase, Handshake, Gift,
  MessagesSquare, ShieldCheck, BarChart3, Plug, Workflow, CheckCircle2, Star,
} from 'lucide-react'
import { currentTenant, tenants } from '../../data/tenants'
import { formatCompact } from '../../utils/format'
import { Button } from '../../components/ui/Primitives'

const features = [
  { icon: Users, title: 'Alumni Directory & Profiles', desc: 'A trustworthy relationship graph with verification, privacy controls and rich academic + career history.' },
  { icon: CalendarDays, title: 'Events & Engagement', desc: 'Full event lifecycle — registration, waitlists, QR check-in, and engagement scoring.' },
  { icon: MessagesSquare, title: 'Communities & Groups', desc: 'Batch, chapter and interest-based communities with moderation and privacy built in.' },
  { icon: Briefcase, title: 'Careers & Referrals', desc: 'Job board, explainable matching, and alumni-powered referrals for employers and members.' },
  { icon: Handshake, title: 'Mentorship Programs', desc: 'Structured mentor/mentee matching, cohorts, sessions and satisfaction tracking.' },
  { icon: Gift, title: 'Fundraising & Giving', desc: 'Campaigns, recurring donations, pledges and donor segmentation with reconciliation.' },
  { icon: ShieldCheck, title: 'Enterprise RBAC & Audit', desc: 'Default-deny, scope-aware permissions with a full audit trail on every sensitive action.' },
  { icon: BarChart3, title: 'Analytics & Reporting', desc: 'Executive, alumni office, careers and fundraising dashboards with governed KPIs.' },
  { icon: Plug, title: 'Integrations & API', desc: 'SIS, CRM, payments, identity and data warehouse connectors with signed webhooks.' },
  { icon: Workflow, title: 'Workflow Automation', desc: 'Trigger-condition-action automations with retries, approvals and execution history.' },
]

const tiers = [
  { name: 'Core', price: 'Starting plan', blurb: 'Directory, profiles, authentication, announcements, email, events, dashboards, imports.', cta: 'Start with Core' },
  { name: 'Growth', price: 'Most popular', blurb: 'Adds mentoring, jobs, communities, advanced communications, workflows, analytics, integrations.', cta: 'Start with Growth', highlighted: true },
  { name: 'Enterprise', price: 'Custom pricing', blurb: 'SSO, SCIM, custom domains, advanced RBAC/ABAC, audit exports, data residency, SLA & dedicated support.', cta: 'Talk to sales' },
]

export default function Landing() {
  const activeTenants = tenants.filter((t) => t.status === 'active').length

  return (
    <div className="min-h-screen bg-white text-ink-900 dark:bg-ink-950 dark:text-ink-50">
      <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/80 backdrop-blur dark:border-ink-800 dark:bg-ink-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"><GraduationCap className="h-4.5 w-4.5" /></div>
            <span className="font-display text-lg font-bold">Alumnia</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-ink-600 dark:text-ink-300 md:flex">
            <a href="#modules" className="hover:text-ink-950 dark:hover:text-white">Modules</a>
            <a href="#pricing" className="hover:text-ink-950 dark:hover:text-white">Pricing</a>
            <a href="#trust" className="hover:text-ink-950 dark:hover:text-white">Trust & Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/onboarding"><Button size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>Get a demo</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl">
          <div className="h-72 w-[48rem] bg-gradient-to-tr from-brand-300 via-brand-200 to-accent-200 opacity-40 dark:opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Trusted by {activeTenants}+ institutions on the platform
            </span>
            <h1 className="mt-6 text-balance font-display text-4xl font-bold tracking-tight sm:text-6xl">
              The enterprise relationship platform for <span className="text-brand-600 dark:text-brand-400">alumni</span>, for life.
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-balance text-lg text-ink-500 dark:text-ink-400">
              Identity, engagement, careers, mentoring, giving and communities — one configurable, multi-tenant platform institutions can launch without a custom codebase.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/onboarding"><Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>Start onboarding a tenant</Button></Link>
              <Link to="/login"><Button size="lg" variant="outline">Explore live demo</Button></Link>
            </div>
            <p className="mt-3 text-xs text-ink-400">No credit card needed for the demo workspace · Member, Admin and Platform views included</p>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-100 bg-ink-50/60 py-8 dark:border-ink-800 dark:bg-ink-900/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { label: 'Alumni managed', value: formatCompact(currentTenant.memberCount) },
            { label: 'Institution tenants', value: tenants.length },
            { label: 'Platform uptime target', value: '99.9%' },
            { label: 'Modules shipped', value: '27' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-2xl font-bold sm:text-3xl">{s.value}</p>
              <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modules" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Everything institutions need</p>
          <h2 className="mt-2 font-display text-3xl font-bold">One platform, every module</h2>
          <p className="mt-3 text-ink-500 dark:text-ink-400">Configuration beats customer-specific forks — every module ships with permissions, audit, search, bulk operations and analytics.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-soft transition-shadow hover:shadow-card dark:border-ink-800 dark:bg-ink-900">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-ink-500 dark:text-ink-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="bg-ink-50/60 py-20 dark:bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Commercial packaging</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Grow from Core to Enterprise</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {tiers.map((t) => (
              <div key={t.name} className={`rounded-xl2 border p-7 ${t.highlighted ? 'border-brand-600 bg-white shadow-card ring-1 ring-brand-600 dark:bg-ink-900' : 'border-ink-200 bg-white dark:border-ink-800 dark:bg-ink-900'}`}>
                {t.highlighted && <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">Most popular</span>}
                <h3 className="mt-3 font-display text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-sm font-medium text-ink-500">{t.price}</p>
                <p className="mt-4 text-sm text-ink-500 dark:text-ink-400">{t.blurb}</p>
                <Link to="/onboarding" className="mt-6 block">
                  <Button variant={t.highlighted ? 'primary' : 'outline'} className="w-full justify-center">{t.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Enterprise-ready by default</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Built for institutions handling sensitive data</h2>
            <p className="mt-3 text-ink-500 dark:text-ink-400">Tenant isolation is mandatory. Authorization is server-side and default-deny. Every sensitive action is auditable.</p>
            <ul className="mt-6 space-y-3">
              {['Multi-tenant isolation with default-deny authorization', 'SSO/SAML/OIDC, SCIM provisioning, custom domains', 'Full audit trail on exports, role changes and impersonation', 'Configurable retention, consent and data residency'].map((i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-ink-600 dark:text-ink-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600 dark:text-accent-400" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl2 border border-ink-200 bg-gradient-to-br from-brand-600 to-brand-800 p-8 text-white shadow-card">
            <p className="text-sm font-medium text-brand-100">Sample institution</p>
            <h3 className="mt-1 font-display text-2xl font-bold">{currentTenant.displayName}</h3>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-brand-200">Alumni</p><p className="font-display text-xl font-bold">{formatCompact(currentTenant.memberCount)}</p></div>
              <div><p className="text-brand-200">Admins</p><p className="font-display text-xl font-bold">{currentTenant.adminCount}</p></div>
              <div><p className="text-brand-200">Plan</p><p className="font-display text-xl font-bold capitalize">{currentTenant.plan}</p></div>
              <div><p className="text-brand-200">Health score</p><p className="font-display text-xl font-bold">{currentTenant.healthScore}/100</p></div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink-100 py-10 dark:border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-ink-400 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2026 Alumnia. Built as a product demonstration.</p>
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-600 text-white"><GraduationCap className="h-3.5 w-3.5" /></div>
            <span className="font-display font-semibold text-ink-700 dark:text-ink-200">Alumnia</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

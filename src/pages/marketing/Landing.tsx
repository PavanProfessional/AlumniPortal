import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, ArrowRight, Users, CalendarDays, Briefcase, Handshake, Gift,
  MessagesSquare, ShieldCheck, BarChart3, Plug, Workflow, CheckCircle2, Star,
  Quote, Lock, Globe, TrendingUp, Rss, Sparkles, Sun, Moon,
} from 'lucide-react'
import { currentTenant, tenants } from '../../data/tenants'
import { formatCompact } from '../../utils/format'
import { Button } from '../../components/ui/Primitives'
import { useAppState } from '../../context/AppStateContext'

const heroCopy: { before: string; highlight: string; after: string; description: string }[] = [
  {
    before: 'The enterprise relationship platform for ', highlight: 'alumni', after: ', for life.',
    description: 'Identity, engagement, careers, mentoring, giving and communities — one configurable, multi-tenant platform institutions can launch without a custom codebase.',
  },
  {
    before: 'Built for ', highlight: 'institutions', after: ', not one-off integrations.',
    description: 'One multi-tenant platform your alumni office, careers team and advancement office can all run on — configured, never custom-coded.',
  },
  {
    before: 'One relationship graph, for every reunion after ', highlight: 'graduation', after: '.',
    description: 'Directory, events, mentoring, careers and giving stay connected in a single relationship graph that grows with every cohort.',
  },
  {
    before: 'Turn alumni goodwill into measurable ', highlight: 'engagement', after: '.',
    description: 'Executive dashboards surface participation, giving and career outcomes in real time — across every tenant on the platform.',
  },
]

const heroCardPool = [
  { icon: Users, label: 'Directory', sub: `${formatCompact(currentTenant.memberCount)} alumni` },
  { icon: CalendarDays, label: 'Events', sub: 'Live check-in' },
  { icon: Handshake, label: 'Mentorship', sub: 'Matched cohorts' },
  { icon: Gift, label: 'Giving', sub: 'Campaign live' },
  { icon: Briefcase, label: 'Careers', sub: 'Jobs open now' },
  { icon: MessagesSquare, label: 'Communities', sub: 'Active chapters' },
  { icon: Rss, label: 'News & Content', sub: 'Fresh updates' },
  { icon: BarChart3, label: 'Analytics', sub: 'Live dashboards' },
  { icon: ShieldCheck, label: 'RBAC & Audit', sub: 'Every action logged' },
  { icon: Sparkles, label: 'AI Assistant', sub: 'Ask anything' },
]

// Percentage (x, y) positions spacing 10 cards evenly around an ellipse centered on the hub.
const heroCardPositions = [
  { x: 92, y: 50 }, { x: 84, y: 72 }, { x: 63, y: 86 }, { x: 37, y: 86 },
  { x: 16, y: 72 }, { x: 8, y: 50 }, { x: 16, y: 28 }, { x: 37, y: 14 },
  { x: 63, y: 14 }, { x: 84, y: 28 },
]

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

const testimonials = [
  {
    quote: 'We replaced four disconnected tools with one platform — our alumni office finally has a single source of truth.',
    name: 'Meera Kulkarni', role: 'Director of Alumni Relations', org: 'Riverside College',
  },
  {
    quote: 'Standing up a fully branded portal for our institution took days, not months. No engineering team required.',
    name: 'James Okafor', role: 'VP of Advancement', org: 'Veridian Global Academy',
  },
  {
    quote: 'The executive dashboards alone paid for the platform — we can finally show our board real engagement numbers.',
    name: 'Anitha Rao', role: 'Executive Director', org: 'Lakeside Alumni Foundation',
  },
]

const valueStats = [
  { icon: TrendingUp, value: '80%', label: 'Faster alumni onboarding vs. spreadsheets + email' },
  { icon: Sparkles, value: '5-in-1', label: 'Directory, events, careers, giving and mentoring replaced' },
  { icon: Rss, value: '3x', label: 'More engagement with a social, feed-first experience' },
  { icon: ShieldCheck, value: '100%', label: 'Actions audited — nothing happens off the record' },
]

export default function Landing() {
  const activeTenants = tenants.filter((t) => t.status === 'active').length
  const [copyIndex, setCopyIndex] = useState(0)
  const { theme, toggleTheme } = useAppState()

  useEffect(() => {
    const id = window.setInterval(() => setCopyIndex((i) => (i + 1) % heroCopy.length), 5500)
    return () => window.clearInterval(id)
  }, [])

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
            <a href="#testimonials" className="hover:text-ink-950 dark:hover:text-white">Testimonials</a>
            <a href="#pricing" className="hover:text-ink-950 dark:hover:text-white">Pricing</a>
            <a href="#trust" className="hover:text-ink-950 dark:hover:text-white">Trust & Security</a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-200"
            >
              {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
            </button>
            <Link to="/login"><Button variant="ghost" size="sm">Sign in</Button></Link>
            <Link to="/onboarding"><Button size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>Get a demo</Button></Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <style>{`
          @keyframes alumniaFloat1 {
            0%, 100% { transform: perspective(1000px) rotateY(-16deg) rotateX(8deg) translateZ(10px) translateY(0); }
            50% { transform: perspective(1000px) rotateY(-12deg) rotateX(5deg) translateZ(10px) translateY(-14px); }
          }
          @keyframes alumniaFloat3 {
            0%, 100% { transform: perspective(1000px) rotateY(16deg) rotateX(8deg) translateZ(10px) translateY(0); }
            50% { transform: perspective(1000px) rotateY(12deg) rotateX(5deg) translateZ(10px) translateY(-14px); }
          }
          @keyframes alumniaHubPulse {
            0%, 100% { transform: translateZ(40px) scale(1); }
            50% { transform: translateZ(40px) scale(1.06); }
          }
        `}</style>
        <div className="pointer-events-none absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl">
          <div className="h-72 w-[48rem] bg-gradient-to-tr from-brand-300 via-brand-200 to-accent-200 opacity-40 dark:opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 dark:border-ink-800 dark:bg-ink-900 dark:text-ink-300">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> Trusted by {activeTenants}+ institutions on the platform
            </span>
            <h1 className="mt-6 grid text-balance font-display text-4xl font-bold tracking-tight sm:text-6xl">
              {heroCopy.map((c, i) => (
                <span
                  key={i}
                  className="col-start-1 row-start-1 transition-all duration-700 ease-out"
                  style={{ opacity: i === copyIndex ? 1 : 0, transform: i === copyIndex ? 'translateY(0)' : 'translateY(10px)', pointerEvents: i === copyIndex ? 'auto' : 'none' }}
                  aria-hidden={i !== copyIndex}
                >
                  {c.before}<span className="text-brand-600 dark:text-brand-400">{c.highlight}</span>{c.after}
                </span>
              ))}
            </h1>
            <p className="mx-auto mt-5 grid max-w-xl text-balance text-lg text-ink-500 dark:text-ink-400">
              {heroCopy.map((c, i) => (
                <span
                  key={i}
                  className="col-start-1 row-start-1 transition-all duration-700 ease-out"
                  style={{ opacity: i === copyIndex ? 1 : 0, transform: i === copyIndex ? 'translateY(0)' : 'translateY(10px)', pointerEvents: i === copyIndex ? 'auto' : 'none' }}
                  aria-hidden={i !== copyIndex}
                >
                  {c.description}
                </span>
              ))}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/onboarding"><Button size="lg" icon={<ArrowRight className="h-4 w-4" />}>Start onboarding a tenant</Button></Link>
              <Link to="/login"><Button size="lg" variant="outline">Explore live demo</Button></Link>
            </div>
            <p className="mt-3 text-xs text-ink-400">No credit card needed for the demo workspace · Member, Admin and Platform views included</p>
          </div>

          <div className="relative mx-auto mt-16 h-[460px] max-w-4xl sm:h-[520px]" style={{ perspective: '1600px' }}>
            <div
              className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-600 to-accent-600 text-white shadow-2xl"
              style={{ animation: 'alumniaHubPulse 4s ease-in-out infinite' }}
            >
              <GraduationCap className="h-7 w-7" />
            </div>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
              {heroCardPositions.map((pos, i) => (
                <line key={heroCardPool[i].label} x1="50" y1="50" x2={pos.x} y2={pos.y} stroke="currentColor" className="text-ink-300 dark:text-ink-700" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
            {heroCardPool.map((card, i) => (
              <div key={card.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${heroCardPositions[i].x}%`, top: `${heroCardPositions[i].y}%` }}>
                <div
                  className="flex w-28 flex-col items-center gap-1.5 rounded-2xl border border-ink-100 bg-white/90 p-3 text-center shadow-2xl backdrop-blur dark:border-ink-800 dark:bg-ink-900/90 sm:w-32"
                  style={{ animation: `${i % 2 === 0 ? 'alumniaFloat1' : 'alumniaFloat3'} ${6 + (i % 4) * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.22}s` }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                    <card.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 w-full">
                    <p className="truncate text-[11px] font-semibold">{card.label}</p>
                    <p className="truncate text-[10px] text-ink-400">{card.sub}</p>
                  </div>
                </div>
              </div>
            ))}
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

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8" style={{ perspective: '2000px' }}>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">See it in action</p>
          <h2 className="mt-2 font-display text-3xl font-bold">One workspace, your entire alumni program</h2>
          <p className="mt-3 text-ink-500 dark:text-ink-400">A live executive view — the same dashboard your team sees the moment they sign in.</p>
        </div>
        <div
          className="group mx-auto mt-12 max-w-4xl overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl transition-transform duration-500 ease-out dark:border-ink-800 dark:bg-ink-900"
          style={{ transform: 'rotateX(10deg) rotateY(-6deg)', transformStyle: 'preserve-3d' }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'rotateX(0deg) rotateY(0deg)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'rotateX(10deg) rotateY(-6deg)' }}
        >
          <div className="flex items-center gap-1.5 border-b border-ink-100 bg-ink-50 px-4 py-2.5 dark:border-ink-800 dark:bg-ink-900/60">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span className="ml-3 rounded-md bg-white px-3 py-0.5 text-[11px] text-ink-400 dark:bg-ink-800">alumnia.app/admin</span>
          </div>
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-4">
            {[
              { label: 'Total Alumni', value: formatCompact(currentTenant.memberCount), icon: Users },
              { label: 'Verified', value: '4.7K', icon: ShieldCheck },
              { label: 'Active Members', value: '20.5K', icon: TrendingUp },
              { label: 'Funds Raised', value: '$4.4M', icon: Gift },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-ink-100 p-4 dark:border-ink-800">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">{s.label}</p>
                  <s.icon className="h-3.5 w-3.5 text-ink-300" />
                </div>
                <p className="mt-2 font-display text-xl font-bold">{s.value}</p>
              </div>
            ))}
            <div className="col-span-full mt-1 flex items-end gap-2 rounded-xl border border-ink-100 p-4 dark:border-ink-800">
              {[38, 52, 46, 61, 58, 70, 66, 78, 74, 85, 80, 92].map((h, i) => (
                <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-accent-500 opacity-90" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
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

      <section className="bg-ink-50/60 py-20 dark:bg-ink-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Why institutions switch</p>
            <h2 className="mt-2 font-display text-3xl font-bold">Real outcomes, not just features</h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {valueStats.map((v) => (
              <div key={v.label} className="rounded-xl2 border border-ink-200 bg-white p-6 text-center shadow-soft dark:border-ink-800 dark:bg-ink-900">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <v.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 font-display text-2xl font-bold">{v.value}</p>
                <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{v.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">What institutions say</p>
          <h2 className="mt-2 font-display text-3xl font-bold">Loved by alumni offices, not just IT</h2>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl2 border border-ink-100 bg-white p-6 shadow-soft transition-transform duration-300 hover:-translate-y-1 hover:shadow-card dark:border-ink-800 dark:bg-ink-900"
            >
              <Quote className="h-6 w-6 text-brand-300 dark:text-brand-500/50" />
              <p className="mt-3 text-sm leading-relaxed text-ink-700 dark:text-ink-200">"{t.quote}"</p>
              <div className="mt-5 flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />)}
              </div>
              <p className="mt-3 text-sm font-semibold text-ink-900 dark:text-ink-50">{t.name}</p>
              <p className="text-xs text-ink-400">{t.role} · {t.org}</p>
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
          <div className="relative" style={{ perspective: '1400px' }}>
            <div className="grid grid-cols-2 gap-4" style={{ transform: 'rotateY(-8deg) rotateX(4deg)', transformStyle: 'preserve-3d' }}>
              {[
                { icon: Lock, label: 'Default-deny RBAC', tone: 'from-brand-600 to-brand-800' },
                { icon: ShieldCheck, label: 'Full audit trail', tone: 'from-accent-600 to-accent-800' },
                { icon: Globe, label: 'Data residency', tone: 'from-sky-600 to-sky-800' },
                { icon: Plug, label: 'Signed webhooks', tone: 'from-violet-600 to-violet-800' },
              ].map((b) => (
                <div key={b.label} className={`rounded-xl2 bg-gradient-to-br ${b.tone} p-6 text-white shadow-card`}>
                  <b.icon className="h-6 w-6" />
                  <p className="mt-3 text-sm font-semibold">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 25%, white 0, transparent 35%), radial-gradient(circle at 85% 75%, white 0, transparent 35%)' }} />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Ready to bring your alumni network into one platform?</h2>
          <p className="mx-auto mt-3 max-w-xl text-brand-100">Launch a fully branded workspace in minutes, or talk to us about an Enterprise rollout for your institution.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/onboarding"><Button size="lg" variant="secondary" icon={<ArrowRight className="h-4 w-4" />}>Start onboarding a tenant</Button></Link>
            <Link to="/login"><Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10">Explore live demo</Button></Link>
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

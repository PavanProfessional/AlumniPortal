import { useState } from 'react'
import {
  KeyRound, ShieldCheck, ShieldAlert, Users, Copy, RefreshCcw, Ban, Eye,
  Rss, CalendarDays, MessagesSquare, Briefcase, Handshake, Gift, Newspaper,
  LayoutDashboard, Workflow, Plug, BarChart3, Globe, type LucideIcon,
} from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge, Badge, type BadgeTone } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { SidePanel } from '../../components/ui/SidePanel'
import { useToast } from '../../components/ui/Toast'
import { tenants } from '../../data/tenants'
import type { Tenant } from '../../types'
import { formatDate, daysFromNow, NOW } from '../../utils/dates'
import { makeRng } from '../../utils/random'

interface ModuleDef { id: string; label: string; description: string; icon: LucideIcon; tier: 'Core' | 'Growth' | 'Enterprise' }

const moduleCatalog: ModuleDef[] = [
  { id: 'directory', label: 'Alumni Directory', description: 'Searchable profiles with verification and privacy controls.', icon: Users, tier: 'Core' },
  { id: 'feed', label: 'Community Feed', description: 'Social posts, reactions, comments and sharing.', icon: Rss, tier: 'Core' },
  { id: 'events', label: 'Events', description: 'Registration, waitlists and QR check-in.', icon: CalendarDays, tier: 'Core' },
  { id: 'communities', label: 'Communities', description: 'Batch, chapter and interest-based groups.', icon: MessagesSquare, tier: 'Growth' },
  { id: 'careers', label: 'Careers & Referrals', description: 'Job board and alumni-powered referrals.', icon: Briefcase, tier: 'Growth' },
  { id: 'mentoring', label: 'Mentorship', description: 'Structured mentor/mentee matching and cohorts.', icon: Handshake, tier: 'Growth' },
  { id: 'fundraising', label: 'Giving & Fundraising', description: 'Campaigns, pledges and donor segmentation.', icon: Gift, tier: 'Growth' },
  { id: 'content', label: 'News & Content', description: 'CMS for announcements and articles.', icon: Newspaper, tier: 'Growth' },
  { id: 'dashboards', label: 'Custom Dashboards', description: 'Configurable widgets, filters and timelines.', icon: LayoutDashboard, tier: 'Growth' },
  { id: 'workflows', label: 'Workflow Automation', description: 'Trigger-condition-action automations.', icon: Workflow, tier: 'Enterprise' },
  { id: 'integrations', label: 'Integrations & API', description: 'SIS, CRM, payments and signed webhooks.', icon: Plug, tier: 'Enterprise' },
  { id: 'advanced-analytics', label: 'Advanced Analytics', description: 'Governed KPIs across every module.', icon: BarChart3, tier: 'Enterprise' },
  { id: 'sso', label: 'SSO / SAML', description: 'Single sign-on with your identity provider.', icon: KeyRound, tier: 'Enterprise' },
  { id: 'scim', label: 'SCIM Provisioning', description: 'Automated user provisioning and deprovisioning.', icon: ShieldCheck, tier: 'Enterprise' },
  { id: 'custom-domain', label: 'Custom Domain', description: 'Serve the portal on your own branded domain.', icon: Globe, tier: 'Enterprise' },
]

const tierTone: Record<ModuleDef['tier'], BadgeTone> = { Core: 'neutral', Growth: 'brand', Enterprise: 'info' }

const seatsPerPlan: Record<Tenant['plan'], number> = { core: 5000, growth: 15000, enterprise: 50000 }
const termYearsPerPlan: Record<Tenant['plan'], number> = { core: 1, growth: 2, enterprise: 3 }

function licenseKeyFor(tenant: Tenant) {
  const rng = makeRng(tenant.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0))
  const seg = () => rng.id('', rng.int(1000, 9999)).slice(1).toUpperCase()
  return `ALM-${tenant.slug.slice(0, 3).toUpperCase()}-${seg()}-${seg()}`
}

function licenseExpiry(tenant: Tenant) {
  if (tenant.trialEndsAt) return tenant.trialEndsAt
  const created = new Date(tenant.createdAt).getTime()
  const years = termYearsPerPlan[tenant.plan]
  const days = Math.round((created + years * 365 * 86400000 - NOW.getTime()) / 86400000)
  return daysFromNow(days)
}

/** "Admin enabled" = at least one org-admin seat is provisioned for the tenant. */
function isAdminEnabled(tenant: Tenant) {
  return tenant.adminCount > 0
}

const licenseStatusTone: Record<string, BadgeTone> = { active: 'success', trial: 'warning', suspended: 'danger', archived: 'neutral' }

export default function PlatformLicense() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Tenant | null>(null)
  const [tenantModules, setTenantModules] = useState<Record<string, Set<string>>>(() =>
    Object.fromEntries(tenants.map((t) => [t.id, new Set(t.featureFlags)])),
  )
  const notify = useToast()

  const filtered = tenants.filter((t) => t.displayName.toLowerCase().includes(query.trim().toLowerCase()))
  const adminEnabledCount = tenants.filter(isAdminEnabled).length
  const totalSeatsLicensed = tenants.reduce((s, t) => s + seatsPerPlan[t.plan], 0)
  const totalSeatsUsed = tenants.reduce((s, t) => s + t.memberCount + t.adminCount, 0)
  const expiringSoon = tenants.filter((t) => {
    const days = Math.round((new Date(licenseExpiry(t)).getTime() - NOW.getTime()) / 86400000)
    return days >= 0 && days <= 30
  }).length

  function copyKey(key: string) {
    navigator.clipboard?.writeText(key).catch(() => {})
    notify({ message: 'License key copied', description: key, type: 'success' })
  }

  function modulesFor(tenant: Tenant): Set<string> {
    return tenantModules[tenant.id] ?? new Set(tenant.featureFlags)
  }

  function toggleModule(tenant: Tenant, mod: ModuleDef) {
    const enabling = !modulesFor(tenant).has(mod.id)
    setTenantModules((prev) => {
      const next = new Set(prev[tenant.id] ?? tenant.featureFlags)
      if (enabling) next.add(mod.id)
      else next.delete(mod.id)
      return { ...prev, [tenant.id]: next }
    })
    notify({ message: `${mod.label} ${enabling ? 'enabled' : 'disabled'}`, description: tenant.displayName, type: enabling ? 'success' : 'warning' })
  }

  const columns: Column<Tenant>[] = [
    {
      header: 'Tenant',
      accessor: (t) => (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: t.brandColor }}>{t.logoInitials}</div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{t.displayName}</p>
            <p className="truncate text-[11px] text-ink-400">{t.domains[0]}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'License key',
      accessor: (t) => (
        <button
          onClick={(e) => { e.stopPropagation(); copyKey(licenseKeyFor(t)) }}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-200 bg-ink-50 px-2 py-1 font-mono text-[11px] text-ink-600 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300"
          title="Copy license key"
        >
          {licenseKeyFor(t)} <Copy className="h-3 w-3" />
        </button>
      ),
    },
    { header: 'Tier', accessor: (t) => <Badge tone="brand" className="capitalize">{t.plan}</Badge> },
    { header: 'Seats (used / licensed)', accessor: (t) => <span className="text-xs text-ink-600 dark:text-ink-300">{(t.memberCount + t.adminCount).toLocaleString()} / {seatsPerPlan[t.plan].toLocaleString()}</span> },
    { header: 'Modules', accessor: (t) => <span className="text-xs text-ink-500">{modulesFor(t).size ? `${modulesFor(t).size} of ${moduleCatalog.length} enabled` : '—'}</span> },
    { header: 'License status', accessor: (t) => <Badge tone={licenseStatusTone[t.status] ?? 'neutral'} dot className="capitalize">{t.status}</Badge> },
    { header: 'Expires', accessor: (t) => <span className="text-xs text-ink-400">{formatDate(licenseExpiry(t))}</span> },
    {
      header: 'Admin access',
      accessor: (t) =>
        isAdminEnabled(t) ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-accent-700 dark:text-accent-300"><ShieldCheck className="h-3.5 w-3.5" /> Enabled</span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-400"><ShieldAlert className="h-3.5 w-3.5" /> Disabled</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Commercial" title="License Management System" description="Issue, track and manage platform licenses for every registered tenant." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Registered tenants" value={tenants.length} icon={<KeyRound className="h-4 w-4" />} />
        <StatCard label="Admin-enabled licenses" value={adminEnabledCount} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Seats used / licensed" value={`${totalSeatsUsed.toLocaleString()} / ${totalSeatsLicensed.toLocaleString()}`} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Expiring within 30 days" value={expiringSoon} deltaTone={expiringSoon > 0 ? 'danger' : 'success'} icon={<RefreshCcw className="h-4 w-4" />} />
      </div>

      <Card>
        <CardHeader title="Registered tenant licenses" />
        <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
          <SearchInput placeholder="Search tenants…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
        </div>
        <DataTable columns={columns} rows={filtered} keyFn={(t) => t.id} onRowClick={(t) => setSelected(t)} />
      </Card>

      <SidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.displayName ?? ''} defaultSize="L">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white" style={{ backgroundColor: selected.brandColor }}>{selected.logoInitials}</div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{selected.legalName}</p>
                <p className="truncate text-xs text-ink-400">{selected.domains[0]}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>

            <div className="rounded-lg border border-ink-200 bg-ink-50 p-3 dark:border-ink-700 dark:bg-ink-900">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">License key</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-ink-800 dark:text-ink-100">{licenseKeyFor(selected)}</span>
                <button onClick={() => copyKey(licenseKeyFor(selected))} className="rounded-md p-1.5 text-ink-400 hover:bg-white hover:text-brand-600 dark:hover:bg-ink-800"><Copy className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[11px] text-ink-400">Tier</p><p className="font-medium capitalize text-ink-800 dark:text-ink-100">{selected.plan}</p></div>
              <div><p className="text-[11px] text-ink-400">Region</p><p className="font-medium text-ink-800 dark:text-ink-100">{selected.region}</p></div>
              <div><p className="text-[11px] text-ink-400">Seats used</p><p className="font-medium text-ink-800 dark:text-ink-100">{(selected.memberCount + selected.adminCount).toLocaleString()}</p></div>
              <div><p className="text-[11px] text-ink-400">Seats licensed</p><p className="font-medium text-ink-800 dark:text-ink-100">{seatsPerPlan[selected.plan].toLocaleString()}</p></div>
              <div><p className="text-[11px] text-ink-400">Issued</p><p className="font-medium text-ink-800 dark:text-ink-100">{formatDate(selected.createdAt)}</p></div>
              <div><p className="text-[11px] text-ink-400">Expires</p><p className="font-medium text-ink-800 dark:text-ink-100">{formatDate(licenseExpiry(selected))}</p></div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">Modules</p>
                <span className="text-[11px] text-ink-400">{modulesFor(selected).size} of {moduleCatalog.length} enabled</span>
              </div>
              {!isAdminEnabled(selected) && (
                <p className="mt-1.5 text-xs text-ink-400">No org admin is provisioned — module toggles are read-only until an admin seat is assigned.</p>
              )}
              <div className="mt-2 divide-y divide-ink-100 rounded-lg border border-ink-200 dark:divide-ink-800 dark:border-ink-700">
                {(['Core', 'Growth', 'Enterprise'] as const).map((tier) => (
                  <div key={tier}>
                    <div className="flex items-center gap-2 bg-ink-50 px-3 py-1.5 dark:bg-ink-800/60">
                      <Badge tone={tierTone[tier]} className="text-[10px]">{tier}</Badge>
                    </div>
                    {moduleCatalog.filter((m) => m.tier === tier).map((mod) => {
                      const on = modulesFor(selected).has(mod.id)
                      return (
                        <div key={mod.id} className="flex items-center gap-3 px-3 py-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                            <mod.icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{mod.label}</p>
                            <p className="truncate text-[11px] text-ink-400">{mod.description}</p>
                          </div>
                          <button
                            onClick={() => toggleModule(selected, mod)}
                            disabled={!isAdminEnabled(selected)}
                            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${on ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'}`}
                          >
                            <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-ink-200 p-3 dark:border-ink-700">
              <div className="flex items-center gap-2 text-sm font-medium text-ink-800 dark:text-ink-100">
                {isAdminEnabled(selected) ? <ShieldCheck className="h-4 w-4 text-accent-600" /> : <ShieldAlert className="h-4 w-4 text-ink-400" />}
                Admin access {isAdminEnabled(selected) ? 'enabled' : 'disabled'}
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {isAdminEnabled(selected)
                  ? `${selected.adminCount} org admin${selected.adminCount === 1 ? '' : 's'} can manage this license.`
                  : 'No org admin is provisioned — license actions are read-only until an admin seat is assigned.'}
              </p>

              {isAdminEnabled(selected) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => notify({ message: 'License renewed', description: `${selected.displayName}'s term was extended.`, type: 'success' })} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200">
                    <RefreshCcw className="h-3.5 w-3.5" /> Renew
                  </button>
                  <button onClick={() => notify({ message: 'License key rotated', description: 'A new license key was generated.', type: 'success' })} className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-200">
                    <KeyRound className="h-3.5 w-3.5" /> Rotate key
                  </button>
                  <button onClick={() => notify({ message: 'License suspended', description: `${selected.displayName}'s access has been suspended.`, type: 'warning' })} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300">
                    <Ban className="h-3.5 w-3.5" /> Suspend
                  </button>
                </div>
              )}
              {!isAdminEnabled(selected) && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-medium text-ink-400 dark:border-ink-700"><Eye className="h-3.5 w-3.5" /> View only</span>
                </div>
              )}
            </div>
          </div>
        )}
      </SidePanel>
    </div>
  )
}

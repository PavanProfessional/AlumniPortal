import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, UserCog, Download, PauseCircle } from 'lucide-react'
import { Card, CardHeader, StatCard, Button, ProgressBar, EmptyState } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { TrendArea } from '../../components/charts/Charts'
import { tenantById } from '../../data/tenants'
import { formatCompact, formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/dates'
import { monthlySeries } from '../../utils/series'

export default function PlatformTenantDetail() {
  const { tenantId } = useParams()
  const tenant = tenantId ? tenantById(tenantId) : undefined
  const [impersonating, setImpersonating] = useState(false)

  if (!tenant) return <EmptyState title="Tenant not found" />

  return (
    <div className="space-y-6">
      <Link to="/platform" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200">
        <ArrowLeft className="h-4 w-4" /> Back to tenants
      </Link>

      {impersonating && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <span className="flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> You are viewing {tenant.displayName} in read-only support mode. This session is fully audited.</span>
          <button onClick={() => setImpersonating(false)} className="font-medium underline">End session</button>
        </div>
      )}

      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white" style={{ backgroundColor: tenant.brandColor }}>{tenant.logoInitials}</div>
            <div>
              <h1 className="font-display text-xl font-bold text-ink-900 dark:text-ink-50">{tenant.displayName}</h1>
              <p className="text-sm text-ink-500 dark:text-ink-400">{tenant.institutionType} · {tenant.domains[0]}</p>
              <div className="mt-2 flex flex-wrap gap-2"><StatusBadge status={tenant.status} /><Badge tone="brand" className="capitalize">{tenant.plan} plan</Badge><Badge>{tenant.region}</Badge></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon={<Download className="h-3.5 w-3.5" />}>Export data</Button>
            <Button variant="outline" size="sm" icon={<PauseCircle className="h-3.5 w-3.5" />}>Suspend</Button>
            <Button size="sm" icon={<UserCog className="h-3.5 w-3.5" />} onClick={() => setImpersonating(true)}>Support session</Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Members" value={formatCompact(tenant.memberCount)} />
        <StatCard label="Admin seats" value={tenant.adminCount} />
        <StatCard label="MRR" value={formatCurrency(tenant.mrr)} />
        <StatCard label="Health score" value={`${tenant.healthScore}/100`} deltaTone={tenant.healthScore > 70 ? 'success' : 'danger'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Member growth" className="border-0 px-0 pt-0" />
          <TrendArea data={monthlySeries(tenant.id.length * 7, tenant.memberCount * 0.6, 0.02, 0.05)} color={tenant.brandColor} />
        </Card>
        <Card className="p-5">
          <CardHeader title="Storage usage" className="border-0 px-0 pt-0" />
          <div className="mt-2">
            <div className="flex justify-between text-xs"><span className="text-ink-500">{tenant.storageUsedGb} GB used</span><span className="text-ink-400">of {tenant.storageLimitGb} GB</span></div>
            <ProgressBar value={(tenant.storageUsedGb / tenant.storageLimitGb) * 100} className="mt-1.5" tone={tenant.storageUsedGb / tenant.storageLimitGb > 0.8 ? 'warning' : 'brand'} />
          </div>
          <div className="mt-5 space-y-2 text-xs">
            <div className="flex justify-between"><span className="text-ink-500">CSM</span><span className="font-medium text-ink-700 dark:text-ink-200">{tenant.csm}</span></div>
            <div className="flex justify-between"><span className="text-ink-500">Created</span><span className="font-medium text-ink-700 dark:text-ink-200">{formatDate(tenant.createdAt)}</span></div>
            {tenant.trialEndsAt && <div className="flex justify-between"><span className="text-ink-500">Trial ends</span><span className="font-medium text-amber-600 dark:text-amber-400">{formatDate(tenant.trialEndsAt)}</span></div>}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <CardHeader title="Feature flags" className="border-0 px-0 pt-0" />
        <div className="flex flex-wrap gap-2">
          {tenant.featureFlags.length === 0 && <p className="text-xs text-ink-400">No flags enabled beyond plan defaults.</p>}
          {tenant.featureFlags.map((f) => <Badge key={f} tone="success">{f.replace(/-/g, ' ')}</Badge>)}
        </div>
      </Card>
    </div>
  )
}

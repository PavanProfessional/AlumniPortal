import { useState } from 'react'
import { CreditCard, TrendingUp } from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { Donut, TrendArea } from '../../components/charts/Charts'
import { tenants } from '../../data/tenants'
import type { Tenant } from '../../types'
import { formatCurrency } from '../../utils/format'
import { monthlySeries } from '../../utils/series'
import { formatDate } from '../../utils/dates'

export default function PlatformBilling() {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const filteredTenants = tenants.filter((t) => t.displayName.toLowerCase().includes(query.trim().toLowerCase()))
  const totalMrr = tenants.reduce((s, t) => s + t.mrr, 0)
  const planBreakdown = ['core', 'growth', 'enterprise'].map((p) => ({ name: p, value: tenants.filter((t) => t.plan === p).length }))

  const columns: Column<Tenant>[] = [
    { header: 'Tenant', accessor: (t) => <span className="font-medium text-ink-800 dark:text-ink-100">{t.displayName}</span> },
    { header: 'Plan', accessor: (t) => <Badge tone="brand" className="capitalize">{t.plan}</Badge> },
    { header: 'MRR', accessor: (t) => formatCurrency(t.mrr) },
    { header: 'Billing status', accessor: (t) => <StatusBadge status={t.status} /> },
    { header: 'Since', accessor: (t) => <span className="text-xs text-ink-400">{formatDate(t.createdAt)}</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Commercial" title="Billing & Plans" description="Subscriptions, usage metering and plan distribution across the platform." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total MRR" value={formatCurrency(totalMrr)} icon={<CreditCard className="h-4 w-4" />} delta="+5.8%" />
        <StatCard label="ARR" value={formatCurrency(totalMrr * 12)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Trial tenants" value={tenants.filter((t) => t.status === 'trial').length} />
        <StatCard label="Past due / grace" value={0} deltaTone="success" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader title="MRR trend" className="border-0 px-0 pt-0" />
          <TrendArea data={monthlySeries(909, totalMrr * 0.6, 0.025, 0.06)} color="#6c5cf5" />
        </Card>
        <Card className="p-5">
          <CardHeader title="Plan distribution" className="border-0 px-0 pt-0" />
          <Donut data={planBreakdown} />
        </Card>
      </div>

      <Card>
        <CardHeader title="Subscriptions" action={<ViewToggle view={view} onChange={setView} />} />
        <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
          <SearchInput placeholder="Search tenants…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
        </div>
        {view === 'table' ? (
          <DataTable columns={columns} rows={filteredTenants} keyFn={(t) => t.id} />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTenants.map((t) => (
              <Card key={t.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{t.displayName}</p>
                  <StatusBadge status={t.status} />
                </div>
                <Badge tone="brand" className="mt-2 capitalize">{t.plan}</Badge>
                <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs dark:border-ink-800">
                  <span className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{formatCurrency(t.mrr)}</span>
                  <span className="text-ink-400">Since {formatDate(t.createdAt)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

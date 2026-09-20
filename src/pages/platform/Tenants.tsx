import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, PlusCircle } from 'lucide-react'
import { SectionHeading, SearchInput, Chip, StatCard, Button, Card } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { tenants } from '../../data/tenants'
import type { Tenant, TenantStatus } from '../../types'
import { formatCompact, formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/dates'

const statuses: (TenantStatus | 'All')[] = ['All', 'trial', 'active', 'suspended', 'archived']

export default function PlatformTenants() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof statuses)[number]>('All')
  const [view, setView] = useState<ViewMode>('table')

  const filtered = useMemo(() => tenants.filter((t) => {
    if (status !== 'All' && t.status !== status) return false
    if (!query) return true
    return t.displayName.toLowerCase().includes(query.toLowerCase())
  }), [query, status])

  const totalMrr = tenants.reduce((s, t) => s + t.mrr, 0)
  const totalMembers = tenants.reduce((s, t) => s + t.memberCount, 0)

  const columns: Column<Tenant>[] = [
    { header: 'Tenant', accessor: (t) => (
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: t.brandColor }}>{t.logoInitials}</div>
        <div className="min-w-0"><p className="truncate font-medium text-ink-800 dark:text-ink-100">{t.displayName}</p><p className="text-xs text-ink-400">{t.institutionType} · {t.region}</p></div>
      </div>
    ) },
    { header: 'Plan', accessor: (t) => <Badge tone="brand" className="capitalize">{t.plan}</Badge> },
    { header: 'Members', accessor: (t) => formatCompact(t.memberCount) },
    { header: 'MRR', accessor: (t) => formatCurrency(t.mrr) },
    { header: 'Health', accessor: (t) => <Badge tone={t.healthScore > 70 ? 'success' : t.healthScore > 40 ? 'warning' : 'danger'}>{t.healthScore}/100</Badge> },
    { header: 'CSM', accessor: (t) => <span className="text-xs text-ink-500">{t.csm}</span> },
    { header: 'Created', accessor: (t) => <span className="text-xs text-ink-400">{formatDate(t.createdAt)}</span> },
    { header: 'Status', accessor: (t) => <StatusBadge status={t.status} /> },
  ]

  const cardPagination = usePagination(filtered, 9)

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="SaaS operations" title="Tenants" description="Provision, monitor and support every institution on the platform." action={<Button icon={<PlusCircle className="h-3.5 w-3.5" />}>Provision tenant</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total tenants" value={tenants.length} icon={<Building2 className="h-4 w-4" />} />
        <StatCard label="Active" value={tenants.filter((t) => t.status === 'active').length} />
        <StatCard label="Total MRR" value={formatCurrency(totalMrr)} delta="+5.8%" />
        <StatCard label="Members under management" value={formatCompact(totalMembers)} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search tenants…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">{statuses.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === 'All' ? 'All statuses' : s}</Chip>)}</div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <DataTable columns={columns} rows={filtered} keyFn={(t) => t.id} onRowClick={(t) => navigate(`/platform/tenants/${t.id}`)} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardPagination.pageItems.map((t) => (
              <div key={t.id} onClick={() => navigate(`/platform/tenants/${t.id}`)} className="cursor-pointer">
                <Card className="h-full p-5 transition-shadow hover:shadow-card">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: t.brandColor }}>{t.logoInitials}</div>
                      <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{t.displayName}</p><p className="truncate text-xs text-ink-400">{t.institutionType} · {t.region}</p></div>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3 text-center text-xs dark:border-ink-800">
                    <div><p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{formatCompact(t.memberCount)}</p><p className="text-[10px] text-ink-400">Members</p></div>
                    <div><p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{formatCurrency(t.mrr)}</p><p className="text-[10px] text-ink-400">MRR</p></div>
                    <div><p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{t.healthScore}</p><p className="text-[10px] text-ink-400">Health</p></div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
          <Card className="p-0">
            <Pagination
              page={cardPagination.page} totalPages={cardPagination.totalPages} onPageChange={cardPagination.setPage}
              pageSize={cardPagination.pageSize} onPageSizeChange={cardPagination.setPageSize}
              totalItems={cardPagination.totalItems} startIndex={cardPagination.startIndex} endIndex={cardPagination.endIndex}
              pageSizeOptions={[9, 18]}
            />
          </Card>
        </>
      )}
    </div>
  )
}

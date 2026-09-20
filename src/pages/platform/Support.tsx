import { useMemo, useState } from 'react'
import { LifeBuoy } from 'lucide-react'
import { SectionHeading, Card, SearchInput, Chip, StatCard } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { supportTickets } from '../../data/support'
import { tenantById } from '../../data/tenants'
import type { SupportTicket } from '../../types'
import { formatRelative } from '../../utils/dates'

const tiers = ['All', 'Tier 1', 'Tier 2', 'Tier 3', 'Critical'] as const

export default function PlatformSupport() {
  const [query, setQuery] = useState('')
  const [tier, setTier] = useState<(typeof tiers)[number]>('All')
  const [view, setView] = useState<ViewMode>('table')

  const filtered = useMemo(() => supportTickets.filter((t) => {
    if (tier !== 'All' && t.tier !== tier) return false
    if (!query) return true
    return t.subject.toLowerCase().includes(query.toLowerCase())
  }), [query, tier])

  const columns: Column<SupportTicket>[] = [
    { header: 'Subject', accessor: (t) => <span className="font-medium text-ink-800 dark:text-ink-100">{t.subject}</span> },
    { header: 'Tenant', accessor: (t) => <span className="text-xs text-ink-500">{tenantById(t.tenantId)?.displayName}</span> },
    { header: 'Tier', accessor: (t) => <Badge tone={t.tier === 'Critical' ? 'danger' : 'neutral'}>{t.tier}</Badge> },
    { header: 'Priority', accessor: (t) => <Badge tone={t.priority === 'Urgent' ? 'danger' : t.priority === 'High' ? 'warning' : 'neutral'}>{t.priority}</Badge> },
    { header: 'Assignee', accessor: (t) => <span className="text-xs text-ink-400">{t.assignee ?? 'Unassigned'}</span> },
    { header: 'Updated', accessor: (t) => <span className="text-xs text-ink-400">{formatRelative(t.updatedAt)}</span> },
    { header: 'Status', accessor: (t) => <StatusBadge status={t.status} /> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Customer success" title="Support" description="Tickets never bypass tenant authorization, even during support sessions." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Open tickets" value={supportTickets.filter((t) => !['resolved', 'closed'].includes(t.status)).length} icon={<LifeBuoy className="h-4 w-4" />} />
        <StatCard label="Critical" value={supportTickets.filter((t) => t.tier === 'Critical').length} deltaTone="danger" />
        <StatCard label="Avg. first response" value="2.4h" />
        <StatCard label="CSAT" value="4.7 / 5" deltaTone="success" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search tickets…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">{tiers.map((t) => <Chip key={t} active={tier === t} onClick={() => setTier(t)}>{t}</Chip>)}</div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <Card><DataTable columns={columns} rows={filtered} keyFn={(t) => t.id} /></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{t.subject}</p>
                <StatusBadge status={t.status} />
              </div>
              <p className="mt-1 text-xs text-ink-400">{tenantById(t.tenantId)?.displayName}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone={t.tier === 'Critical' ? 'danger' : 'neutral'}>{t.tier}</Badge>
                <Badge tone={t.priority === 'Urgent' ? 'danger' : t.priority === 'High' ? 'warning' : 'neutral'}>{t.priority}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-400 dark:border-ink-800">
                <span>{t.assignee ?? 'Unassigned'}</span>
                <span>{formatRelative(t.updatedAt)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

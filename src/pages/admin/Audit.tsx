import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { SectionHeading, Card, SearchInput, Chip, Button } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { auditEvents } from '../../data/audit'
import type { AuditEvent } from '../../types'
import { formatDateTime } from '../../utils/dates'

const categories: (AuditEvent['category'] | 'All')[] = ['All', 'security', 'data', 'access', 'billing', 'export', 'config']

export default function AdminAudit() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<(typeof categories)[number]>('All')
  const [view, setView] = useState<ViewMode>('table')

  const filtered = useMemo(() => auditEvents.filter((a) => {
    if (category !== 'All' && a.category !== category) return false
    if (!query) return true
    return `${a.actor} ${a.action} ${a.resource}`.toLowerCase().includes(query.toLowerCase())
  }), [query, category])

  const cardPagination = usePagination(filtered, 12)

  const columns: Column<AuditEvent>[] = [
    { header: 'Actor', accessor: (a) => <div><p className="font-medium text-ink-800 dark:text-ink-100">{a.actor}</p><p className="text-xs text-ink-400">{a.actorRole}</p></div> },
    { header: 'Action', accessor: (a) => <span className="font-mono text-xs">{a.action}</span> },
    { header: 'Resource', accessor: (a) => <span className="text-xs text-ink-500">{a.resource}</span> },
    { header: 'Category', accessor: (a) => <Badge>{a.category}</Badge> },
    { header: 'Outcome', accessor: (a) => <Badge tone={a.outcome === 'success' ? 'success' : 'danger'}>{a.outcome}</Badge> },
    { header: 'IP', accessor: (a) => <span className="font-mono text-xs text-ink-400">{a.ip}</span> },
    { header: 'Timestamp', accessor: (a) => <span className="text-xs text-ink-400">{formatDateTime(a.timestamp)}</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Trust & compliance" title="Audit Log" description="Every sensitive action is captured with actor, resource and outcome." action={<Button variant="outline" icon={<Download className="h-3.5 w-3.5" />}>Export log</Button>} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search by actor, action, resource…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">{categories.map((c) => <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{c === 'All' ? 'All categories' : c}</Chip>)}</div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <Card><DataTable columns={columns} rows={filtered} keyFn={(a) => a.id} /></Card>
      ) : (
        <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cardPagination.pageItems.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{a.actor}</p>
                  <p className="text-xs text-ink-400">{a.actorRole}</p>
                </div>
                <Badge tone={a.outcome === 'success' ? 'success' : 'danger'}>{a.outcome}</Badge>
              </div>
              <p className="mt-2 font-mono text-xs text-ink-600 dark:text-ink-300">{a.action}</p>
              <p className="mt-1 truncate text-xs text-ink-400">{a.resource}</p>
              <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5 text-[11px] text-ink-400 dark:border-ink-800">
                <Badge className="text-[10px]">{a.category}</Badge>
                <span>{formatDateTime(a.timestamp)}</span>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-0">
          <Pagination
            page={cardPagination.page} totalPages={cardPagination.totalPages} onPageChange={cardPagination.setPage}
            pageSize={cardPagination.pageSize} onPageSizeChange={cardPagination.setPageSize}
            totalItems={cardPagination.totalItems} startIndex={cardPagination.startIndex} endIndex={cardPagination.endIndex}
            pageSizeOptions={[12, 24, 48]}
          />
        </Card>
        </>
      )}
    </div>
  )
}

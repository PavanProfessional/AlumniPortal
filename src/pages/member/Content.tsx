import { useMemo, useState } from 'react'
import { Newspaper, Eye } from 'lucide-react'
import { SectionHeading, Card, Chip, EmptyState, SearchInput } from '../../components/ui/Primitives'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { content } from '../../data/content'
import { formatDate } from '../../utils/dates'
import { formatCompact } from '../../utils/format'
import type { ContentItem } from '../../types'

const types = ['All', 'Announcement', 'News', 'Story', 'Resource', 'FAQ'] as const

export default function MemberContent() {
  const [type, setType] = useState<(typeof types)[number]>('All')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('card')
  const published = useMemo(
    () => content.filter((c) => c.state === 'published' && (type === 'All' || c.type === type) && c.title.toLowerCase().includes(query.trim().toLowerCase())),
    [type, query],
  )
  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex } = usePagination(published, 9)

  const columns: Column<ContentItem>[] = [
    { header: 'Content', accessor: (c) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: c.coverColor }} />
        <p className="truncate font-medium text-ink-800 dark:text-ink-100">{c.title}</p>
      </div>
    ) },
    { header: 'Type', accessor: (c) => <Badge tone="brand">{c.type}</Badge> },
    { header: 'Published', accessor: (c) => <span className="text-xs text-ink-400">{formatDate(c.publishedAt ?? c.updatedAt)}</span> },
    { header: 'Views', accessor: (c) => <span className="flex items-center gap-1 text-xs"><Eye className="h-3 w-3" /> {formatCompact(c.views)}</span> },
    { header: 'Status', accessor: (c) => <StatusBadge status={c.state} /> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Stay in the loop" title="News & Content" description="Announcements, stories and resources from your institution." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search content…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">{types.map((t) => <Chip key={t} active={type === t} onClick={() => { setType(t); setPage(1) }}>{t}</Chip>)}</div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {published.length === 0 ? (
        <EmptyState icon={<Newspaper className="h-5 w-5" />} title="Nothing published yet" />
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={published} keyFn={(c) => c.id} defaultPageSize={9} pageSizeOptions={[9, 18, 27]} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((c) => (
              <Card key={c.id} className="overflow-hidden transition-shadow hover:shadow-card">
                <div className="h-28" style={{ background: `linear-gradient(135deg, ${c.coverColor}, ${c.coverColor}99)` }} />
                <div className="p-5">
                  <Badge tone="brand" className="mb-2">{c.type}</Badge>
                  <p className="text-sm font-semibold leading-snug text-ink-900 dark:text-ink-50">{c.title}</p>
                  <p className="mt-1.5 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">{c.summary}</p>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-ink-400">
                    <span>{formatDate(c.publishedAt ?? c.updatedAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatCompact(c.views)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-0">
            <Pagination
              page={page} totalPages={totalPages} onPageChange={setPage}
              pageSize={pageSize} onPageSizeChange={setPageSize}
              totalItems={totalItems} startIndex={startIndex} endIndex={endIndex}
              pageSizeOptions={[9, 18, 27]}
            />
          </Card>
        </>
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, MapPin, Users, Video } from 'lucide-react'
import { SectionHeading, Card, Chip, EmptyState, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { events, myRegistrations } from '../../data/events'
import { formatDate } from '../../utils/dates'
import { eventTypesRef } from '../../data/reference'
import type { EventItem } from '../../types'

const filters = ['All', 'Upcoming', 'My registrations', 'Past'] as const

export default function MemberEvents() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof filters)[number]>('Upcoming')
  const [type, setType] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('card')
  const myEventIds = new Set(myRegistrations.map((r) => r.eventId))

  const filtered = useMemo(() => {
    const now = new Date()
    return events.filter((e) => {
      if (type && e.type !== type) return false
      if (query && !e.title.toLowerCase().includes(query.trim().toLowerCase())) return false
      if (filter === 'Upcoming') return new Date(e.startAt) >= now && e.status !== 'cancelled' && e.status !== 'draft'
      if (filter === 'Past') return new Date(e.startAt) < now
      if (filter === 'My registrations') return myEventIds.has(e.id)
      return e.status !== 'draft'
    }).sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt))
  }, [filter, type, query])

  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex } = usePagination(filtered, 9)

  const columns: Column<EventItem>[] = [
    { header: 'Event', accessor: (e) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: e.coverColor }} />
        <div className="min-w-0"><p className="truncate font-medium text-ink-800 dark:text-ink-100">{e.title}</p><p className="text-xs text-ink-400">{e.type}</p></div>
      </div>
    ) },
    { header: 'Date', accessor: (e) => <span className="text-xs">{formatDate(e.startAt)}</span> },
    { header: 'Mode', accessor: (e) => <span className="text-xs">{e.mode === 'In-person' ? e.venue : e.mode}</span> },
    { header: 'Capacity', accessor: (e) => <span className="text-xs">{e.registeredCount}/{e.capacity}</span> },
    { header: 'Status', accessor: (e) => <StatusBadge status={e.status} /> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Stay connected" title="Events" description="Reunions, webinars, workshops and networking — all in one calendar." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-ink-100 pt-3 dark:border-ink-800">
            {eventTypesRef.map((t) => <Chip key={t} active={type === t} onClick={() => setType((v) => (v === t ? null : t))}>{t}</Chip>)}
          </div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No events found" description="Try a different filter or check back soon for new events." />
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={filtered} keyFn={(e) => e.id} onRowClick={(e) => navigate(`/app/events/${e.id}`)} defaultPageSize={9} pageSizeOptions={[9, 18, 27]} />
      ) : (
        <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((e) => (
            <Link key={e.id} to={`/app/events/${e.id}`}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-card">
                <div className="flex h-28 items-end justify-between p-4" style={{ background: `linear-gradient(135deg, ${e.coverColor}, ${e.coverColor}cc)` }}>
                  <span className="rounded-md bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">{e.type}</span>
                  {myEventIds.has(e.id) && <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-ink-800">Registered</span>}
                </div>
                <div className="p-5">
                  <p className="text-sm font-semibold leading-snug text-ink-900 dark:text-ink-50">{e.title}</p>
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(e.startAt, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400">
                    {e.mode === 'Virtual' ? <Video className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />} {e.mode === 'In-person' ? e.venue : e.mode}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-ink-400"><Users className="h-3.5 w-3.5" /> {e.registeredCount}/{e.capacity}</span>
                    <StatusBadge status={e.status} />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
        <Card className="p-0">
          <Pagination
            page={page} totalPages={totalPages} onPageChange={setPage}
            pageSize={pageSize} onPageSizeChange={setPageSize}
            totalItems={totalItems} startIndex={startIndex} endIndex={endIndex}
            pageSizeOptions={[9, 18, 27, 54]}
          />
        </Card>
        </>
      )}
    </div>
  )
}

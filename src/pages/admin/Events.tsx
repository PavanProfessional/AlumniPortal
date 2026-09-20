import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarPlus, Users, MapPin, CalendarDays } from 'lucide-react'
import { SectionHeading, SearchInput, Chip, Button, Card } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { SidePanel } from '../../components/ui/SidePanel'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../components/ui/Toast'
import { events } from '../../data/events'
import type { EventItem, EventLifecycle } from '../../types'
import { formatDate } from '../../utils/dates'

const statuses: (EventLifecycle | 'All')[] = ['All', 'draft', 'published', 'registration_open', 'live', 'completed', 'cancelled']

export default function AdminEvents() {
  const navigate = useNavigate()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof statuses)[number]>('All')
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<ViewMode>('table')

  function saveDraft() {
    setOpen(false)
    notify({ message: 'Event saved as draft', description: 'Publish it from the event detail page when ready.', type: 'success', position: 'top-right' })
  }

  const filtered = useMemo(() => events.filter((e) => {
    if (status !== 'All' && e.status !== status) return false
    if (!query) return true
    return e.title.toLowerCase().includes(query.toLowerCase())
  }), [query, status])

  const columns: Column<EventItem>[] = [
    { header: 'Event', accessor: (e) => (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: e.coverColor }} />
        <div className="min-w-0"><p className="truncate font-medium text-ink-800 dark:text-ink-100">{e.title}</p><p className="text-xs text-ink-400">{e.type}</p></div>
      </div>
    ) },
    { header: 'Date', accessor: (e) => <span className="text-xs">{formatDate(e.startAt)}</span> },
    { header: 'Mode', accessor: (e) => <span className="flex items-center gap-1 text-xs"><MapPin className="h-3 w-3" /> {e.mode}</span> },
    { header: 'Registrations', accessor: (e) => <span className="flex items-center gap-1 text-xs"><Users className="h-3 w-3" /> {e.registeredCount}/{e.capacity}</span> },
    { header: 'Waitlist', accessor: (e) => e.waitlistCount || '—' },
    { header: 'Status', accessor: (e) => <StatusBadge status={e.status} /> },
  ]

  const cardPagination = usePagination(filtered, 9)

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Engagement" title="Events" description="Manage the full event lifecycle from draft through post-event reporting." action={<Button icon={<CalendarPlus className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>Create event</Button>} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search events…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">{statuses.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === 'All' ? 'All statuses' : s.replace(/_/g, ' ')}</Chip>)}</div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === 'table' ? (
        <DataTable columns={columns} rows={filtered} keyFn={(e) => e.id} onRowClick={(e) => navigate(`/admin/events/${e.id}`)} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cardPagination.pageItems.map((e) => (
              <div key={e.id} onClick={() => navigate(`/admin/events/${e.id}`)} className="cursor-pointer">
                <Card className="h-full overflow-hidden transition-shadow hover:shadow-card">
                  <div className="flex h-24 items-end justify-between p-4" style={{ background: `linear-gradient(135deg, ${e.coverColor}, ${e.coverColor}cc)` }}>
                    <span className="rounded-md bg-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">{e.type}</span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-semibold leading-snug text-ink-900 dark:text-ink-50">{e.title}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400"><CalendarDays className="h-3.5 w-3.5" /> {formatDate(e.startAt)}</p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400"><MapPin className="h-3.5 w-3.5" /> {e.mode === 'In-person' ? e.venue : e.mode}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs text-ink-400"><Users className="h-3.5 w-3.5" /> {e.registeredCount}/{e.capacity}</span>
                      <StatusBadge status={e.status} />
                    </div>
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
              pageSizeOptions={[9, 18, 27]}
            />
          </Card>
        </>
      )}

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="Create event"
        description="New events start as drafts until you publish them."
        defaultSize="M"
        footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={saveDraft}>Save as draft</Button></>}
      >
        <div className="space-y-4">
          <FormRow label="Event title" placeholder="e.g. Homecoming Weekend 2027" />
          <div className="grid grid-cols-2 gap-4">
            <SelectRow label="Event type" options={['Reunion', 'Webinar', 'Workshop', 'Networking', 'Campus Event', 'Career Event', 'Mentoring Event', 'Fundraising Event']} />
            <SelectRow label="Mode" options={['In-person', 'Virtual', 'Hybrid']} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormRow label="Start date & time" type="datetime-local" />
            <FormRow label="Capacity" type="number" placeholder="250" />
          </div>
          <FormRow label="Venue / meeting link" placeholder="KLE Tech Main Campus" />
        </div>
      </SidePanel>
    </div>
  )
}

function FormRow({ label, placeholder, type = 'text' }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}</label>
      <input type={type} placeholder={placeholder} className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
    </div>
  )
}

function SelectRow({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}</label>
      <select className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

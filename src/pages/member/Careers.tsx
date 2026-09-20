import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, MapPin, Bookmark, Clock, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SectionHeading, Card, SearchInput, Chip, EmptyState } from '../../components/ui/Primitives'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { jobs, myApplications, savedJobIds } from '../../data/careers'
import { formatRelative } from '../../utils/dates'
import type { JobPosting } from '../../types'

const filters = ['All jobs', 'Saved', 'My applications'] as const

export default function MemberCareers() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<(typeof filters)[number]>('All jobs')
  const [view, setView] = useState<ViewMode>('card')
  const appliedIds = new Set(myApplications.map((a) => a.jobId))

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((j) => {
      if (j.status !== 'published') return false
      if (filter === 'Saved' && !savedJobIds.includes(j.id)) return false
      if (filter === 'My applications' && !appliedIds.has(j.id)) return false
      if (!q) return true
      return `${j.title} ${j.employer} ${j.skills.join(' ')}`.toLowerCase().includes(q)
    })
  }, [query, filter])

  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex } = usePagination(filtered, 10)

  const columns: Column<JobPosting>[] = [
    { header: 'Job', accessor: (j) => <div><p className="font-medium text-ink-800 dark:text-ink-100">{j.title}</p><p className="text-xs text-ink-400">{j.employer}</p></div> },
    { header: 'Location', accessor: (j) => <span className="text-xs">{j.location} · {j.remoteMode}</span> },
    { header: 'Type', accessor: (j) => <Badge tone="brand">{j.employmentType}</Badge> },
    { header: 'Posted', accessor: (j) => <span className="text-xs text-ink-400">{formatRelative(j.postedAt)}</span> },
    { header: 'Status', accessor: (j) => appliedIds.has(j.id) ? <StatusBadge status={myApplications.find((a) => a.jobId === j.id)?.status ?? 'submitted'} /> : <span className="text-xs text-ink-400">Not applied</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Careers" title="Jobs & Opportunities" description="Roles shared by alumni employers, with explainable matching to your profile." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search jobs, companies, skills…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">{filters.map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}</div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Briefcase className="h-5 w-5" />} title="No jobs found" description="Try a different search or check back later for new postings." />
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={filtered} keyFn={(j) => j.id} onRowClick={(j) => navigate(`/app/careers/${j.id}`)} defaultPageSize={10} />
      ) : (
        <div className="space-y-3">
          {pageItems.map((j) => {
            const applied = appliedIds.has(j.id)
            const app = myApplications.find((a) => a.jobId === j.id)
            return (
              <Link key={j.id} to={`/app/careers/${j.id}`}>
                <Card className="flex flex-col gap-4 p-5 transition-shadow hover:shadow-card sm:flex-row sm:items-center">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-sm font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">{j.employerLogo}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{j.title}</p>
                      {savedJobIds.includes(j.id) && <Bookmark className="h-3.5 w-3.5 shrink-0 fill-brand-500 text-brand-500" />}
                    </div>
                    <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{j.employer} · {j.location} · {j.remoteMode}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {j.skills.slice(0, 3).map((s) => <Badge key={s} className="text-[10px]">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-start gap-1.5 sm:items-end">
                    {applied ? <Badge tone="info">{app?.status.replace(/_/g, ' ')}</Badge> : <Badge tone="brand">{j.employmentType}</Badge>}
                    <span className="flex items-center gap-1 text-[11px] text-ink-400"><Clock className="h-3 w-3" /> {formatRelative(j.postedAt)}</span>
                    {j.salaryVisible && j.salaryRange && <span className="text-xs font-medium text-ink-600 dark:text-ink-300">{j.salaryRange}</span>}
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {filtered.length > 0 && view === 'card' && (
        <Card className="p-0">
          <Pagination
            page={page} totalPages={totalPages} onPageChange={setPage}
            pageSize={pageSize} onPageSizeChange={setPageSize}
            totalItems={totalItems} startIndex={startIndex} endIndex={endIndex}
          />
        </Card>
      )}

      <Card className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400"><Sparkles className="h-5 w-5" /></div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">Turn on job alerts</p>
          <p className="text-xs text-ink-500 dark:text-ink-400">Get notified when roles matching your skills and location are posted.</p>
        </div>
      </Card>
      <p className="flex items-center gap-1 text-xs text-ink-400"><MapPin className="h-3 w-3" /> Showing roles across all locations</p>
    </div>
  )
}

import { useState } from 'react'
import { Briefcase, Check, X, TrendingUp, MapPin } from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard, Button, EmptyState, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { ComparisonBars } from '../../components/charts/Charts'
import { useToast } from '../../components/ui/Toast'
import { jobs, applications } from '../../data/careers'
import type { JobPosting } from '../../types'
import { formatDate } from '../../utils/dates'
import { skillsPool } from '../../data/reference'
import { makeRng } from '../../utils/random'

const tabs = [{ key: 'jobs', label: 'All jobs' }, { key: 'review', label: 'Pending review' }, { key: 'analytics', label: 'Analytics' }]

export default function AdminCareers() {
  const notify = useToast()
  const [tab, setTab] = useState('jobs')
  const [decided, setDecided] = useState<Set<string>>(new Set())
  const [reviewQuery, setReviewQuery] = useState('')
  const pendingAll = jobs.filter((j) => j.status === 'pending_review' && !decided.has(j.id))
  const pending = pendingAll.filter((j) => `${j.title} ${j.employer}`.toLowerCase().includes(reviewQuery.trim().toLowerCase()))
  const pendingPagination = usePagination(pending, 5)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const filteredJobs = jobs.filter((j) => `${j.title} ${j.employer} ${j.location}`.toLowerCase().includes(query.trim().toLowerCase()))
  const jobsCardPagination = usePagination(filteredJobs, 9)

  function decide(job: JobPosting, outcome: 'approved' | 'rejected') {
    setDecided((prev) => new Set(prev).add(job.id))
    notify({
      message: outcome === 'approved' ? `"${job.title}" approved` : `"${job.title}" rejected`,
      type: outcome === 'approved' ? 'success' : 'error',
      position: 'bottom-left',
    })
  }

  const columns: Column<JobPosting>[] = [
    { header: 'Job', accessor: (j) => <div><p className="font-medium text-ink-800 dark:text-ink-100">{j.title}</p><p className="text-xs text-ink-400">{j.employer}</p></div> },
    { header: 'Location', accessor: (j) => <span className="text-xs">{j.location}</span> },
    { header: 'Type', accessor: (j) => j.employmentType },
    { header: 'Applicants', accessor: (j) => j.applicantCount },
    { header: 'Posted', accessor: (j) => <span className="text-xs text-ink-400">{formatDate(j.postedAt)}</span> },
    { header: 'Status', accessor: (j) => <StatusBadge status={j.status} /> },
  ]

  const rng = makeRng(555)
  const topSkills = rng.pickMany(skillsPool, 6).map((s) => ({ name: s, value: rng.int(20, 140) })).sort((a, b) => b.value - a.value)

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Opportunities" title="Careers" description="Moderate job postings and track referral and placement performance." />
      <Tabs tabs={[tabs[0], { ...tabs[1], count: pendingAll.length }, tabs[2]]} active={tab} onChange={setTab} />

      {tab === 'jobs' && (
        <Card>
          <CardHeader title="All job postings" action={<ViewToggle view={view} onChange={setView} />} />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search jobs by title, employer, location…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          {view === 'table' ? (
            <DataTable columns={columns} rows={filteredJobs} keyFn={(j) => j.id} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {jobsCardPagination.pageItems.map((j) => (
                  <Card key={j.id} className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">{j.employerLogo}</div>
                      <StatusBadge status={j.status} />
                    </div>
                    <p className="mt-2 truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{j.title}</p>
                    <p className="truncate text-xs text-ink-400">{j.employer}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400"><MapPin className="h-3 w-3" /> {j.location}</p>
                    <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs dark:border-ink-800">
                      <Badge>{j.employmentType}</Badge>
                      <span className="text-ink-400">{j.applicantCount} applicants</span>
                    </div>
                  </Card>
                ))}
              </div>
              <Card className="p-0">
                <Pagination
                  page={jobsCardPagination.page} totalPages={jobsCardPagination.totalPages} onPageChange={jobsCardPagination.setPage}
                  pageSize={jobsCardPagination.pageSize} onPageSizeChange={jobsCardPagination.setPageSize}
                  totalItems={jobsCardPagination.totalItems} startIndex={jobsCardPagination.startIndex} endIndex={jobsCardPagination.endIndex}
                  pageSizeOptions={[9, 18]}
                />
              </Card>
            </>
          )}
        </Card>
      )}

      {tab === 'review' && (
        pendingAll.length === 0 ? <EmptyState icon={<Briefcase className="h-5 w-5" />} title="Nothing pending review" /> : (
          <>
          <SearchInput placeholder="Search pending jobs…" value={reviewQuery} onChange={(e) => setReviewQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="space-y-3">
            {pendingPagination.pageItems.map((j) => (
              <Card key={j.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{j.title}</p>
                  <p className="text-xs text-ink-400">{j.employer} · {j.location} · {j.employmentType}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={() => decide(j, 'approved')}>Approve</Button>
                  <Button variant="danger" size="sm" icon={<X className="h-3.5 w-3.5" />} onClick={() => decide(j, 'rejected')}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
          <Card className="p-0">
            <Pagination
              page={pendingPagination.page} totalPages={pendingPagination.totalPages} onPageChange={pendingPagination.setPage}
              pageSize={pendingPagination.pageSize} onPageSizeChange={pendingPagination.setPageSize}
              totalItems={pendingPagination.totalItems} startIndex={pendingPagination.startIndex} endIndex={pendingPagination.endIndex}
              pageSizeOptions={[5, 10, 25]}
            />
          </Card>
          </>
        )
      )}

      {tab === 'analytics' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatCard label="Total applications" value={applications.length} icon={<TrendingUp className="h-4 w-4" />} />
          <StatCard label="Referral rate" value="31%" delta="+4pt" />
          <StatCard label="Avg. time to hire" value="18 days" />
          <Card className="p-5 lg:col-span-3">
            <CardHeader title="Top in-demand skills" className="border-0 px-0 pt-0" />
            <ComparisonBars data={topSkills} layout="vertical" color="#e6a23c" height={260} />
          </Card>
        </div>
      )}
    </div>
  )
}

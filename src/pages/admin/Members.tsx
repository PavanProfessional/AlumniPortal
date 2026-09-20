import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, Tag, UploadCloud, CheckCircle2, UserPlus, MapPin, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionHeading, SearchInput, Chip, Avatar, Button, Card } from '../../components/ui/Primitives'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { useToast } from '../../components/ui/Toast'
import { alumniPeople } from '../../data/alumniPeople'
import type { Person } from '../../types'
import { formatRelative } from '../../utils/dates'

const statusFilters = ['All', 'active', 'pending', 'invited', 'suspended'] as const
const verificationFilters = ['All', 'institution-verified', 'self-verified', 'unverified', 'disputed'] as const

export default function AdminMembers() {
  const navigate = useNavigate()
  const notify = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof statusFilters)[number]>('All')
  const [verification, setVerification] = useState<(typeof verificationFilters)[number]>('All')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [view, setView] = useState<ViewMode>('table')

  function bulkAction(action: 'tag' | 'verify' | 'export') {
    const count = selected.size
    setSelected(new Set())
    if (action === 'tag') notify({ message: `Tag added to ${count} member${count === 1 ? '' : 's'}`, type: 'success', position: 'bottom-left' })
    if (action === 'verify') notify({ message: `${count} member${count === 1 ? '' : 's'} marked verified`, type: 'success', position: 'bottom-left' })
    if (action === 'export') notify({ message: `Exporting ${count} record${count === 1 ? '' : 's'}`, description: 'A download link will be emailed when ready.', type: 'info', position: 'bottom-left' })
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return alumniPeople.filter((p) => {
      if (status !== 'All' && p.status !== status) return false
      if (verification !== 'All' && p.verification !== verification) return false
      if (!q) return true
      return `${p.firstName} ${p.lastName} ${p.email} ${p.location}`.toLowerCase().includes(q)
    })
  }, [query, status, verification])

  const columns: Column<Person>[] = [
    {
      header: 'Member',
      accessor: (p) => (
        <div className="flex items-center gap-3">
          <Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="sm" />
          <div className="min-w-0">
            <p className="truncate font-medium text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</p>
            <p className="truncate text-xs text-ink-400">{p.email}</p>
          </div>
        </div>
      ),
    },
    { header: 'Batch', accessor: (p) => p.academicRecords[0]?.batch ?? '—' },
    { header: 'Location', accessor: (p) => <span className="text-xs">{p.location}</span> },
    { header: 'Verification', accessor: (p) => <StatusBadge status={p.verification} /> },
    { header: 'Status', accessor: (p) => <StatusBadge status={p.status} /> },
    { header: 'Engagement', accessor: (p) => <Badge tone={p.engagementScore >= 70 ? 'success' : p.engagementScore >= 40 ? 'warning' : 'neutral'}>{p.engagementScore}</Badge> },
    { header: 'Last active', accessor: (p) => <span className="text-xs text-ink-400">{formatRelative(p.lastActiveAt)}</span> },
  ]

  const cardPagination = usePagination(filtered, 12)

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Alumni relations"
        title="Members"
        description={`${filtered.length.toLocaleString()} of ${alumniPeople.length.toLocaleString()} alumni records shown`}
        action={
          <>
            <Button variant="outline" icon={<UploadCloud className="h-3.5 w-3.5" />} onClick={() => navigate('/admin/import')}>Import</Button>
            <Button icon={<UserPlus className="h-3.5 w-3.5" />}>Add member</Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search members by name, email, location…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((s) => <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{s === 'All' ? 'All statuses' : s}</Chip>)}
          </div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>
      <div className="flex flex-wrap gap-2">
        {verificationFilters.map((v) => <Chip key={v} active={verification === v} onClick={() => setVerification(v)}>{v === 'All' ? 'All verification' : v.replace(/-/g, ' ')}</Chip>)}
      </div>

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm dark:border-brand-500/30 dark:bg-brand-500/10">
          <span className="font-medium text-brand-700 dark:text-brand-300">{selected.size} selected</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" icon={<Tag className="h-3.5 w-3.5" />} onClick={() => bulkAction('tag')}>Add tag</Button>
            <Button size="sm" variant="outline" icon={<CheckCircle2 className="h-3.5 w-3.5" />} onClick={() => bulkAction('verify')}>Verify</Button>
            <Button size="sm" variant="outline" icon={<Download className="h-3.5 w-3.5" />} onClick={() => bulkAction('export')}>Export</Button>
          </div>
        </div>
      )}

      {view === 'table' ? (
        <DataTable
          columns={columns}
          rows={filtered}
          keyFn={(p) => p.id}
          onRowClick={(p) => navigate(`/admin/members/${p.id}`)}
          selectable
          selected={selected}
          onToggleSelect={(id) => setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })}
          defaultPageSize={25}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cardPagination.pageItems.map((p) => (
              <Link key={p.id} to={`/admin/members/${p.id}`}>
                <Card className="h-full p-5 transition-shadow hover:shadow-card">
                  <div className="flex items-center gap-3">
                    <Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{p.firstName} {p.lastName}</p>
                      <p className="truncate text-xs text-ink-400">Batch {p.academicRecords[0]?.batch ?? '—'}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-ink-500 dark:text-ink-400">
                    <p className="flex items-center gap-1.5 truncate"><Mail className="h-3 w-3 shrink-0" /> {p.email}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" /> {p.location}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <StatusBadge status={p.verification} />
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs dark:border-ink-800">
                    <span className="text-ink-400">Last active {formatRelative(p.lastActiveAt)}</span>
                    <Badge tone={p.engagementScore >= 70 ? 'success' : p.engagementScore >= 40 ? 'warning' : 'neutral'}>{p.engagementScore}</Badge>
                  </div>
                </Card>
              </Link>
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

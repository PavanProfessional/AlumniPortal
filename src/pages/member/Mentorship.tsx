import { useState } from 'react'
import { Handshake, Star, Clock, Globe2, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SectionHeading, Card, Avatar, Button, ProgressBar, EmptyState, SearchInput } from '../../components/ui/Primitives'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { mentors, myMentorships, currentMentorProfile } from '../../data/mentorship'
import { personById } from '../../data/people'
import { formatDate } from '../../utils/dates'
import { useAppState } from '../../context/AppStateContext'
import type { MentorProfile } from '../../types'

const tabs = [
  { key: 'mine', label: 'My mentorships' },
  { key: 'find', label: 'Find a mentor' },
  { key: 'mentor', label: 'My mentor profile' },
]

export default function MemberMentorship() {
  const { currentUser } = useAppState()
  const navigate = useNavigate()
  const [tab, setTab] = useState('mine')
  const [requested, setRequested] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('card')
  const filteredMentors = mentors.filter((m) => {
    const p = personById(m.personId)
    return p ? `${p.firstName} ${p.lastName} ${p.headline} ${m.expertise.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()) : true
  })
  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex } = usePagination(filteredMentors, 9)

  const columns: Column<MentorProfile>[] = [
    { header: 'Mentor', accessor: (m) => {
      const p = personById(m.personId)
      return p ? <div className="flex items-center gap-2.5"><Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="sm" /><span className="font-medium text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</span></div> : '—'
    } },
    { header: 'Expertise', accessor: (m) => <div className="flex flex-wrap gap-1">{m.expertise.slice(0, 2).map((e) => <Badge key={e} tone="brand" className="text-[10px]">{e}</Badge>)}</div> },
    { header: 'Experience', accessor: (m) => <span className="text-xs">{m.yearsExperience}y</span> },
    { header: 'Rating', accessor: (m) => <span className="flex items-center gap-1 text-xs"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {m.rating}</span> },
    { header: 'Capacity', accessor: (m) => <span className="text-xs">{m.activeMentees}/{m.capacity}</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Give and grow" title="Mentorship" description="Structured mentoring programs connecting alumni across generations." />
      <Tabs tabs={tabs.map((t) => ({ ...t, count: t.key === 'mine' ? myMentorships.length : undefined }))} active={tab} onChange={setTab} />

      {tab === 'mine' && (
        <div className="space-y-4">
          {myMentorships.length === 0 && <EmptyState icon={<Handshake className="h-5 w-5" />} title="No active mentorships" description="Browse mentors to get started." />}
          {myMentorships.map((m) => {
            const mentee = personById(m.menteeId)
            return (
              <Card key={m.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={mentee ? `${mentee.firstName} ${mentee.lastName}` : 'Mentee'} color={mentee?.avatarColor} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{mentee ? `${mentee.firstName} ${mentee.lastName}` : 'Mentee'}</p>
                      <p className="text-xs text-ink-400">{m.program}</p>
                    </div>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">{m.goals.map((g) => <Badge key={g}>{g}</Badge>)}</div>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-ink-500">
                    <span>{m.sessionsCompleted} of {m.sessionsPlanned} sessions completed</span>
                    {m.lastSessionAt && <span>Last session {formatDate(m.lastSessionAt)}</span>}
                  </div>
                  <ProgressBar value={(m.sessionsCompleted / m.sessionsPlanned) * 100} className="mt-1.5" tone="success" />
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {tab === 'find' && (
        <>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput placeholder="Search mentors by name or expertise…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} className="sm:max-w-sm" />
          <ViewToggle view={view} onChange={setView} />
        </div>
        {view === 'table' ? (
          <DataTable columns={columns} rows={filteredMentors} keyFn={(m) => m.id} onRowClick={(m) => navigate(`/app/directory/${m.personId}`)} defaultPageSize={9} pageSizeOptions={[9, 18]} />
        ) : (
        <>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((m) => {
            const person = personById(m.personId)
            if (!person) return null
            const alreadyRequested = requested.has(m.id)
            return (
              <Card key={m.id} className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={`${person.firstName} ${person.lastName}`} color={person.avatarColor} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{person.firstName} {person.lastName}</p>
                    <p className="truncate text-xs text-ink-400">{person.headline}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-ink-500 dark:text-ink-400">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {m.rating}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {m.yearsExperience}y exp</span>
                  <span className="flex items-center gap-1"><Globe2 className="h-3.5 w-3.5" /> {m.timezone.split(' ')[0]}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">{m.expertise.slice(0, 3).map((e) => <Badge key={e} tone="brand" className="text-[10px]">{e}</Badge>)}</div>
                <Button
                  size="sm"
                  variant={alreadyRequested ? 'outline' : 'primary'}
                  className="mt-4 w-full justify-center"
                  onClick={() => setRequested((prev) => new Set(prev).add(m.id))}
                >
                  {alreadyRequested ? 'Request sent' : 'Request mentoring'}
                </Button>
              </Card>
            )
          })}
        </div>
        <Card className="p-0">
          <Pagination
            page={page} totalPages={totalPages} onPageChange={setPage}
            pageSize={pageSize} onPageSizeChange={setPageSize}
            totalItems={totalItems} startIndex={startIndex} endIndex={endIndex}
            pageSizeOptions={[9, 18]}
          />
        </Card>
        </>
        )}
        </>
      )}

      {tab === 'mentor' && (
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="lg" />
            <div>
              <p className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="text-sm text-ink-500 dark:text-ink-400">{currentMentorProfile.activeMentees} of {currentMentorProfile.capacity} mentee slots filled</p>
            </div>
            <Sparkles className="ml-auto h-5 w-5 text-brand-500" />
          </div>
          <p className="mt-4 text-sm text-ink-600 dark:text-ink-300">{currentMentorProfile.bio}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Rating" value={`${currentMentorProfile.rating} ★`} />
            <Stat label="Years experience" value={currentMentorProfile.yearsExperience} />
            <Stat label="Active mentees" value={currentMentorProfile.activeMentees} />
            <Stat label="Capacity" value={currentMentorProfile.capacity} />
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-ink-500">Areas of expertise</p>
            <div className="mt-2 flex flex-wrap gap-1.5">{currentMentorProfile.expertise.map((e) => <Badge key={e} tone="brand">{e}</Badge>)}</div>
          </div>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-ink-50 p-3 text-center dark:bg-ink-800/60">
      <p className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{value}</p>
      <p className="text-[11px] text-ink-500 dark:text-ink-400">{label}</p>
    </div>
  )
}

import { useState } from 'react'
import { Handshake, Star } from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard, Avatar, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { Donut } from '../../components/charts/Charts'
import { mentors, mentorships } from '../../data/mentorship'
import { personById } from '../../data/people'
import type { Mentorship } from '../../types'

const tabs = [{ key: 'matches', label: 'Active matches' }, { key: 'mentors', label: 'Mentor pool' }, { key: 'analytics', label: 'Analytics' }]

export default function AdminMentorship() {
  const [tab, setTab] = useState('matches')
  const active = mentorships.filter((m) => ['active', 'matched', 'invited', 'accepted'].includes(m.status))
  const [mentorQuery, setMentorQuery] = useState('')
  const filteredMentors = mentors.filter((m) => {
    const p = personById(m.personId)
    return p ? `${p.firstName} ${p.lastName} ${p.headline}`.toLowerCase().includes(mentorQuery.trim().toLowerCase()) : true
  })
  const mentorPagination = usePagination(filteredMentors, 9)

  const [matchQuery, setMatchQuery] = useState('')
  const [matchView, setMatchView] = useState<ViewMode>('table')
  const filteredMatches = mentorships.filter((m) => {
    const mentee = personById(m.menteeId)
    return mentee ? `${mentee.firstName} ${mentee.lastName} ${m.program}`.toLowerCase().includes(matchQuery.trim().toLowerCase()) : true
  })
  const matchCardPagination = usePagination(filteredMatches, 9)

  const columns: Column<Mentorship>[] = [
    { header: 'Mentee', accessor: (m) => {
      const p = personById(m.menteeId)
      return p ? <div className="flex items-center gap-2.5"><Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="sm" /><span className="font-medium text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</span></div> : '—'
    } },
    { header: 'Mentor', accessor: (m) => {
      const mentor = mentors.find((mm) => mm.id === m.mentorId)
      const p = mentor ? personById(mentor.personId) : undefined
      return p ? <span className="text-xs text-ink-500">{p.firstName} {p.lastName}</span> : '—'
    } },
    { header: 'Program', accessor: (m) => <span className="text-xs">{m.program}</span> },
    { header: 'Match score', accessor: (m) => <Badge tone={m.matchScore > 85 ? 'success' : 'brand'}>{m.matchScore}%</Badge> },
    { header: 'Sessions', accessor: (m) => `${m.sessionsCompleted}/${m.sessionsPlanned}` },
    { header: 'Status', accessor: (m) => <StatusBadge status={m.status} /> },
  ]

  const statusBreakdown = ['matched', 'invited', 'accepted', 'active', 'completed'].map((s) => ({ name: s, value: mentorships.filter((m) => m.status === s).length }))

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Structured programs" title="Mentorship" description="Cohorts, matching and outcomes across all mentoring programs." />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'matches' && (
        <Card>
          <CardHeader title={`Active & recent matches (${active.length})`} action={<ViewToggle view={matchView} onChange={setMatchView} />} />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search by mentee or program…" value={matchQuery} onChange={(e) => setMatchQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          {matchView === 'table' ? (
            <DataTable columns={columns} rows={filteredMatches} keyFn={(m) => m.id} />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {matchCardPagination.pageItems.map((m) => {
                  const mentee = personById(m.menteeId)
                  const mentor = mentors.find((mm) => mm.id === m.mentorId)
                  const mentorPerson = mentor ? personById(mentor.personId) : undefined
                  return (
                    <Card key={m.id} className="p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={mentee ? `${mentee.firstName} ${mentee.lastName}` : 'Mentee'} color={mentee?.avatarColor} size="sm" />
                          <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{mentee ? `${mentee.firstName} ${mentee.lastName}` : 'Mentee'}</p>
                        </div>
                        <StatusBadge status={m.status} />
                      </div>
                      <p className="mt-2 text-xs text-ink-400">{m.program}</p>
                      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">Mentor: {mentorPerson ? `${mentorPerson.firstName} ${mentorPerson.lastName}` : '—'}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3 text-xs dark:border-ink-800">
                        <span className="text-ink-400">{m.sessionsCompleted}/{m.sessionsPlanned} sessions</span>
                        <Badge tone={m.matchScore > 85 ? 'success' : 'brand'}>{m.matchScore}%</Badge>
                      </div>
                    </Card>
                  )
                })}
              </div>
              <Card className="p-0">
                <Pagination
                  page={matchCardPagination.page} totalPages={matchCardPagination.totalPages} onPageChange={matchCardPagination.setPage}
                  pageSize={matchCardPagination.pageSize} onPageSizeChange={matchCardPagination.setPageSize}
                  totalItems={matchCardPagination.totalItems} startIndex={matchCardPagination.startIndex} endIndex={matchCardPagination.endIndex}
                  pageSizeOptions={[9, 18]}
                />
              </Card>
            </>
          )}
        </Card>
      )}

      {tab === 'mentors' && (
        <>
        <SearchInput placeholder="Search mentors by name or expertise…" value={mentorQuery} onChange={(e) => setMentorQuery(e.target.value)} className="sm:max-w-sm" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mentorPagination.pageItems.map((m) => {
            const p = personById(m.personId)
            if (!p) return null
            return (
              <Card key={m.id} className="p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="md" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</p><p className="truncate text-xs text-ink-400">{p.headline}</p></div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-500">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {m.rating}</span>
                  <span>{m.activeMentees}/{m.capacity} slots filled</span>
                </div>
              </Card>
            )
          })}
        </div>
        <Card className="p-0">
          <Pagination
            page={mentorPagination.page} totalPages={mentorPagination.totalPages} onPageChange={mentorPagination.setPage}
            pageSize={mentorPagination.pageSize} onPageSizeChange={mentorPagination.setPageSize}
            totalItems={mentorPagination.totalItems} startIndex={mentorPagination.startIndex} endIndex={mentorPagination.endIndex}
            pageSizeOptions={[9, 18]}
          />
        </Card>
        </>
      )}

      {tab === 'analytics' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <StatCard label="Total mentors" value={mentors.length} icon={<Handshake className="h-4 w-4" />} />
          <StatCard label="Match acceptance rate" value="78%" deltaTone="success" delta="+5pt" />
          <StatCard label="Avg. satisfaction" value="4.6 / 5" />
          <Card className="p-5 lg:col-span-3">
            <CardHeader title="Mentorship pipeline by status" className="border-0 px-0 pt-0" />
            <Donut data={statusBreakdown} />
          </Card>
        </div>
      )}
    </div>
  )
}

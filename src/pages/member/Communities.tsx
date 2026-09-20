import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, Lock, Globe, MessagesSquare } from 'lucide-react'
import { SectionHeading, Card, Chip, Button, EmptyState, SearchInput } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { communities, myGroupIds } from '../../data/communities'
import type { CommunityGroup } from '../../types'

const filters = ['All communities', 'My communities'] as const

export default function MemberCommunities() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<(typeof filters)[number]>('All communities')
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('card')
  const list = (filter === 'My communities' ? communities.filter((g) => myGroupIds.includes(g.id)) : communities)
    .filter((g) => `${g.name} ${g.type}`.toLowerCase().includes(query.trim().toLowerCase()))
  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex } = usePagination(list, 9)

  const columns: Column<CommunityGroup>[] = [
    { header: 'Community', accessor: (g) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: g.coverColor }} />
        <div><p className="font-medium text-ink-800 dark:text-ink-100">{g.name}</p><p className="text-xs text-ink-400">{g.type}</p></div>
      </div>
    ) },
    { header: 'Privacy', accessor: (g) => <span className="flex items-center gap-1.5 text-xs">{g.privacy === 'private' ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />} {g.privacy}</span> },
    { header: 'Members', accessor: (g) => <span className="flex items-center gap-1 text-xs"><Users className="h-3 w-3" /> {g.memberCount.toLocaleString()}</span> },
    { header: 'Status', accessor: (g) => myGroupIds.includes(g.id) ? <Badge tone="success">Joined</Badge> : <Badge>Not joined</Badge> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Belong somewhere" title="Communities" description="Batch groups, chapters and interest-based communities to stay close to your people." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search communities…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => <Chip key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Chip>)}
          </div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {list.length === 0 ? (
        <EmptyState icon={<MessagesSquare className="h-5 w-5" />} title="You haven't joined any communities yet" description="Explore public communities and request to join." />
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={list} keyFn={(g) => g.id} onRowClick={(g) => navigate(`/app/communities/${g.id}`)} defaultPageSize={9} pageSizeOptions={[9, 18, 27]} />
      ) : (
        <>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((g) => {
            const joined = myGroupIds.includes(g.id)
            return (
              <Card key={g.id} className="flex flex-col overflow-hidden transition-shadow hover:shadow-card">
                <div className="h-16" style={{ background: `linear-gradient(135deg, ${g.coverColor}, ${g.coverColor}99)` }} />
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-2">
                    <Link to={`/app/communities/${g.id}`} className="text-sm font-semibold text-ink-900 hover:underline dark:text-ink-50">{g.name}</Link>
                    {g.privacy === 'private' ? <Lock className="h-3.5 w-3.5 shrink-0 text-ink-400" /> : <Globe className="h-3.5 w-3.5 shrink-0 text-ink-400" />}
                  </div>
                  <p className="mt-1.5 line-clamp-2 flex-1 text-xs text-ink-500 dark:text-ink-400">{g.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-ink-400">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.memberCount.toLocaleString()}</span>
                    <Badge>{g.type}</Badge>
                  </div>
                  <div className="mt-4">
                    <Link to={`/app/communities/${g.id}`}>
                      <Button variant={joined ? 'outline' : 'primary'} size="sm" className="w-full justify-center">{joined ? 'View community' : 'Request to join'}</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
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

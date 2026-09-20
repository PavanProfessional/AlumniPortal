import { useState } from 'react'
import { Flag, Check, X, Users, Lock, Globe } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Avatar, Button, EmptyState, SearchInput } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { useToast } from '../../components/ui/Toast'
import { communities, flaggedPosts } from '../../data/communities'
import { personById } from '../../data/people'
import type { CommunityGroup } from '../../types'
import { formatRelative } from '../../utils/dates'

const tabs = [{ key: 'groups', label: 'Communities' }, { key: 'moderation', label: 'Moderation queue' }]

export default function AdminCommunities() {
  const notify = useToast()
  const [tab, setTab] = useState('groups')
  const [resolved, setResolved] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const filteredCommunities = communities.filter((g) => `${g.name} ${g.type}`.toLowerCase().includes(query.trim().toLowerCase()))

  function moderate(postId: string, outcome: 'approved' | 'removed') {
    setResolved((prev) => new Set(prev).add(postId))
    notify({
      message: outcome === 'approved' ? 'Post approved and restored' : 'Post removed',
      type: outcome === 'approved' ? 'success' : 'error',
      position: 'bottom-left',
    })
  }

  const columns: Column<CommunityGroup>[] = [
    { header: 'Community', accessor: (g) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: g.coverColor }} />
        <div><p className="font-medium text-ink-800 dark:text-ink-100">{g.name}</p><p className="text-xs text-ink-400">{g.type}</p></div>
      </div>
    ) },
    { header: 'Privacy', accessor: (g) => <span className="flex items-center gap-1.5 text-xs">{g.privacy === 'private' ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />} {g.privacy}</span> },
    { header: 'Members', accessor: (g) => <span className="flex items-center gap-1 text-xs"><Users className="h-3 w-3" /> {g.memberCount.toLocaleString()}</span> },
    { header: 'Posts', accessor: (g) => g.postCount },
    { header: 'Reports', accessor: (g) => g.pendingReports > 0 ? <Badge tone="danger">{g.pendingReports} pending</Badge> : <Badge tone="success">Clean</Badge> },
    { header: 'Owners', accessor: (g) => <span className="text-xs text-ink-400">{g.owners.join(', ')}</span> },
  ]

  const [modQuery, setModQuery] = useState('')
  const pendingReports = flaggedPosts.filter((p) => !resolved.has(p.id))
  const openReports = pendingReports.filter((p) => p.content.toLowerCase().includes(modQuery.trim().toLowerCase()))
  const reportsPagination = usePagination(openReports, 5)

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Networking" title="Communities" description="Batch, chapter and interest-based groups with built-in moderation." />
      <Tabs tabs={[{ ...tabs[0] }, { ...tabs[1], count: pendingReports.length }]} active={tab} onChange={setTab} />

      {tab === 'groups' && (
        <Card>
          <CardHeader title="All communities" action={<ViewToggle view={view} onChange={setView} />} />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search communities…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          {view === 'table' ? (
            <DataTable columns={columns} rows={filteredCommunities} keyFn={(g) => g.id} />
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCommunities.map((g) => (
                <Card key={g.id} className="overflow-hidden">
                  <div className="h-12" style={{ background: `linear-gradient(135deg, ${g.coverColor}, ${g.coverColor}99)` }} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{g.name}</p>
                      {g.privacy === 'private' ? <Lock className="h-3.5 w-3.5 shrink-0 text-ink-400" /> : <Globe className="h-3.5 w-3.5 shrink-0 text-ink-400" />}
                    </div>
                    <p className="text-xs text-ink-400">{g.type}</p>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-ink-500"><Users className="h-3.5 w-3.5" /> {g.memberCount.toLocaleString()}</span>
                      {g.pendingReports > 0 ? <Badge tone="danger">{g.pendingReports} pending</Badge> : <Badge tone="success">Clean</Badge>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {tab === 'moderation' && (
        <Card>
          <CardHeader title="Flagged content" subtitle="Posts reported by members, awaiting review" />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search flagged content…" value={modQuery} onChange={(e) => setModQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          {openReports.length === 0 ? (
            <EmptyState icon={<Flag className="h-5 w-5" />} title="Moderation queue is clear" description="No flagged content awaiting review." />
          ) : (
            <div className="divide-y divide-ink-100 dark:divide-ink-800">
              {reportsPagination.pageItems.map((post) => {
                const author = personById(post.authorId)
                const group = communities.find((g) => g.id === post.groupId)
                return (
                  <div key={post.id} className="flex items-start gap-3 px-5 py-4">
                    <Avatar name={author ? `${author.firstName} ${author.lastName}` : 'Member'} color={author?.avatarColor} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{author ? `${author.firstName} ${author.lastName}` : 'Member'} <span className="font-normal text-ink-400">in {group?.name}</span></p>
                      <p className="mt-1 text-sm text-ink-600 dark:text-ink-300">{post.content}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-400"><Flag className="h-3 w-3 text-rose-500" /> Flagged {formatRelative(post.createdAt)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button variant="outline" size="sm" icon={<Check className="h-3.5 w-3.5" />} onClick={() => moderate(post.id, 'approved')}>Approve</Button>
                      <Button variant="danger" size="sm" icon={<X className="h-3.5 w-3.5" />} onClick={() => moderate(post.id, 'removed')}>Remove</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {openReports.length > 0 && (
            <Pagination
              page={reportsPagination.page} totalPages={reportsPagination.totalPages} onPageChange={reportsPagination.setPage}
              pageSize={reportsPagination.pageSize} onPageSizeChange={reportsPagination.setPageSize}
              totalItems={reportsPagination.totalItems} startIndex={reportsPagination.startIndex} endIndex={reportsPagination.endIndex}
              pageSizeOptions={[5, 10, 25]}
            />
          )}
        </Card>
      )}
    </div>
  )
}

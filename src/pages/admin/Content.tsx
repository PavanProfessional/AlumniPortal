import { useState } from 'react'
import { FilePlus, Eye } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button, Chip, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { SidePanel } from '../../components/ui/SidePanel'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { useToast } from '../../components/ui/Toast'
import { content } from '../../data/content'
import { personById } from '../../data/people'
import type { ContentItem, ContentWorkflowState } from '../../types'
import { formatDate } from '../../utils/dates'
import { formatCompact } from '../../utils/format'

const states: (ContentWorkflowState | 'All')[] = ['All', 'draft', 'review', 'scheduled', 'published', 'archived']

export default function AdminContent() {
  const notify = useToast()
  const [state, setState] = useState<(typeof states)[number]>('All')
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const filtered = content
    .filter((c) => state === 'All' || c.state === state)
    .filter((c) => c.title.toLowerCase().includes(query.trim().toLowerCase()))

  function saveDraft() {
    setOpen(false)
    notify({ message: 'Draft saved', type: 'success', position: 'top-right' })
  }

  function submitForReview() {
    setOpen(false)
    notify({ message: 'Submitted for review', description: 'A Content Editor will be notified to approve and publish.', type: 'info', position: 'top-right' })
  }

  const columns: Column<ContentItem>[] = [
    { header: 'Content', accessor: (c) => (
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: c.coverColor }} />
        <div className="min-w-0"><p className="truncate font-medium text-ink-800 dark:text-ink-100">{c.title}</p><p className="text-xs text-ink-400">v{c.version}</p></div>
      </div>
    ) },
    { header: 'Type', accessor: (c) => <Badge>{c.type}</Badge> },
    { header: 'Author', accessor: (c) => { const p = personById(c.authorId); return <span className="text-xs text-ink-500">{p ? `${p.firstName} ${p.lastName}` : '—'}</span> } },
    { header: 'Views', accessor: (c) => <span className="flex items-center gap-1 text-xs"><Eye className="h-3 w-3" /> {formatCompact(c.views)}</span> },
    { header: 'Updated', accessor: (c) => <span className="text-xs text-ink-400">{formatDate(c.updatedAt)}</span> },
    { header: 'Status', accessor: (c) => <StatusBadge status={c.state} /> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Publishing" title="Content (CMS)" description="Pages, announcements, stories and policies with full revision history." action={<Button icon={<FilePlus className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>New content</Button>} />

      <div className="flex flex-wrap gap-2">{states.map((s) => <Chip key={s} active={state === s} onClick={() => setState(s)}>{s === 'All' ? 'All' : s}</Chip>)}</div>

      <Card>
        <CardHeader title="Content library" action={<ViewToggle view={view} onChange={setView} />} />
        <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
          <SearchInput placeholder="Search content by title…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
        </div>
        {view === 'table' ? (
          <DataTable columns={columns} rows={filtered} keyFn={(c) => c.id} />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card key={c.id} className="overflow-hidden">
                <div className="h-20" style={{ background: `linear-gradient(135deg, ${c.coverColor}, ${c.coverColor}99)` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Badge>{c.type}</Badge>
                    <StatusBadge status={c.state} />
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{c.title}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-ink-400">
                    <span>{formatDate(c.updatedAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {formatCompact(c.views)}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <SidePanel open={open} onClose={() => setOpen(false)} title="New content" description="Draft, review and publish with full revision history." defaultSize="M" footer={<><Button variant="ghost" onClick={saveDraft}>Save draft</Button><Button onClick={submitForReview}>Submit for review</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Title</label>
            <input placeholder="e.g. Spring Newsletter" className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Content type</label>
              <select className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100">
                <option>Announcement</option><option>News</option><option>Story</option><option>Resource</option><option>FAQ</option><option>Policy</option><option>Page</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Publish date</label>
              <input type="date" className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Summary</label>
            <textarea rows={3} className="mt-1.5 w-full rounded-lg border border-ink-200 bg-white p-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
          </div>
        </div>
      </SidePanel>
    </div>
  )
}

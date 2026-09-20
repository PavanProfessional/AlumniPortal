import { useState } from 'react'
import { Megaphone, Mail, MessageSquare, Bell, Smartphone } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button, StatCard, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { SidePanel } from '../../components/ui/SidePanel'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { useToast } from '../../components/ui/Toast'
import { commsCampaigns, type CommsCampaign } from '../../data/communications'
import { formatDate } from '../../utils/dates'
import { formatNumber, formatPercent } from '../../utils/format'

const channelIcon = { Email: Mail, SMS: MessageSquare, Push: Bell, 'In-app': Smartphone }

export default function AdminCommunications() {
  const notify = useToast()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const filteredCampaigns = commsCampaigns.filter((c) => `${c.name} ${c.audience} ${c.channel}`.toLowerCase().includes(query.trim().toLowerCase()))

  function saveDraft() {
    setOpen(false)
    notify({ message: 'Campaign saved as draft', type: 'success', position: 'top-right' })
  }

  function continueToAudience() {
    setOpen(false)
    notify({ message: 'Audience builder coming up next', type: 'info', position: 'top-right' })
  }

  const totalSent = commsCampaigns.reduce((s, c) => s + c.sent, 0)
  const avgOpenRate = Math.round((commsCampaigns.filter((c) => c.delivered).reduce((s, c) => s + c.opened / c.delivered, 0) / commsCampaigns.filter((c) => c.delivered).length) * 100)

  const columns: Column<CommsCampaign>[] = [
    { header: 'Campaign', accessor: (c) => {
      const Icon = channelIcon[c.channel]
      return (
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><Icon className="h-4 w-4" /></div>
          <div><p className="font-medium text-ink-800 dark:text-ink-100">{c.name}</p><p className="text-xs text-ink-400">{c.audience}</p></div>
        </div>
      )
    } },
    { header: 'Channel', accessor: (c) => c.channel },
    { header: 'Audience', accessor: (c) => formatNumber(c.audienceSize) },
    { header: 'Delivered', accessor: (c) => c.delivered ? formatNumber(c.delivered) : '—' },
    { header: 'Open rate', accessor: (c) => c.delivered ? formatPercent((c.opened / c.delivered) * 100) : '—' },
    { header: 'Click rate', accessor: (c) => c.opened ? formatPercent((c.clicked / c.opened) * 100) : '—' },
    { header: 'Status', accessor: (c) => <StatusBadge status={c.status} /> },
    { header: 'Date', accessor: (c) => <span className="text-xs text-ink-400">{c.sentAt ? formatDate(c.sentAt) : c.scheduledAt ? `Scheduled ${formatDate(c.scheduledAt)}` : '—'}</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Reach your alumni" title="Communications" description="Targeted campaigns across email, SMS, push and in-app — with consent and frequency controls." action={<Button icon={<Megaphone className="h-3.5 w-3.5" />} onClick={() => setOpen(true)}>New campaign</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total sent (all time)" value={formatNumber(totalSent)} />
        <StatCard label="Average open rate" value={formatPercent(avgOpenRate)} deltaTone="success" delta="+3.1pt" />
        <StatCard label="Active campaigns" value={commsCampaigns.filter((c) => ['scheduled', 'processing'].includes(c.status)).length} />
      </div>

      <Card>
        <CardHeader title="Campaigns" action={<ViewToggle view={view} onChange={setView} />} />
        <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
          <SearchInput placeholder="Search campaigns…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
        </div>
        {view === 'table' ? (
          <DataTable columns={columns} rows={filteredCampaigns} keyFn={(c) => c.id} />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((c) => {
              const Icon = channelIcon[c.channel]
              return (
                <Card key={c.id} className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><Icon className="h-4 w-4" /></div>
                      <div className="min-w-0"><p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{c.name}</p><p className="truncate text-xs text-ink-400">{c.audience}</p></div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-ink-100 pt-3 text-center text-xs dark:border-ink-800">
                    <div><p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{formatNumber(c.audienceSize)}</p><p className="text-[10px] text-ink-400">Audience</p></div>
                    <div><p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{c.delivered ? formatPercent((c.opened / c.delivered) * 100) : '—'}</p><p className="text-[10px] text-ink-400">Open rate</p></div>
                    <div><p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{c.opened ? formatPercent((c.clicked / c.opened) * 100) : '—'}</p><p className="text-[10px] text-ink-400">Click rate</p></div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </Card>

      <SidePanel open={open} onClose={() => setOpen(false)} title="New campaign" description="Build the message, then define its audience segment." defaultSize="M" footer={<><Button variant="ghost" onClick={saveDraft}>Save draft</Button><Button onClick={continueToAudience}>Continue to audience</Button></>}>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Campaign name</label>
            <input placeholder="e.g. Winter Newsletter" className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Channel</label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(['Email', 'SMS', 'Push', 'In-app'] as const).map((c) => {
                const Icon = channelIcon[c]
                return <button key={c} className="flex flex-col items-center gap-1.5 rounded-lg border border-ink-200 py-3 text-xs font-medium text-ink-600 hover:border-brand-400 dark:border-ink-700 dark:text-ink-300"><Icon className="h-4 w-4" /> {c}</button>
              })}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Audience segment</label>
            <select className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100">
              <option>All active members</option><option>Batch of 2016</option><option>Bay Area chapter</option><option>Donors — Gold tier+</option><option>Custom segment builder…</option>
            </select>
          </div>
        </div>
      </SidePanel>
    </div>
  )
}

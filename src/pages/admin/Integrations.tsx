import { useState } from 'react'
import { Plug, Webhook, Settings2 } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { integrations, webhookDeliveries } from '../../data/integrations'
import type { WebhookDelivery } from '../../types'
import { formatRelative } from '../../utils/dates'
import { formatNumber } from '../../utils/format'

const tabs = [{ key: 'connectors', label: 'Connectors' }, { key: 'webhooks', label: 'Webhook deliveries' }]

export default function AdminIntegrations() {
  const [tab, setTab] = useState('connectors')
  const [connectorQuery, setConnectorQuery] = useState('')
  const filteredConnectors = integrations.filter((i) => `${i.name} ${i.category}`.toLowerCase().includes(connectorQuery.trim().toLowerCase()))
  const connectorPagination = usePagination(filteredConnectors, 9)
  const [webhookQuery, setWebhookQuery] = useState('')
  const filteredWebhooks = webhookDeliveries.filter((w) => `${w.event} ${w.endpoint}`.toLowerCase().includes(webhookQuery.trim().toLowerCase()))

  const columns: Column<WebhookDelivery>[] = [
    { header: 'Event', accessor: (w) => <span className="font-mono text-xs">{w.event}</span> },
    { header: 'Endpoint', accessor: (w) => <span className="truncate text-xs text-ink-500">{w.endpoint}</span> },
    { header: 'Attempt', accessor: (w) => w.attempt },
    { header: 'Status code', accessor: (w) => <span className={w.statusCode >= 400 ? 'text-rose-600 dark:text-rose-400' : 'text-accent-600 dark:text-accent-400'}>{w.statusCode}</span> },
    { header: 'Delivery', accessor: (w) => <StatusBadge status={w.status} /> },
    { header: 'When', accessor: (w) => <span className="text-xs text-ink-400">{formatRelative(w.respondedAt)}</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Ecosystem" title="Integrations" description="SIS, CRM, payments, identity and data warehouse connectors — adapters, not hard-coded logic." action={<Button icon={<Plug className="h-3.5 w-3.5" />}>Add connector</Button>} />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'connectors' && (
        <>
        <SearchInput placeholder="Search connectors…" value={connectorQuery} onChange={(e) => setConnectorQuery(e.target.value)} className="sm:max-w-sm" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {connectorPagination.pageItems.map((i) => (
            <Card key={i.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-sm font-bold text-ink-600 dark:bg-ink-800 dark:text-ink-300">{i.logoInitials}</div>
                  <div><p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{i.name}</p><p className="text-xs text-ink-400">{i.category}</p></div>
                </div>
                <StatusBadge status={i.status} />
              </div>
              <p className="mt-3 text-xs text-ink-500 dark:text-ink-400">{i.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-ink-400">
                <span>{i.syncMode}</span>
                <span>{formatNumber(i.recordsSynced)} synced</span>
              </div>
              {i.lastSyncAt && <p className="mt-1 text-[11px] text-ink-400">Last sync {formatRelative(i.lastSyncAt)}</p>}
              <Button variant="outline" size="sm" className="mt-4 w-full justify-center" icon={<Settings2 className="h-3.5 w-3.5" />}>Configure</Button>
            </Card>
          ))}
        </div>
        <Card className="p-0">
          <Pagination
            page={connectorPagination.page} totalPages={connectorPagination.totalPages} onPageChange={connectorPagination.setPage}
            pageSize={connectorPagination.pageSize} onPageSizeChange={connectorPagination.setPageSize}
            totalItems={connectorPagination.totalItems} startIndex={connectorPagination.startIndex} endIndex={connectorPagination.endIndex}
            pageSizeOptions={[9, 18]}
          />
        </Card>
        </>
      )}

      {tab === 'webhooks' && (
        <Card>
          <CardHeader title="Recent webhook deliveries" subtitle="Signed, retried with exponential backoff, replayable" action={<Webhook className="h-4 w-4 text-ink-400" />} />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search by event or endpoint…" value={webhookQuery} onChange={(e) => setWebhookQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          <DataTable columns={columns} rows={filteredWebhooks} keyFn={(w) => w.id} />
        </Card>
      )}
    </div>
  )
}

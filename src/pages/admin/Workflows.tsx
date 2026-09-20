import { useState } from 'react'
import { Workflow as WorkflowIcon, Zap, CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { workflows, executions } from '../../data/workflows'
import { formatRelative } from '../../utils/dates'

const tabs = [{ key: 'automations', label: 'Automations' }, { key: 'history', label: 'Execution history' }]

const executionIcon = { success: CheckCircle2, failed: XCircle, running: Zap, retrying: RotateCcw }

export default function AdminWorkflows() {
  const [tab, setTab] = useState('automations')
  const [workflowQuery, setWorkflowQuery] = useState('')
  const filteredWorkflows = workflows.filter((wf) => `${wf.name} ${wf.trigger}`.toLowerCase().includes(workflowQuery.trim().toLowerCase()))
  const workflowPagination = usePagination(filteredWorkflows, 10)
  const [executionQuery, setExecutionQuery] = useState('')
  const filteredExecutions = executions.filter((ex) => {
    const wf = workflows.find((w) => w.id === ex.workflowId)
    return (wf?.name ?? '').toLowerCase().includes(executionQuery.trim().toLowerCase())
  })
  const executionPagination = usePagination(filteredExecutions, 10)

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Automation engine" title="Workflows" description="Trigger → conditions → actions, with retries, approvals and full execution history." action={<Button icon={<WorkflowIcon className="h-3.5 w-3.5" />}>New workflow</Button>} />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'automations' && (
        <>
        <SearchInput placeholder="Search automations…" value={workflowQuery} onChange={(e) => setWorkflowQuery(e.target.value)} className="sm:max-w-sm" />
        <div className="space-y-3">
          {workflowPagination.pageItems.map((wf) => (
            <Card key={wf.id} className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{wf.name}</p>
                    <Badge tone={wf.enabled ? 'success' : 'neutral'}>{wf.enabled ? 'Enabled' : 'Disabled'}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{wf.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge tone="brand">Trigger: {wf.trigger}</Badge>
                    {wf.actionsSummary.map((a) => <Badge key={a}>{a}</Badge>)}
                  </div>
                </div>
                <div className="flex shrink-0 gap-6 text-center">
                  <div><p className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{wf.runsLast30d}</p><p className="text-[11px] text-ink-400">runs / 30d</p></div>
                  <div><p className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{wf.successRate}%</p><p className="text-[11px] text-ink-400">success rate</p></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        <Card className="p-0">
          <Pagination
            page={workflowPagination.page} totalPages={workflowPagination.totalPages} onPageChange={workflowPagination.setPage}
            pageSize={workflowPagination.pageSize} onPageSizeChange={workflowPagination.setPageSize}
            totalItems={workflowPagination.totalItems} startIndex={workflowPagination.startIndex} endIndex={workflowPagination.endIndex}
            pageSizeOptions={[10, 25]}
          />
        </Card>
        </>
      )}

      {tab === 'history' && (
        <Card>
          <CardHeader title="Recent executions" />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search by workflow name…" value={executionQuery} onChange={(e) => setExecutionQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {executionPagination.pageItems.map((ex) => {
              const wf = workflows.find((w) => w.id === ex.workflowId)
              const Icon = executionIcon[ex.status]
              return (
                <div key={ex.id} className="flex items-center gap-3 px-5 py-3">
                  <Icon className={`h-4 w-4 shrink-0 ${ex.status === 'success' ? 'text-accent-500' : ex.status === 'failed' ? 'text-rose-500' : 'text-amber-500'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-ink-700 dark:text-ink-200">{wf?.name}</p>
                    <p className="text-[11px] text-ink-400">{ex.trigger} · {ex.durationMs}ms</p>
                  </div>
                  <StatusBadge status={ex.status} />
                  <span className="w-16 shrink-0 text-right text-[11px] text-ink-400">{formatRelative(ex.startedAt)}</span>
                </div>
              )
            })}
          </div>
          <Pagination
            page={executionPagination.page} totalPages={executionPagination.totalPages} onPageChange={executionPagination.setPage}
            pageSize={executionPagination.pageSize} onPageSizeChange={executionPagination.setPageSize}
            totalItems={executionPagination.totalItems} startIndex={executionPagination.startIndex} endIndex={executionPagination.endIndex}
            pageSizeOptions={[10, 25, 50]}
          />
        </Card>
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  Users, TrendingUp, CalendarDays, Briefcase, Handshake, Gift, ArrowRight, ScrollText,
  LayoutDashboard, LayoutGrid, Search, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Copy,
  GripVertical, MoreHorizontal, Filter as FilterIcon, Clock, RefreshCw, BarChart3,
  LineChart as LineChartIcon, AreaChart as AreaChartIcon, PieChart as PieChartIcon, Table2, Hash, Check, X, Inbox,
} from 'lucide-react'
import { SectionHeading, StatCard, Card, CardHeader, Avatar, Button, IconButton, EmptyState } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { SidePanel } from '../../components/ui/SidePanel'
import { useToast } from '../../components/ui/Toast'
import { TrendArea, ComparisonBars, MultiLineTrend, Donut } from '../../components/charts/Charts'
import { allPeople } from '../../data/people'
import { events } from '../../data/events'
import { jobs } from '../../data/careers'
import { mentorships } from '../../data/mentorship'
import { campaigns } from '../../data/fundraising'
import { auditEvents } from '../../data/audit'
import { formatCompact, formatCurrency } from '../../utils/format'
import { formatRelative } from '../../utils/dates'
import { monthlySeries } from '../../utils/series'
import { useAppState } from '../../context/AppStateContext'
import { useDashboards } from '../../context/DashboardsContext'
import {
  dataSources, timescaleLabels, computeWidgetData, distinctFieldValues, colorPalettes, metricFormat,
  type WidgetDataPoint,
} from '../../data/dashboardSources'
import type {
  CustomDashboard, DashboardWidget, WidgetChartType, WidgetDataSourceKey, WidgetFilterRule,
  WidgetSize, WidgetTimescale, WidgetAutoReload, ColorPaletteKey,
} from '../../types'

export default function AdminDashboard() {
  const { tenant } = useAppState()
  const notify = useToast()
  const { dashboards, createDashboard, renameDashboard, deleteDashboard, duplicateDashboard, setDashboardTimescale, addWidget, updateWidget, deleteWidget, duplicateWidget, reorderWidgets, touchWidget } = useDashboards()

  const [selected, setSelected] = useState<'default' | string>('default')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [widgetForm, setWidgetForm] = useState<{ mode: 'create' | 'edit'; widget: DashboardWidget | null } | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const active = selected === 'default' ? null : dashboards.find((d) => d.id === selected) ?? null

  useEffect(() => {
    if (selected !== 'default' && !dashboards.some((d) => d.id === selected)) setSelected('default')
  }, [dashboards, selected])

  function handleCreateDashboard() {
    const name = newName.trim()
    if (!name) return
    const id = createDashboard(name)
    setNewName('')
    setCreateOpen(false)
    setSelected(id)
    notify({ message: 'Dashboard created', description: `"${name}" is ready for widgets.`, type: 'success', position: 'top-right' })
  }

  function handleDeleteDashboard(d: CustomDashboard) {
    if (!window.confirm(`Delete "${d.name}"? This removes all of its widgets.`)) return
    deleteDashboard(d.id)
    notify({ message: 'Dashboard deleted', type: 'success', position: 'top-right' })
    setSelected('default')
  }

  function openCreateWidget() {
    setWidgetForm({ mode: 'create', widget: { id: '', lastUpdatedAt: '', ...defaultWidgetForSource('members') } })
  }
  function openEditWidget(w: DashboardWidget) {
    setWidgetForm({ mode: 'edit', widget: w })
  }
  function saveWidget(widget: Omit<DashboardWidget, 'id' | 'lastUpdatedAt'>) {
    if (!active) return
    if (widgetForm?.mode === 'edit' && widgetForm.widget?.id) {
      updateWidget(active.id, widgetForm.widget.id, { ...widget, lastUpdatedAt: widgetForm.widget.lastUpdatedAt })
      notify({ message: 'Widget updated', type: 'success', position: 'top-right' })
    } else {
      addWidget(active.id, widget)
      notify({ message: 'Widget added', type: 'success', position: 'top-right' })
    }
    setWidgetForm(null)
  }

  return (
    <div className="space-y-6">
      {active ? (
        <SectionHeading
          eyebrow="Custom dashboard"
          title={active.name}
          description={`${active.widgets.length} widget${active.widgets.length === 1 ? '' : 's'} · Updated ${formatRelative(active.updatedAt)}`}
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-ink-200 px-2 py-1.5 dark:border-ink-700">
                <Clock className="h-3.5 w-3.5 text-ink-400" />
                <select
                  value={active.dashboardTimescale ?? ''}
                  onChange={(e) => setDashboardTimescale(active.id, (e.target.value || null) as WidgetTimescale | null)}
                  className="bg-transparent text-xs text-ink-600 focus:outline-none dark:text-ink-300"
                  title="Dashboard-wide date filter — overrides each widget's own timescale when set"
                >
                  <option value="">Date filter: off</option>
                  {(Object.keys(timescaleLabels) as WidgetTimescale[]).filter((k) => k !== 'all_time').map((k) => (
                    <option key={k} value={k}>Date filter: {timescaleLabels[k]}</option>
                  ))}
                </select>
              </div>
              <Button size="sm" icon={<Plus className="h-3.5 w-3.5" />} onClick={openCreateWidget}>Add Widget(s)</Button>
            </div>
          }
        />
      ) : (
        <SectionHeading eyebrow={tenant.displayName} title="Executive Dashboard" description="Institution-wide health across identity, engagement, careers, mentoring and giving." />
      )}

      <div className={clsx('grid grid-cols-1 gap-6 lg:items-start', sidebarCollapsed ? 'lg:grid-cols-[auto_1fr]' : 'lg:grid-cols-[260px_1fr]')}>
        <DashboardSidebar
          dashboards={dashboards}
          selected={selected}
          onSelect={setSelected}
          onCreate={() => setCreateOpen(true)}
          onRename={renameDashboard}
          onDuplicate={(id) => { const copyId = duplicateDashboard(id); setSelected(copyId) }}
          onDelete={handleDeleteDashboard}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed((v) => !v)}
        />

        <div className="min-w-0">
          {active ? (
            active.widgets.length === 0 ? (
              <EmptyState icon={<LayoutGrid className="h-5 w-5" />} title="This dashboard has no widgets yet" description="Add a widget to start visualizing live data." action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreateWidget}>Add Widget(s)</Button>} />
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                {active.widgets.map((w, idx) => (
                  <div
                    key={w.id}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { if (dragIndex !== null && dragIndex !== idx) reorderWidgets(active.id, dragIndex, idx); setDragIndex(null) }}
                    className={sizeSpan[w.size]}
                  >
                    <WidgetCard
                      widget={w}
                      dashboardTimescale={active.dashboardTimescale}
                      onEdit={() => openEditWidget(w)}
                      onDuplicate={() => duplicateWidget(active.id, w.id)}
                      onDelete={() => { if (window.confirm(`Delete widget "${w.title}"?`)) deleteWidget(active.id, w.id) }}
                      onReload={() => touchWidget(active.id, w.id)}
                    />
                  </div>
                ))}
              </div>
            )
          ) : (
            <ExecutiveDashboardContent />
          )}
        </div>
      </div>

      <CreateDashboardPanel open={createOpen} name={newName} onNameChange={setNewName} onClose={() => setCreateOpen(false)} onCreate={handleCreateDashboard} />
      <WidgetFormPanel open={!!widgetForm} mode={widgetForm?.mode ?? 'create'} initial={widgetForm?.widget ?? null} onClose={() => setWidgetForm(null)} onSave={saveWidget} />
    </div>
  )
}

// =====================================================================
// Built-in default view — the tenant's static executive dashboard.
// =====================================================================
function ExecutiveDashboardContent() {
  const { tenant } = useAppState()
  const verified = allPeople.filter((p) => p.verification === 'institution-verified').length
  const active = allPeople.filter((p) => p.status === 'active').length
  const upcomingEvents = events.filter((e) => new Date(e.startAt) > new Date() && e.status !== 'cancelled').length
  const openJobs = jobs.filter((j) => j.status === 'published').length
  const activeMentorships = mentorships.filter((m) => m.status === 'active').length
  const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0)

  const growthData = monthlySeries(101, 21000, 0.012, 0.03)
  const engagementByModule = [
    { name: 'Events', value: events.reduce((s, e) => s + e.registeredCount, 0) },
    { name: 'Careers', value: jobs.reduce((s, j) => s + j.applicantCount, 0) },
    { name: 'Communities', value: 4820 },
    { name: 'Mentoring', value: mentorships.length * 18 },
    { name: 'Giving', value: campaigns.reduce((s, c) => s + c.donorCount, 0) },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total alumni" value={formatCompact(tenant.memberCount)} delta="+312 this month" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Verified alumni" value={formatCompact(verified * 336)} sub={`${Math.round((verified / allPeople.length) * 100)}% of sample verified`} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Active members" value={formatCompact(active * 336)} delta="+4.2%" icon={<Users className="h-4 w-4" />} />
        <StatCard label="Upcoming events" value={upcomingEvents} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard label="Open job postings" value={openJobs} icon={<Briefcase className="h-4 w-4" />} />
        <StatCard label="Active mentorships" value={activeMentorships} icon={<Handshake className="h-4 w-4" />} />
        <StatCard label="Funds raised (active)" value={formatCurrency(totalRaised)} delta="+8.1%" icon={<Gift className="h-4 w-4" />} />
        <StatCard label="Tenant health score" value={`${tenant.healthScore}/100`} icon={<TrendingUp className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <CardHeader title="Alumni network growth" subtitle="Total records under management, last 12 months" className="border-0 px-0 pt-0" />
          <TrendArea data={growthData} color={tenant.brandColor} />
        </Card>
        <Card className="p-5">
          <CardHeader title="Engagement by module" subtitle="Interactions this quarter" className="border-0 px-0 pt-0" />
          <ComparisonBars data={engagementByModule} layout="vertical" color="#23ae80" height={240} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Recent activity" subtitle="Latest actions across the tenant" action={<Link to="/admin/audit" className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">Full audit log <ArrowRight className="h-3 w-3" /></Link>} />
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {auditEvents.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><ScrollText className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-700 dark:text-ink-200">{a.actor} · <span className="text-ink-500 dark:text-ink-400">{a.action.replace(/\./g, ' ')}</span></p>
                  <p className="truncate text-[11px] text-ink-400">{a.resource}</p>
                </div>
                <span className="shrink-0 text-[11px] text-ink-400">{formatRelative(a.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Top engaged alumni" subtitle="By engagement score" />
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {[...allPeople].sort((a, b) => b.engagementScore - a.engagementScore).slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</p>
                  <p className="truncate text-[11px] text-ink-400">{p.headline}</p>
                </div>
                <Badge tone={p.engagementScore >= 70 ? 'success' : p.engagementScore >= 40 ? 'warning' : 'neutral'}>{p.engagementScore}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

// =====================================================================
// Categories-style sidebar — "Executive Dashboard" pinned as the default,
// every custom dashboard listed below it with edit/clone/delete on hover.
// =====================================================================
function DashboardSidebar({ dashboards, selected, onSelect, onCreate, onRename, onDuplicate, onDelete, collapsed, onToggleCollapsed }: {
  dashboards: CustomDashboard[]
  selected: 'default' | string
  onSelect: (id: 'default' | string) => void
  onCreate: () => void
  onRename: (id: string, name: string) => void
  onDuplicate: (id: string) => void
  onDelete: (d: CustomDashboard) => void
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  const [query, setQuery] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const filtered = dashboards.filter((d) => d.name.toLowerCase().includes(query.trim().toLowerCase()))

  if (collapsed) {
    return (
      <div className="flex justify-start lg:block">
        <IconButton title="Show dashboards panel" onClick={onToggleCollapsed} className="border border-ink-200 dark:border-ink-700">
          <ChevronRight className="h-4 w-4" />
        </IconButton>
      </div>
    )
  }

  function startRename(d: CustomDashboard) {
    setRenamingId(d.id)
    setRenameValue(d.name)
  }
  function commitRename() {
    if (renamingId && renameValue.trim()) onRename(renamingId, renameValue.trim())
    setRenamingId(null)
  }

  const rowBase = 'flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors'

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
        <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">Dashboards</p>
        <IconButton title="Collapse panel" onClick={onToggleCollapsed}><ChevronLeft className="h-4 w-4" /></IconButton>
      </div>
      <div className="border-b border-ink-100 p-3 dark:border-ink-800">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dashboards…"
            className="h-8 w-full rounded-lg border border-ink-200 bg-ink-50 pl-8 pr-2 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-100"
          />
        </div>
      </div>

      <div className="p-2">
        <button onClick={() => onSelect('default')} className={clsx(rowBase, selected === 'default' ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800')}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"><LayoutDashboard className="h-4 w-4" /></span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">Executive Dashboard</span>
            <span className="block truncate text-[11px] text-ink-400">Default overview</span>
          </span>
        </button>

        <div className="mt-2 flex items-center justify-between px-2 pb-1 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400">My Dashboards</p>
          <IconButton title="New dashboard" onClick={onCreate}><Plus className="h-3.5 w-3.5" /></IconButton>
        </div>

        {filtered.length === 0 && <p className="px-2 py-3 text-xs text-ink-400">{dashboards.length === 0 ? 'No custom dashboards yet.' : 'No matches.'}</p>}

        <div className="space-y-0.5">
          {filtered.map((d) => (
            <div key={d.id} className="group">
              {renamingId === d.id ? (
                <div className="flex items-center gap-1 px-1 py-1">
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null) }}
                    className="h-7 flex-1 rounded border border-brand-300 bg-white px-2 text-xs focus:outline-none dark:bg-ink-900 dark:text-ink-100"
                  />
                  <IconButton title="Save" onClick={commitRename}><Check className="h-3.5 w-3.5" /></IconButton>
                  <IconButton title="Cancel" onClick={() => setRenamingId(null)}><X className="h-3.5 w-3.5" /></IconButton>
                </div>
              ) : (
                <div className={clsx('flex items-center gap-1 rounded-lg', selected === d.id ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-ink-100 dark:hover:bg-ink-800')}>
                  <button onClick={() => onSelect(d.id)} className={clsx(rowBase, 'flex-1', selected === d.id ? 'text-brand-700 dark:text-brand-300' : 'text-ink-600 dark:text-ink-300')}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><LayoutGrid className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{d.name}</span>
                      <span className="block truncate text-[11px] text-ink-400">{d.widgets.length} widget{d.widgets.length === 1 ? '' : 's'}</span>
                    </span>
                  </button>
                  <div className="hidden shrink-0 items-center gap-0.5 pr-1.5 group-hover:flex">
                    <IconButton title="Rename" onClick={() => startRename(d)}><Pencil className="h-3.5 w-3.5" /></IconButton>
                    <IconButton title="Duplicate" onClick={() => onDuplicate(d.id)}><Copy className="h-3.5 w-3.5" /></IconButton>
                    <IconButton title="Delete" onClick={() => onDelete(d)}><Trash2 className="h-3.5 w-3.5" /></IconButton>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

// =====================================================================
// Widget library — data sources, chart rendering, config/filter form.
// =====================================================================
const chartTypeMeta: Record<WidgetChartType, { label: string; icon: typeof BarChart3 }> = {
  panel: { label: 'Panel View', icon: Hash },
  table: { label: 'Data Table', icon: Table2 },
  bar: { label: 'Bar Chart', icon: BarChart3 },
  line: { label: 'Line Chart', icon: LineChartIcon },
  area: { label: 'Area Chart', icon: AreaChartIcon },
  pie: { label: 'Pie Chart', icon: PieChartIcon },
}

const sizeSpan: Record<WidgetSize, string> = { S: 'lg:col-span-3', M: 'lg:col-span-6', L: 'lg:col-span-8', XL: 'lg:col-span-12' }
const autoReloadLabels: Record<WidgetAutoReload, string> = { off: 'Off', '5m': 'Every 5 min', '15m': 'Every 15 min', '30m': 'Every 30 min', '1h': 'Every hour' }
const autoReloadMs: Record<Exclude<WidgetAutoReload, 'off'>, number> = { '5m': 300000, '15m': 900000, '30m': 1800000, '1h': 3600000 }

function groupByLabel(w: Pick<DashboardWidget, 'dataSource' | 'groupBy'>) {
  return dataSources[w.dataSource]?.groupByOptions.find((g) => g.key === w.groupBy)?.label ?? w.groupBy
}
function metricLabel(w: Pick<DashboardWidget, 'dataSource' | 'metric'>) {
  return dataSources[w.dataSource]?.metricOptions.find((m) => m.key === w.metric)?.label ?? w.metric
}
function formatValue(v: number, format: 'number' | 'currency' | 'decimal') {
  if (format === 'currency') return formatCurrency(v)
  return formatCompact(v)
}

function defaultWidgetForSource(source: WidgetDataSourceKey): Omit<DashboardWidget, 'id' | 'lastUpdatedAt'> {
  const cfg = dataSources[source]
  return {
    title: '',
    dataSource: source,
    groupBy: cfg.groupByOptions[0]?.key ?? '',
    metric: cfg.metricOptions[0]?.key ?? 'count',
    top: 5,
    showAll: false,
    timescale: 'all_time',
    autoReload: 'off',
    chartType: 'bar',
    colorPalette: 'brand',
    filters: [],
    size: 'M',
  }
}

function CreateDashboardPanel({ open, name, onNameChange, onClose, onCreate }: { open: boolean; name: string; onNameChange: (v: string) => void; onClose: () => void; onCreate: () => void }) {
  return (
    <SidePanel open={open} onClose={onClose} title="New dashboard" description="Give your dashboard a unique name — you can add widgets next." defaultSize="S" allowResize={false}
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={onCreate} disabled={!name.trim()}>Create</Button></>}
    >
      <div>
        <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Dashboard name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onCreate() }}
          placeholder="e.g. Alumni Engagement Overview"
          className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
        />
      </div>
    </SidePanel>
  )
}

function WidgetCard({ widget, dashboardTimescale, onEdit, onDuplicate, onDelete, onReload }: {
  widget: DashboardWidget
  dashboardTimescale: WidgetTimescale | null
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  onReload: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const effective = useMemo<DashboardWidget>(() => (dashboardTimescale ? { ...widget, timescale: dashboardTimescale } : widget), [widget, dashboardTimescale])
  const data = useMemo(() => computeWidgetData(effective), [effective])
  const format = metricFormat(widget)
  const palette = colorPalettes[widget.colorPalette] ?? colorPalettes.brand
  const ChartIcon = chartTypeMeta[widget.chartType].icon

  useEffect(() => {
    if (widget.autoReload === 'off') return
    const ms = autoReloadMs[widget.autoReload]
    const t = window.setInterval(onReload, ms)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget.autoReload, widget.id])

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-300 dark:text-ink-600" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{widget.title}</p>
            <p className="truncate text-[11px] text-ink-400">{dataSources[widget.dataSource]?.label} · {groupByLabel(widget)} · {metricLabel(widget)}</p>
          </div>
        </div>
        <div className="relative shrink-0">
          <div className="flex items-center gap-1">
            <Badge tone="neutral" className="hidden text-[10px] sm:inline-flex"><ChartIcon className="mr-1 h-3 w-3" />{chartTypeMeta[widget.chartType].label}</Badge>
            <IconButton title="Widget options" onClick={() => setMenuOpen((v) => !v)}><MoreHorizontal className="h-4 w-4" /></IconButton>
          </div>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-lg border border-ink-200 bg-white py-1 shadow-popover dark:border-ink-700 dark:bg-ink-900">
                <button onClick={() => { setMenuOpen(false); onEdit() }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                <button onClick={() => { setMenuOpen(false); onDuplicate() }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-ink-600 hover:bg-ink-50 dark:text-ink-300 dark:hover:bg-ink-800"><Copy className="h-3.5 w-3.5" /> Clone</button>
                <button onClick={() => { setMenuOpen(false); onDelete() }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-3 flex-1">
        {data.length === 0 ? (
          <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-1.5 text-center">
            <Inbox className="h-5 w-5 text-ink-300" />
            <p className="text-xs text-ink-400">No data matches these filters.</p>
          </div>
        ) : (
          <WidgetChart widget={widget} data={data} format={format} palette={palette} />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-2.5 text-[10px] text-ink-400 dark:border-ink-800">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Updated {formatRelative(widget.lastUpdatedAt)}</span>
        {widget.autoReload !== 'off' && <span className="flex items-center gap-1"><RefreshCw className="h-3 w-3" /> {autoReloadLabels[widget.autoReload]}</span>}
      </div>
    </Card>
  )
}

function WidgetChart({ widget, data, format, palette }: { widget: DashboardWidget; data: WidgetDataPoint[]; format: 'number' | 'currency' | 'decimal'; palette: string[] }) {
  switch (widget.chartType) {
    case 'panel': {
      const total = data.reduce((s, d) => s + d.value, 0)
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <p className="font-display text-4xl font-bold text-ink-900 dark:text-ink-50">{formatValue(total, format)}</p>
          <p className="mt-1.5 text-xs text-ink-400">{metricLabel(widget)}</p>
        </div>
      )
    }
    case 'table':
      return (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-ink-400"><th className="pb-2 font-medium">{groupByLabel(widget)}</th><th className="pb-2 text-right font-medium">{metricLabel(widget)}</th></tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.name} className="border-t border-ink-100 dark:border-ink-800">
                <td className="truncate py-1.5 pr-2 text-ink-700 dark:text-ink-200">{d.name}</td>
                <td className="py-1.5 text-right font-medium text-ink-900 dark:text-ink-50">{formatValue(d.value, format)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    case 'line':
      return <MultiLineTrend data={data.map((d) => ({ month: d.name, value: d.value }))} lines={[{ key: 'value', color: palette[0], name: metricLabel(widget) }]} height={220} />
    case 'area':
      return <TrendArea data={data.map((d) => ({ month: d.name, value: d.value }))} color={palette[0]} height={220} />
    case 'pie':
      return <Donut data={data} height={220} />
    case 'bar':
    default:
      return <ComparisonBars data={data} color={palette[0]} height={220} layout={data.length > 5 ? 'vertical' : 'horizontal'} />
  }
}

function WidgetFormPanel({ open, mode, initial, onClose, onSave }: {
  open: boolean
  mode: 'create' | 'edit'
  initial: DashboardWidget | null
  onClose: () => void
  onSave: (widget: Omit<DashboardWidget, 'id' | 'lastUpdatedAt'>) => void
}) {
  const [tab, setTab] = useState('config')
  const [draft, setDraft] = useState<Omit<DashboardWidget, 'id' | 'lastUpdatedAt'>>(() => initial ? stripMeta(initial) : defaultWidgetForSource('members'))
  const [filterField, setFilterField] = useState('')
  const [filterValue, setFilterValue] = useState('')
  const filterIdRef = useRef(0)

  useEffect(() => {
    if (open) {
      setDraft(initial ? stripMeta(initial) : defaultWidgetForSource('members'))
      setTab('config')
      setFilterField('')
      setFilterValue('')
    }
  }, [open, initial])

  const source = dataSources[draft.dataSource]
  const previewData = useMemo(() => computeWidgetData({ ...draft, id: 'preview', lastUpdatedAt: '' }), [draft])
  const previewTotal = previewData.reduce((s, d) => s + d.value, 0)

  function updateDataSource(key: WidgetDataSourceKey) {
    setDraft((d) => ({ ...defaultWidgetForSource(key), title: d.title, chartType: d.chartType, colorPalette: d.colorPalette, size: d.size }))
  }

  function addFilter() {
    if (!filterField || !filterValue) return
    filterIdRef.current += 1
    const rule: WidgetFilterRule = { id: `f_${filterIdRef.current}`, field: filterField, value: filterValue }
    setDraft((d) => ({ ...d, filters: [...d.filters, rule] }))
    setFilterValue('')
  }
  function removeFilter(id: string) {
    setDraft((d) => ({ ...d, filters: d.filters.filter((f) => f.id !== id) }))
  }

  const canSave = draft.title.trim().length > 0

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={mode === 'edit' ? 'Edit widget' : 'Add widget'}
      description="Configure the data this widget shows, then refine it with filters."
      defaultSize="L"
      footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button disabled={!canSave} onClick={() => onSave(draft)}>{mode === 'edit' ? 'Save changes' : 'Add widget'}</Button></>}
    >
      <Tabs tabs={[{ key: 'config', label: 'Configuration' }, { key: 'filter', label: 'Filter' }]} active={tab} onChange={setTab} />

      {tab === 'config' && (
        <div className="mt-5 space-y-4">
          <Field label="Title" required>
            <input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="e.g. Members by Batch" className={inputClass} />
          </Field>

          <Field label="Data Source" required>
            <select value={draft.dataSource} onChange={(e) => updateDataSource(e.target.value as WidgetDataSourceKey)} className={inputClass}>
              {Object.values(dataSources).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Group By" required>
              <select value={draft.groupBy} onChange={(e) => setDraft((d) => ({ ...d, groupBy: e.target.value }))} className={inputClass}>
                {source.groupByOptions.map((g) => <option key={g.key} value={g.key}>{g.label}</option>)}
              </select>
            </Field>
            <Field label="Type (metric)" required>
              <select value={draft.metric} onChange={(e) => setDraft((d) => ({ ...d, metric: e.target.value }))} className={inputClass}>
                {source.metricOptions.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Top" required>
              <input type="number" min={1} max={50} value={draft.top} disabled={draft.showAll} onChange={(e) => setDraft((d) => ({ ...d, top: Number(e.target.value) || 1 }))} className={inputClass} />
            </Field>
            <Field label="Show All">
              <label className="flex h-10 items-center gap-2 text-sm text-ink-600 dark:text-ink-300">
                <input type="checkbox" checked={draft.showAll} onChange={(e) => setDraft((d) => ({ ...d, showAll: e.target.checked }))} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                Show all groups
              </label>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Timescale" required>
              <select value={draft.timescale} onChange={(e) => setDraft((d) => ({ ...d, timescale: e.target.value as WidgetTimescale }))} className={inputClass}>
                {(Object.keys(timescaleLabels) as WidgetTimescale[]).map((k) => <option key={k} value={k}>{timescaleLabels[k]}</option>)}
              </select>
            </Field>
            <Field label="Auto Reload" required>
              <select value={draft.autoReload} onChange={(e) => setDraft((d) => ({ ...d, autoReload: e.target.value as WidgetAutoReload }))} className={inputClass}>
                {(Object.keys(autoReloadLabels) as WidgetAutoReload[]).map((k) => <option key={k} value={k}>{autoReloadLabels[k]}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Chart Type">
              <select value={draft.chartType} onChange={(e) => setDraft((d) => ({ ...d, chartType: e.target.value as WidgetChartType }))} className={inputClass}>
                {(Object.keys(chartTypeMeta) as WidgetChartType[]).map((k) => <option key={k} value={k}>{chartTypeMeta[k].label}</option>)}
              </select>
            </Field>
            <Field label="Color Palette">
              <select value={draft.colorPalette} onChange={(e) => setDraft((d) => ({ ...d, colorPalette: e.target.value as ColorPaletteKey }))} className={inputClass}>
                {Object.keys(colorPalettes).map((k) => <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Widget Size">
            <div className="flex gap-2">
              {(['S', 'M', 'L', 'XL'] as WidgetSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, size: s }))}
                  className={clsx('h-9 flex-1 rounded-lg border text-xs font-medium transition-colors', draft.size === s ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800')}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}

      {tab === 'filter' && (
        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-ink-600 dark:text-ink-300">Custom filters</p>
            <p className="mt-1 text-xs text-ink-400">Narrow this widget to matching {source.label.toLowerCase()} records. Filters combine with AND.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {draft.filters.length === 0 && <span className="text-xs text-ink-400">No filters applied — showing all {source.label.toLowerCase()}.</span>}
              {draft.filters.map((f) => {
                const fieldLabel = source.filterFields.find((ff) => ff.key === f.field)?.label ?? f.field
                return (
                  <span key={f.id} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                    {fieldLabel}: {f.value}
                    <button onClick={() => removeFilter(f.id)}><X className="h-3 w-3" /></button>
                  </span>
                )
              })}
            </div>
          </div>

          <div className="flex items-end gap-2 rounded-lg border border-dashed border-ink-200 p-3 dark:border-ink-700">
            <Field label="Field" className="flex-1">
              <select value={filterField} onChange={(e) => { setFilterField(e.target.value); setFilterValue('') }} className={inputClass}>
                <option value="">Select field…</option>
                {source.filterFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </Field>
            <Field label="Value" className="flex-1">
              <select value={filterValue} onChange={(e) => setFilterValue(e.target.value)} disabled={!filterField} className={inputClass}>
                <option value="">Select value…</option>
                {filterField && distinctFieldValues(draft.dataSource, filterField).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </Field>
            <Button size="sm" variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={addFilter} disabled={!filterField || !filterValue}>Add</Button>
          </div>

          <div className="rounded-lg bg-ink-50 p-4 dark:bg-ink-900/50">
            <div className="flex items-center gap-2 text-xs font-medium text-ink-600 dark:text-ink-300"><FilterIcon className="h-3.5 w-3.5" /> Apply changes to preview</div>
            <p className="mt-2 text-sm text-ink-800 dark:text-ink-100">
              <span className="font-display text-lg font-bold">{previewData.length}</span> group{previewData.length === 1 ? '' : 's'} · <span className="font-display text-lg font-bold">{formatValue(previewTotal, metricFormat(draft as DashboardWidget))}</span> total for {metricLabel(draft)}
            </p>
          </div>
        </div>
      )}
    </SidePanel>
  )
}

function stripMeta(w: DashboardWidget): Omit<DashboardWidget, 'id' | 'lastUpdatedAt'> {
  const { id: _id, lastUpdatedAt: _lastUpdatedAt, ...rest } = w
  return rest
}

const inputClass = 'h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 disabled:opacity-50'

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}{required && <span className="text-rose-500">*</span>}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  )
}

// Data-source registry for the custom Dashboards module. Each source exposes
// its record set plus a small menu of Group By / Metric / Filter fields, all
// computed against the app's real, already-live data modules — nothing here
// is invented sample data of its own.
import { Users, CalendarDays, MessagesSquare, Briefcase, Handshake, Gift, Newspaper } from 'lucide-react'
import type { ComponentType } from 'react'
import type { DashboardWidget, WidgetDataSourceKey, WidgetFilterRule, WidgetTimescale } from '../types'
import { alumniPeople } from './alumniPeople'
import { events } from './events'
import { communities } from './communities'
import { jobs } from './careers'
import { mentorships } from './mentorship'
import { campaigns } from './fundraising'
import { content } from './content'
import { NOW } from '../utils/dates'

interface FieldDef<T> {
  key: string
  label: string
  extract: (record: T) => string
}

interface MetricDef<T> {
  key: string
  label: string
  aggregate: (records: T[]) => number
  format?: 'number' | 'currency' | 'decimal'
}

interface DataSourceConfig<T = any> {
  key: WidgetDataSourceKey
  label: string
  icon: ComponentType<{ className?: string }>
  records: () => T[]
  timeField?: (record: T) => string | undefined
  groupByOptions: FieldDef<T>[]
  metricOptions: MetricDef<T>[]
  filterFields: FieldDef<T>[]
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return Math.round((nums.reduce((s, n) => s + n, 0) / nums.length) * 10) / 10
}

export const dataSources: Record<WidgetDataSourceKey, DataSourceConfig> = {
  members: {
    key: 'members', label: 'Members', icon: Users,
    records: () => alumniPeople,
    timeField: (p) => p.joinedAt,
    groupByOptions: [
      { key: 'batch', label: 'Batch', extract: (p) => p.academicRecords[0]?.batch ? `Batch ${p.academicRecords[0].batch}` : 'Unspecified' },
      { key: 'location', label: 'Location', extract: (p) => p.location || 'Unspecified' },
    ],
    metricOptions: [
      { key: 'count', label: 'Member Count', aggregate: (r) => r.length },
      { key: 'avg_engagement', label: 'Avg Engagement Score', aggregate: (r) => avg(r.map((p: any) => p.engagementScore)) },
    ],
    filterFields: [
      { key: 'batch', label: 'Batch', extract: (p) => p.academicRecords[0]?.batch ? `Batch ${p.academicRecords[0].batch}` : 'Unspecified' },
      { key: 'location', label: 'Location', extract: (p) => p.location || 'Unspecified' },
    ],
  },
  events: {
    key: 'events', label: 'Events', icon: CalendarDays,
    records: () => events,
    timeField: (e) => e.startAt,
    groupByOptions: [
      { key: 'type', label: 'Event Type', extract: (e) => e.type },
      { key: 'mode', label: 'Mode', extract: (e) => e.mode },
      { key: 'status', label: 'Status', extract: (e) => e.status },
    ],
    metricOptions: [
      { key: 'count', label: 'Event Count', aggregate: (r) => r.length },
      { key: 'registrations', label: 'Total Registrations', aggregate: (r) => r.reduce((s: number, e: any) => s + e.registeredCount, 0) },
      { key: 'attended', label: 'Total Attended', aggregate: (r) => r.reduce((s: number, e: any) => s + e.attendedCount, 0) },
    ],
    filterFields: [
      { key: 'type', label: 'Event Type', extract: (e) => e.type },
      { key: 'mode', label: 'Mode', extract: (e) => e.mode },
      { key: 'status', label: 'Status', extract: (e) => e.status },
    ],
  },
  communities: {
    key: 'communities', label: 'Communities', icon: MessagesSquare,
    records: () => communities,
    timeField: (g) => g.createdAt,
    groupByOptions: [
      { key: 'type', label: 'Community Type', extract: (g) => g.type },
      { key: 'privacy', label: 'Privacy', extract: (g) => g.privacy },
    ],
    metricOptions: [
      { key: 'count', label: 'Community Count', aggregate: (r) => r.length },
      { key: 'members', label: 'Total Members', aggregate: (r) => r.reduce((s: number, g: any) => s + g.memberCount, 0) },
      { key: 'posts', label: 'Total Posts', aggregate: (r) => r.reduce((s: number, g: any) => s + g.postCount, 0) },
    ],
    filterFields: [
      { key: 'type', label: 'Community Type', extract: (g) => g.type },
      { key: 'privacy', label: 'Privacy', extract: (g) => g.privacy },
    ],
  },
  careers: {
    key: 'careers', label: 'Careers', icon: Briefcase,
    records: () => jobs,
    timeField: (j) => j.postedAt,
    groupByOptions: [
      { key: 'employmentType', label: 'Employment Type', extract: (j) => j.employmentType },
      { key: 'remoteMode', label: 'Remote Mode', extract: (j) => j.remoteMode },
      { key: 'status', label: 'Status', extract: (j) => j.status },
    ],
    metricOptions: [
      { key: 'count', label: 'Job Count', aggregate: (r) => r.length },
      { key: 'applicants', label: 'Total Applicants', aggregate: (r) => r.reduce((s: number, j: any) => s + j.applicantCount, 0) },
      { key: 'views', label: 'Total Views', aggregate: (r) => r.reduce((s: number, j: any) => s + j.viewCount, 0) },
    ],
    filterFields: [
      { key: 'employmentType', label: 'Employment Type', extract: (j) => j.employmentType },
      { key: 'remoteMode', label: 'Remote Mode', extract: (j) => j.remoteMode },
      { key: 'status', label: 'Status', extract: (j) => j.status },
    ],
  },
  mentorship: {
    key: 'mentorship', label: 'Mentorship', icon: Handshake,
    records: () => mentorships,
    timeField: (m) => m.startedAt,
    groupByOptions: [
      { key: 'program', label: 'Program', extract: (m) => m.program },
      { key: 'status', label: 'Status', extract: (m) => m.status },
    ],
    metricOptions: [
      { key: 'count', label: 'Mentorship Count', aggregate: (r) => r.length },
      { key: 'sessions', label: 'Sessions Completed', aggregate: (r) => r.reduce((s: number, m: any) => s + m.sessionsCompleted, 0) },
    ],
    filterFields: [
      { key: 'program', label: 'Program', extract: (m) => m.program },
      { key: 'status', label: 'Status', extract: (m) => m.status },
    ],
  },
  fundraising: {
    key: 'fundraising', label: 'Fundraising', icon: Gift,
    records: () => campaigns,
    timeField: (c) => c.startAt,
    groupByOptions: [
      { key: 'type', label: 'Campaign Type', extract: (c) => c.type },
      { key: 'status', label: 'Status', extract: (c) => c.status },
    ],
    metricOptions: [
      { key: 'count', label: 'Campaign Count', aggregate: (r) => r.length },
      { key: 'raised', label: 'Total Raised', aggregate: (r) => r.reduce((s: number, c: any) => s + c.raised, 0), format: 'currency' },
      { key: 'donors', label: 'Total Donors', aggregate: (r) => r.reduce((s: number, c: any) => s + c.donorCount, 0) },
    ],
    filterFields: [
      { key: 'type', label: 'Campaign Type', extract: (c) => c.type },
      { key: 'status', label: 'Status', extract: (c) => c.status },
    ],
  },
  content: {
    key: 'content', label: 'Content', icon: Newspaper,
    records: () => content,
    timeField: (c) => c.publishedAt ?? c.updatedAt,
    groupByOptions: [
      { key: 'type', label: 'Content Type', extract: (c) => c.type },
      { key: 'state', label: 'State', extract: (c) => c.state },
    ],
    metricOptions: [
      { key: 'count', label: 'Content Count', aggregate: (r) => r.length },
      { key: 'views', label: 'Total Views', aggregate: (r) => r.reduce((s: number, c: any) => s + c.views, 0) },
    ],
    filterFields: [
      { key: 'type', label: 'Content Type', extract: (c) => c.type },
      { key: 'state', label: 'State', extract: (c) => c.state },
    ],
  },
}

export const timescaleLabels: Record<WidgetTimescale, string> = {
  all_time: 'All time',
  today: 'Today',
  this_week: 'This week',
  this_month: 'This month',
  last_7: 'Last 7 days',
  last_30: 'Last 30 days',
  last_90: 'Last 90 days',
  last_365: 'Last 365 days',
}

function withinTimescale(dateStr: string | undefined, timescale: WidgetTimescale): boolean {
  if (timescale === 'all_time') return true
  if (!dateStr) return false
  const d = new Date(dateStr).getTime()
  const now = NOW.getTime()
  const startOfToday = new Date(NOW.getFullYear(), NOW.getMonth(), NOW.getDate()).getTime()
  switch (timescale) {
    case 'today': return d >= startOfToday && d <= now
    case 'this_week': return d >= startOfToday - 6 * 86400000 && d <= now
    case 'this_month': return d >= new Date(NOW.getFullYear(), NOW.getMonth(), 1).getTime() && d <= now
    case 'last_7': return d >= now - 7 * 86400000 && d <= now
    case 'last_30': return d >= now - 30 * 86400000 && d <= now
    case 'last_90': return d >= now - 90 * 86400000 && d <= now
    case 'last_365': return d >= now - 365 * 86400000 && d <= now
    default: return true
  }
}

export interface WidgetDataPoint { name: string; value: number }

export function distinctFieldValues(sourceKey: WidgetDataSourceKey, fieldKey: string): string[] {
  const source = dataSources[sourceKey]
  const field = source.filterFields.find((f) => f.key === fieldKey)
  if (!field) return []
  const values = new Set<string>()
  source.records().forEach((r) => values.add(field.extract(r)))
  return Array.from(values).sort()
}

export function computeWidgetData(widget: DashboardWidget, extraFilters: WidgetFilterRule[] = []): WidgetDataPoint[] {
  const source = dataSources[widget.dataSource]
  if (!source) return []
  let records = source.records()

  const effectiveTimescale = widget.timescale
  if (source.timeField) {
    records = records.filter((r) => withinTimescale(source.timeField!(r), effectiveTimescale))
  }

  const allFilters = [...widget.filters, ...extraFilters]
  allFilters.forEach((f) => {
    const field = source.filterFields.find((ff) => ff.key === f.field)
    if (field) records = records.filter((r) => field.extract(r) === f.value)
  })

  const groupByDef = source.groupByOptions.find((g) => g.key === widget.groupBy)
  const metricDef = source.metricOptions.find((m) => m.key === widget.metric)

  const buckets = new Map<string, any[]>()
  records.forEach((r) => {
    const key = groupByDef ? (groupByDef.extract(r) || 'Unspecified') : 'All'
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(r)
  })

  let result: WidgetDataPoint[] = Array.from(buckets.entries()).map(([name, recs]) => ({
    name,
    value: metricDef ? metricDef.aggregate(recs) : recs.length,
  }))
  result.sort((a, b) => b.value - a.value)
  // Panel View reports one headline total across every matching record, so
  // Top/Show All (which only make sense for a multi-group chart) never
  // truncate it — truncating here would silently under-report the total.
  if (!widget.showAll && widget.chartType !== 'panel') result = result.slice(0, Math.max(1, widget.top))
  return result
}

export function metricFormat(widget: DashboardWidget): 'number' | 'currency' | 'decimal' {
  const source = dataSources[widget.dataSource]
  const metricDef = source?.metricOptions.find((m) => m.key === widget.metric)
  return metricDef?.format ?? 'number'
}

export const colorPalettes: Record<string, string[]> = {
  brand: ['#6c5cf5', '#8b7cf7', '#a99cf9', '#c7bcfb', '#5546d4'],
  sunset: ['#e6595f', '#e6a23c', '#f2c14e', '#f47c60', '#c95bd8'],
  ocean: ['#3f9bdc', '#23ae80', '#0ea5b7', '#6cc4e8', '#178d68'],
  forest: ['#23ae80', '#48c99a', '#7fdfb9', '#178d68', '#147155'],
}

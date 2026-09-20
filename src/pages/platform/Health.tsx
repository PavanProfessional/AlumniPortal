import { Activity, CheckCircle2, AlertTriangle } from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { MultiLineTrend } from '../../components/charts/Charts'
import { multiSeries } from '../../utils/series'
import { daysAgo, formatDateTime } from '../../utils/dates'

const services = [
  { name: 'API Gateway', status: 'operational', uptime: '99.98%' },
  { name: 'Identity & Auth', status: 'operational', uptime: '99.99%' },
  { name: 'Search Index', status: 'operational', uptime: '99.95%' },
  { name: 'Email Delivery', status: 'degraded', uptime: '99.62%' },
  { name: 'Background Jobs', status: 'operational', uptime: '99.91%' },
  { name: 'Webhook Delivery', status: 'operational', uptime: '99.89%' },
  { name: 'Payments (Stripe)', status: 'operational', uptime: '99.97%' },
  { name: 'Analytics Warehouse', status: 'operational', uptime: '99.90%' },
]

const incidents = [
  { title: 'Elevated email delivery latency', severity: 'Minor', started: daysAgo(0.2), status: 'Investigating' },
  { title: 'Search indexing delay for new imports', severity: 'Minor', started: daysAgo(3), status: 'Resolved' },
  { title: 'Webhook retries spiked for CRM connector', severity: 'Minor', started: daysAgo(9), status: 'Resolved' },
]

export default function PlatformHealth() {
  const latencyData = multiSeries(707, [{ key: 'p50', base: 80, growth: 0 }, { key: 'p95', base: 240, growth: 0 }])

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Reliability" title="System Health" description="Platform-wide availability, latency and background job performance." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="API availability (30d)" value="99.96%" icon={<Activity className="h-4 w-4" />} deltaTone="success" />
        <StatCard label="Latency p50" value="82ms" />
        <StatCard label="Latency p95" value="245ms" />
        <StatCard label="Background job success" value="99.4%" />
      </div>

      <Card className="p-5">
        <CardHeader title="API latency (ms), last 12 months" className="border-0 px-0 pt-0" />
        <MultiLineTrend data={latencyData} lines={[{ key: 'p50', color: '#6c5cf5', name: 'p50' }, { key: 'p95', color: '#e6595f', name: 'p95' }]} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Service status" />
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {services.map((s) => (
              <div key={s.name} className="flex items-center gap-3 px-5 py-3">
                {s.status === 'operational' ? <CheckCircle2 className="h-4 w-4 text-accent-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                <span className="flex-1 text-sm text-ink-700 dark:text-ink-200">{s.name}</span>
                <span className="text-xs text-ink-400">{s.uptime}</span>
                <Badge tone={s.status === 'operational' ? 'success' : 'warning'}>{s.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Recent incidents" />
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {incidents.map((i) => (
              <div key={i.title} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{i.title}</p>
                  <Badge tone={i.status === 'Resolved' ? 'success' : 'warning'}>{i.status}</Badge>
                </div>
                <p className="mt-1 text-xs text-ink-400">{i.severity} · Started {formatDateTime(i.started)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

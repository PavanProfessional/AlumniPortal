import { useState } from 'react'
import { Download, FileClock } from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard, Button } from '../../components/ui/Primitives'
import { Tabs } from '../../components/ui/Tabs'
import { TrendArea, ComparisonBars, Donut, MultiLineTrend } from '../../components/charts/Charts'
import { monthlySeries, multiSeries } from '../../utils/series'
import { allPeople } from '../../data/people'
import { jobs } from '../../data/careers'
import { mentorships } from '../../data/mentorship'
import { campaigns } from '../../data/fundraising'
import { formatCompact, formatCurrency, formatPercent } from '../../utils/format'
import { useAppState } from '../../context/AppStateContext'

const tabs = [
  { key: 'executive', label: 'Executive' }, { key: 'alumni', label: 'Alumni Office' },
  { key: 'careers', label: 'Careers' }, { key: 'fundraising', label: 'Fundraising' },
]

const savedReports = [
  { name: 'Monthly Board Report', schedule: 'Monthly · 1st', owner: 'Grace Hall' },
  { name: 'Event ROI Summary', schedule: 'After each event', owner: 'Marcus Boyd' },
  { name: 'Data Quality Audit', schedule: 'Weekly · Monday', owner: 'Priya Anand' },
  { name: 'Donor Retention Cohorts', schedule: 'Quarterly', owner: 'Grace Hall' },
]

export default function AdminAnalytics() {
  const { tenant } = useAppState()
  const [tab, setTab] = useState('executive')

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Institutional intelligence" title="Analytics & Reporting" description="Governed KPIs so dashboards never disagree on what 'active alumni' means." action={<Button variant="outline" icon={<Download className="h-3.5 w-3.5" />}>Export report</Button>} />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'executive' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total alumni" value={formatCompact(24186)} />
            <StatCard label="Verified" value={formatCompact(18420)} />
            <StatCard label="Monthly active" value={formatCompact(9310)} delta="+6.4%" />
            <StatCard label="Engagement index" value="72/100" />
          </div>
          <Card className="p-5">
            <CardHeader title="Cross-module engagement" className="border-0 px-0 pt-0" />
            <MultiLineTrend
              data={multiSeries(404, [{ key: 'events', base: 1200, growth: 0.02 }, { key: 'careers', base: 400, growth: 0.03 }, { key: 'mentoring', base: 180, growth: 0.025 }, { key: 'giving', base: 260, growth: 0.015 }])}
              lines={[{ key: 'events', color: tenant.brandColor, name: 'Events' }, { key: 'careers', color: '#e6a23c', name: 'Careers' }, { key: 'mentoring', color: '#23ae80', name: 'Mentoring' }, { key: 'giving', color: '#e6595f', name: 'Giving' }]}
            />
          </Card>
        </div>
      )}

      {tab === 'alumni' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Profile completion (avg)" value={formatPercent(allPeople.reduce((s, p) => s + p.profileCompletion, 0) / allPeople.length)} />
            <StatCard label="Unreachable records" value="1,204" deltaTone="danger" />
            <StatCard label="Top geography" value="San Francisco" />
            <StatCard label="Verified this quarter" value="+1,840" deltaTone="success" />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="p-5"><CardHeader title="Engagement by cohort" className="border-0 px-0 pt-0" /><ComparisonBars data={[{ name: '2016', value: 82 }, { name: '2018', value: 74 }, { name: '2020', value: 68 }, { name: '2022', value: 59 }]} color={tenant.brandColor} /></Card>
            <Card className="p-5"><CardHeader title="Verification status" className="border-0 px-0 pt-0" /><Donut data={[{ name: 'Institution-verified', value: 62 }, { name: 'Self-verified', value: 18 }, { name: 'Imported', value: 12 }, { name: 'Unverified', value: 8 }]} /></Card>
          </div>
        </div>
      )}

      {tab === 'careers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Open jobs" value={jobs.filter((j) => j.status === 'published').length} />
            <StatCard label="Applications (90d)" value="1,840" />
            <StatCard label="Referral rate" value="31%" />
            <StatCard label="Placements (YTD)" value="212" deltaTone="success" delta="+18" />
          </div>
          <Card className="p-5"><CardHeader title="Applications trend" className="border-0 px-0 pt-0" /><TrendArea data={monthlySeries(202, 140, 0.04, 0.15)} color="#e6a23c" /></Card>
        </div>
      )}

      {tab === 'fundraising' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Total raised (active)" value={formatCurrency(campaigns.reduce((s, c) => s + c.raised, 0))} />
            <StatCard label="Recurring donors" value="642" />
            <StatCard label="Retention rate" value="74%" deltaTone="success" delta="+2pt" />
            <StatCard label="Active mentorships" value={mentorships.filter((m) => m.status === 'active').length} />
          </div>
          <Card className="p-5"><CardHeader title="Giving trend" className="border-0 px-0 pt-0" /><TrendArea data={monthlySeries(303, 28000, 0.02, 0.12)} color="#23ae80" /></Card>
        </div>
      )}

      <Card>
        <CardHeader title="Saved & scheduled reports" subtitle="Shared dashboards with governed metric definitions" />
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {savedReports.map((r) => (
            <div key={r.name} className="flex items-center gap-3 px-5 py-3.5">
              <FileClock className="h-4 w-4 shrink-0 text-ink-400" />
              <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink-800 dark:text-ink-100">{r.name}</p><p className="text-xs text-ink-400">{r.schedule} · Owner: {r.owner}</p></div>
              <Button variant="outline" size="sm">Open</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

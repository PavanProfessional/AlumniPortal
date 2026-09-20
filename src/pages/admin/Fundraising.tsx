import { useState } from 'react'
import { Gift, TrendingUp } from 'lucide-react'
import { SectionHeading, Card, CardHeader, StatCard, ProgressBar, Avatar, Button, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge, Badge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { Tabs } from '../../components/ui/Tabs'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { TrendArea } from '../../components/charts/Charts'
import { campaigns, donations } from '../../data/fundraising'
import { personById } from '../../data/people'
import type { Donation, FundraisingCampaign } from '../../types'
import { formatCurrency } from '../../utils/format'
import { formatDate } from '../../utils/dates'
import { monthlySeries } from '../../utils/series'

const tabs = [{ key: 'campaigns', label: 'Campaigns' }, { key: 'donations', label: 'Donations' }, { key: 'analytics', label: 'Analytics' }]

export default function AdminFundraising() {
  const [tab, setTab] = useState('campaigns')
  const totalRaised = campaigns.reduce((s, c) => s + c.raised, 0)
  const totalDonors = new Set(donations.map((d) => d.donorId)).size

  const [campaignQuery, setCampaignQuery] = useState('')
  const [campaignView, setCampaignView] = useState<ViewMode>('table')
  const filteredCampaigns = campaigns.filter((c) => `${c.title} ${c.type}`.toLowerCase().includes(campaignQuery.trim().toLowerCase()))

  const [donationQuery, setDonationQuery] = useState('')
  const filteredDonations = donations.filter((d) => {
    const p = personById(d.donorId)
    const campaign = campaigns.find((c) => c.id === d.campaignId)
    return `${p ? `${p.firstName} ${p.lastName}` : ''} ${campaign?.title ?? ''}`.toLowerCase().includes(donationQuery.trim().toLowerCase())
  })

  const campaignColumns: Column<FundraisingCampaign>[] = [
    { header: 'Campaign', accessor: (c) => <div><p className="font-medium text-ink-800 dark:text-ink-100">{c.title}</p><p className="text-xs text-ink-400">{c.type}</p></div> },
    { header: 'Progress', accessor: (c) => (
      <div className="w-40"><div className="flex justify-between text-[11px]"><span>{formatCurrency(c.raised)}</span><span className="text-ink-400">of {formatCurrency(c.goal)}</span></div><ProgressBar value={(c.raised / c.goal) * 100} className="mt-1" tone="success" /></div>
    ) },
    { header: 'Donors', accessor: (c) => c.donorCount.toLocaleString() },
    { header: 'Recurring rev.', accessor: (c) => formatCurrency(c.recurringRevenue) },
    { header: 'Status', accessor: (c) => <StatusBadge status={c.status} /> },
  ]

  const donationColumns: Column<Donation>[] = [
    { header: 'Donor', accessor: (d) => {
      const p = personById(d.donorId)
      return d.anonymous ? <span className="text-xs text-ink-400 italic">Anonymous</span> : p ? <div className="flex items-center gap-2.5"><Avatar name={`${p.firstName} ${p.lastName}`} color={p.avatarColor} size="sm" /><span className="font-medium text-ink-800 dark:text-ink-100">{p.firstName} {p.lastName}</span></div> : '—'
    } },
    { header: 'Campaign', accessor: (d) => <span className="text-xs text-ink-500">{campaigns.find((c) => c.id === d.campaignId)?.title}</span> },
    { header: 'Amount', accessor: (d) => <span className="font-semibold text-ink-800 dark:text-ink-100">{formatCurrency(d.amount)}</span> },
    { header: 'Recurring', accessor: (d) => d.recurring ? <Badge tone="info">{d.frequency}</Badge> : '—' },
    { header: 'Status', accessor: (d) => <StatusBadge status={d.status} /> },
    { header: 'Date', accessor: (d) => <span className="text-xs text-ink-400">{formatDate(d.createdAt)}</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Advancement" title="Fundraising" description="Campaigns, donor relationships and payment reconciliation." action={<Button icon={<Gift className="h-3.5 w-3.5" />}>New campaign</Button>} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total raised" value={formatCurrency(totalRaised)} icon={<TrendingUp className="h-4 w-4" />} />
        <StatCard label="Unique donors" value={totalDonors.toLocaleString()} />
        <StatCard label="Active campaigns" value={campaigns.filter((c) => c.status === 'active').length} />
        <StatCard label="Avg. gift size" value={formatCurrency(Math.round(donations.reduce((s, d) => s + d.amount, 0) / donations.length))} />
      </div>

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'campaigns' && (
        <Card>
          <CardHeader title="All campaigns" action={<ViewToggle view={campaignView} onChange={setCampaignView} />} />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search campaigns…" value={campaignQuery} onChange={(e) => setCampaignQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          {campaignView === 'table' ? (
            <DataTable columns={campaignColumns} rows={filteredCampaigns} keyFn={(c) => c.id} />
          ) : (
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCampaigns.map((c) => (
                <Card key={c.id} className="overflow-hidden">
                  <div className="h-2" style={{ backgroundColor: c.coverColor }} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{c.title}</p>
                      <StatusBadge status={c.status} />
                    </div>
                    <p className="text-xs text-ink-400">{c.type}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-[11px]"><span className="font-medium text-ink-700 dark:text-ink-200">{formatCurrency(c.raised)}</span><span className="text-ink-400">of {formatCurrency(c.goal)}</span></div>
                      <ProgressBar value={(c.raised / c.goal) * 100} className="mt-1" tone="success" />
                    </div>
                    <p className="mt-2 text-xs text-ink-400">{c.donorCount.toLocaleString()} donors</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}
      {tab === 'donations' && (
        <Card>
          <CardHeader title="Recent donations" subtitle="Amounts and donor identity require strict permissions" />
          <div className="border-b border-ink-100 px-5 py-3.5 dark:border-ink-800">
            <SearchInput placeholder="Search by donor or campaign…" value={donationQuery} onChange={(e) => setDonationQuery(e.target.value)} className="sm:max-w-sm" />
          </div>
          <DataTable columns={donationColumns} rows={filteredDonations} keyFn={(d) => d.id} defaultPageSize={25} />
        </Card>
      )}
      {tab === 'analytics' && (
        <Card className="p-5">
          <CardHeader title="Monthly giving trend" className="border-0 px-0 pt-0" />
          <TrendArea data={monthlySeries(303, 28000, 0.02, 0.12)} color="#23ae80" />
        </Card>
      )}
    </div>
  )
}

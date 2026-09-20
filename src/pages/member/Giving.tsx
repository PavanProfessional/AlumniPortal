import { useState } from 'react'
import { Gift, Heart, Receipt, Repeat } from 'lucide-react'
import { SectionHeading, Card, Button, ProgressBar } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { SidePanel } from '../../components/ui/SidePanel'
import { useToast } from '../../components/ui/Toast'
import { campaigns, myDonations } from '../../data/fundraising'
import { formatCurrency, formatCompact } from '../../utils/format'
import { formatDate } from '../../utils/dates'
import { useAppState } from '../../context/AppStateContext'

const amounts = [25, 50, 100, 250, 500]

export default function MemberGiving() {
  const { currentUser } = useAppState()
  const notify = useToast()
  const [active, setActive] = useState<typeof campaigns[number] | null>(null)
  const [amount, setAmount] = useState(100)
  const [recurring, setRecurring] = useState(false)
  const totalGiven = myDonations.reduce((s, d) => s + d.amount, 0)

  function confirmDonation() {
    const campaignTitle = active?.title
    setActive(null)
    notify({
      message: `Thank you for your ${formatCurrency(amount)}${recurring ? '/mo' : ''} gift`,
      description: `Your donation to ${campaignTitle} was received. A receipt has been sent to your email.`,
      type: 'success',
      position: 'top-right',
    })
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Pay it forward" title="Giving" description="Support scholarships, campus infrastructure and the causes that shaped your journey." />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5"><p className="text-xs font-medium uppercase text-ink-500">Lifetime giving</p><p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{formatCurrency(totalGiven)}</p></Card>
        <Card className="p-5"><p className="text-xs font-medium uppercase text-ink-500">Donor tier</p><p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{currentUser.givingTier}</p></Card>
        <Card className="p-5"><p className="text-xs font-medium uppercase text-ink-500">Active recurring gifts</p><p className="mt-2 font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{myDonations.filter((d) => d.recurring).length}</p></Card>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink-800 dark:text-ink-100">Active campaigns</h3>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {campaigns.filter((c) => c.status === 'active').map((c) => {
            const pct = Math.min(100, (c.raised / c.goal) * 100)
            return (
              <Card key={c.id} className="overflow-hidden">
                <div className="h-3" style={{ backgroundColor: c.coverColor }} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{c.title}</p>
                    <Badge tone="brand">{c.type}</Badge>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">{c.description}</p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-ink-800 dark:text-ink-100">{formatCurrency(c.raised)}</span>
                      <span className="text-ink-400">of {formatCurrency(c.goal)}</span>
                    </div>
                    <ProgressBar value={pct} className="mt-1.5" tone="success" />
                    <p className="mt-1.5 text-[11px] text-ink-400">{c.donorCount.toLocaleString()} donors · {formatCompact(pct)}% funded</p>
                  </div>
                  <Button className="mt-4 w-full justify-center" icon={<Heart className="h-3.5 w-3.5" />} onClick={() => setActive(c)}>Donate now</Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 dark:border-ink-800">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-800 dark:text-ink-100"><Receipt className="h-4 w-4" /> My donation history</h3>
        </div>
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {myDonations.map((d) => {
            const campaign = campaigns.find((c) => c.id === d.campaignId)
            return (
              <div key={d.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-50 text-accent-600 dark:bg-accent-500/10 dark:text-accent-400"><Gift className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{campaign?.title}</p>
                  <p className="text-xs text-ink-400">{formatDate(d.createdAt)} {d.recurring && `· ${d.frequency}`}</p>
                </div>
                <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{formatCurrency(d.amount)}</p>
                {d.receiptSent && <Badge tone="success" className="hidden sm:inline-flex">Receipt sent</Badge>}
              </div>
            )
          })}
        </div>
      </Card>

      <SidePanel
        open={!!active}
        onClose={() => setActive(null)}
        title={`Donate to ${active?.title}`}
        description="Every contribution is tax-deductible and receipted automatically."
        defaultSize="S"
        footer={
          <>
            <Button variant="ghost" onClick={() => setActive(null)}>Cancel</Button>
            <Button onClick={confirmDonation}>Donate {formatCurrency(amount)}{recurring ? '/mo' : ''}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-2">
            {amounts.map((a) => (
              <button key={a} onClick={() => setAmount(a)} className={`rounded-lg border py-2 text-sm font-semibold transition-colors ${amount === a ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-ink-200 text-ink-600 dark:border-ink-700 dark:text-ink-300'}`}>${a}</button>
            ))}
          </div>
          <label className="flex items-center gap-2.5 text-sm text-ink-600 dark:text-ink-300">
            <input type="checkbox" checked={recurring} onChange={() => setRecurring((v) => !v)} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
            <Repeat className="h-3.5 w-3.5" /> Make this a monthly recurring gift
          </label>
        </div>
      </SidePanel>
    </div>
  )
}

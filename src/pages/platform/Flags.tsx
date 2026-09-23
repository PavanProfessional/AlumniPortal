import { useState } from 'react'
import { Flag, PlusCircle } from 'lucide-react'
import { SectionHeading, Card, ProgressBar, Button } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'

const flags = [
  { key: 'mentoring', label: 'Mentoring module', scope: 'Plan: Growth+', rollout: 100, owner: 'Product · Dana Reyes', retires: 'N/A — GA' },
  { key: 'fundraising', label: 'Fundraising module', scope: 'Plan: Growth+', rollout: 100, owner: 'Product · Dana Reyes', retires: 'N/A — GA' },
  { key: 'advanced-analytics', label: 'Advanced analytics dashboards', scope: 'Plan: Enterprise', rollout: 100, owner: 'Analytics · Sam Ito', retires: 'N/A — GA' },
  { key: 'ai-matching-v2', label: 'AI-assisted mentor matching v2', scope: 'Percentage rollout', rollout: 35, owner: 'Growth · Lena Park', retires: '2026-11-01' },
  { key: 'employer-portal', label: 'Employer partner portal', scope: 'Selected tenants', rollout: 12, owner: 'Careers · Omar Haddad', retires: '2026-12-15' },
  { key: 'new-nav', label: 'Redesigned admin navigation', scope: 'Percentage rollout', rollout: 60, owner: 'Design Systems · Chen Wu', retires: '2026-10-01' },
  { key: 'sandbox-tenants', label: 'Self-serve sandbox tenants', scope: 'Plan: Enterprise', rollout: 100, owner: 'Platform · Priya Anand', retires: 'N/A — GA' },
]

export default function PlatformFlags() {
  const [enabled, setEnabled] = useState<Set<string>>(new Set(flags.filter((f) => f.rollout > 0).map((f) => f.key)))

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Platform controls" title="Feature Flags" description="Platform → plan → tenant → role overrides. Every flag needs an owner and a retirement date." action={<Button icon={<PlusCircle className="h-3.5 w-3.5" />}>New flag</Button>} />

      <Card>
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {flags.map((f) => {
            const on = enabled.has(f.key)
            return (
              <div key={f.key} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><Flag className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{f.label}</p>
                    <p className="text-xs text-ink-400">{f.scope} · Owner: {f.owner} · Retires: {f.retires}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:w-56">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] text-ink-400"><span>Rollout</span><span>{f.rollout}%</span></div>
                    <ProgressBar value={f.rollout} className="mt-1" />
                  </div>
                  <button
                    onClick={() => setEnabled((prev) => { const next = new Set(prev); next.has(f.key) ? next.delete(f.key) : next.add(f.key); return next })}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'}`}
                  >
                    <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
      <p className="text-xs text-ink-400">{flags.length} flags tracked · <Badge className="ml-1">{flags.filter((f) => f.retires === 'N/A — GA').length} generally available</Badge></p>
    </div>
  )
}

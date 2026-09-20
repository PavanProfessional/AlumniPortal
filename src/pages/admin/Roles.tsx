import { Fragment, useMemo, useState } from 'react'
import { ShieldCheck, Users, Clock } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { roles, permissionCatalog } from '../../data/roles'

const tabTypes = [{ key: 'roles', label: 'Roles' }, { key: 'matrix', label: 'Permission matrix' }, { key: 'delegation', label: 'Delegation' }]

export default function AdminRoles() {
  const [tab, setTab] = useState('roles')
  const [selectedRoleId, setSelectedRoleId] = useState(roles[2].id)
  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0]

  const modules = useMemo(() => Array.from(new Set(permissionCatalog.map((p) => p.module))), [])

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Access control" title="Roles & Permissions" description="Default-deny, scope-aware authorization. UI hiding is never a substitute for server-side enforcement." action={<Button icon={<ShieldCheck className="h-3.5 w-3.5" />}>New role</Button>} />

      <Tabs tabs={tabTypes} active={tab} onChange={setTab} />

      {tab === 'roles' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader title="System & custom roles" />
            <div className="max-h-[560px] divide-y divide-ink-100 overflow-y-auto dark:divide-ink-800">
              {roles.map((r) => (
                <button key={r.id} onClick={() => setSelectedRoleId(r.id)} className={`flex w-full items-start justify-between gap-2 px-5 py-3 text-left transition-colors ${selectedRoleId === r.id ? 'bg-brand-50 dark:bg-brand-500/10' : 'hover:bg-ink-50 dark:hover:bg-ink-800/50'}`}>
                  <div>
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{r.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-400"><Users className="h-3 w-3" /> {r.memberCount.toLocaleString()} assigned · {r.scope}</p>
                  </div>
                  {r.isSystem && <Badge className="shrink-0 text-[10px]">System</Badge>}
                </button>
              ))}
            </div>
          </Card>

          <Card className="lg:col-span-2 p-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{selectedRole.name}</h3>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{selectedRole.description}</p>
              </div>
              <Badge tone="brand">{selectedRole.scope} scope</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MiniStat label="Members assigned" value={selectedRole.memberCount.toLocaleString()} />
              <MiniStat label="Permissions granted" value={selectedRole.permissions.length} />
              <MiniStat label="Type" value={selectedRole.isSystem ? 'System' : 'Custom'} />
            </div>
            <h4 className="mt-6 text-xs font-semibold uppercase tracking-wide text-ink-400">Granted permissions</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {permissionCatalog.filter((p) => selectedRole.permissions.includes(p.key)).map((p) => (
                <Badge key={p.key} tone="success">{p.label}</Badge>
              ))}
              {selectedRole.permissions.length === 0 && <p className="text-xs text-ink-400">No permissions granted.</p>}
            </div>
          </Card>
        </div>
      )}

      {tab === 'matrix' && (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-ink-100 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/60">
                <th className="sticky left-0 bg-ink-50/60 px-4 py-2.5 text-left text-xs font-semibold text-ink-500 dark:bg-ink-900/60">Permission</th>
                {roles.slice(0, 8).map((r) => <th key={r.id} className="px-3 py-2.5 text-center text-[11px] font-semibold text-ink-500">{r.name.split(' ')[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {modules.map((mod) => (
                <Fragment key={mod}>
                  <tr className="bg-ink-50/40 dark:bg-ink-900/30">
                    <td colSpan={9} className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">{mod}</td>
                  </tr>
                  {permissionCatalog.filter((p) => p.module === mod).map((p) => (
                    <tr key={p.key} className="border-b border-ink-100 dark:border-ink-800/70">
                      <td className="sticky left-0 bg-white px-4 py-2 text-xs text-ink-600 dark:bg-ink-900 dark:text-ink-300">{p.label}</td>
                      {roles.slice(0, 8).map((r) => (
                        <td key={r.id} className="px-3 py-2 text-center">
                          {r.permissions.includes(p.key) ? <span className="mx-auto block h-2 w-2 rounded-full bg-accent-500" /> : <span className="mx-auto block h-2 w-2 rounded-full bg-ink-200 dark:bg-ink-700" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'delegation' && (
        <Card>
          <CardHeader title="Active delegations" subtitle="Temporary permission grants with start/end timestamps" />
          <div className="divide-y divide-ink-100 p-2 dark:divide-ink-800">
            {[
              { from: 'Grace Hall', to: 'Marcus Boyd', role: 'Event Manager', ends: 'Sep 12, 2026' },
              { from: 'Priya Anand', to: 'Dev Support Team', role: 'Read-only Admin', ends: 'Sep 5, 2026' },
            ].map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-3">
                <Clock className="h-4 w-4 shrink-0 text-ink-400" />
                <p className="flex-1 text-sm text-ink-600 dark:text-ink-300"><strong className="text-ink-800 dark:text-ink-100">{d.from}</strong> delegated <Badge tone="brand" className="mx-1">{d.role}</Badge> to <strong className="text-ink-800 dark:text-ink-100">{d.to}</strong></p>
                <span className="text-xs text-ink-400">Ends {d.ends}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-ink-50 p-3 dark:bg-ink-800/60">
      <p className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{value}</p>
      <p className="text-[11px] text-ink-500 dark:text-ink-400">{label}</p>
    </div>
  )
}

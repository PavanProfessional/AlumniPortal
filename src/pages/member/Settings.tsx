import { useState } from 'react'
import { Laptop, Smartphone, ShieldCheck, LogOut, AlertTriangle } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { SidePanel } from '../../components/ui/SidePanel'
import { useToast } from '../../components/ui/Toast'
import { useAppState } from '../../context/AppStateContext'
import { daysAgo } from '../../utils/dates'
import { formatRelative } from '../../utils/dates'

const initialSessions = [
  { id: 's1', device: 'MacBook Pro · Chrome', icon: Laptop, location: 'San Francisco, CA', current: true, lastActive: daysAgo(0) },
  { id: 's2', device: 'iPhone 15 · Alumnia App', icon: Smartphone, location: 'San Francisco, CA', current: false, lastActive: daysAgo(1) },
  { id: 's3', device: 'Windows PC · Edge', icon: Laptop, location: 'Chicago, IL', current: false, lastActive: daysAgo(14) },
]

export default function MemberSettings() {
  const { currentUser } = useAppState()
  const notify = useToast()
  const [mfa, setMfa] = useState(true)
  const [sessions, setSessions] = useState(initialSessions)
  const [passwordPanelOpen, setPasswordPanelOpen] = useState(false)

  function saveAccount() {
    notify({ message: 'Account information saved', type: 'success', position: 'top-right' })
  }

  function toggleMfa() {
    setMfa((v) => !v)
    notify({ message: mfa ? 'Two-factor authentication disabled' : 'Two-factor authentication enabled', type: mfa ? 'warning' : 'success', position: 'top-right' })
  }

  function updatePassword() {
    setPasswordPanelOpen(false)
    notify({ message: 'Password updated', type: 'success', position: 'top-right' })
  }

  function signOutSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id))
    notify({ message: 'Session signed out', type: 'warning', position: 'bottom-left' })
  }

  function deactivateAccount() {
    notify({ message: 'Account deactivation requested', description: 'Your profile will be hidden from the directory within 24 hours.', type: 'warning', position: 'bottom-right', duration: 5000 })
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Preferences" title="Settings" description="Manage your account, security and notification preferences." />

      <Card>
        <CardHeader title="Account information" />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
          <Field label="First name" defaultValue={currentUser.firstName} />
          <Field label="Last name" defaultValue={currentUser.lastName} />
          <Field label="Email" defaultValue={currentUser.email} />
          <Field label="Phone" defaultValue={currentUser.phone} />
        </div>
        <div className="flex justify-end border-t border-ink-100 px-5 py-3.5 dark:border-ink-800"><Button size="sm" onClick={saveAccount}>Save changes</Button></div>
      </Card>

      <Card>
        <CardHeader title="Security" subtitle="Keep your account protected" />
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Two-factor authentication</p>
              <p className="text-xs text-ink-400">Require a verification code in addition to your password.</p>
            </div>
            <button onClick={toggleMfa} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${mfa ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'}`}>
              <span className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${mfa ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Change password</p>
              <p className="text-xs text-ink-400">Last changed 4 months ago.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setPasswordPanelOpen(true)}>Update</Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Active sessions" subtitle="Devices currently signed in to your account" />
        <div className="divide-y divide-ink-100 dark:divide-ink-800">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400"><s.icon className="h-4 w-4" /></div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium text-ink-800 dark:text-ink-100">{s.device} {s.current && <Badge tone="success" className="text-[10px]">This device</Badge>}</p>
                <p className="text-xs text-ink-400">{s.location} · Active {formatRelative(s.lastActive)}</p>
              </div>
              {!s.current && <button onClick={() => signOutSession(s.id)} className="flex items-center gap-1 text-xs font-medium text-rose-600 hover:underline dark:text-rose-400"><LogOut className="h-3.5 w-3.5" /> Sign out</button>}
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-rose-200 dark:border-rose-900/50">
        <CardHeader title={<span className="flex items-center gap-2 text-rose-600 dark:text-rose-400"><AlertTriangle className="h-4 w-4" /> Danger zone</span>} />
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Deactivate account</p>
            <p className="text-xs text-ink-400">Your profile will be hidden from the directory. Institutional records are retained per policy.</p>
          </div>
          <Button variant="danger" size="sm" onClick={deactivateAccount}>Deactivate</Button>
        </div>
      </Card>
      <p className="flex items-center gap-1.5 text-xs text-ink-400"><ShieldCheck className="h-3.5 w-3.5" /> Your data is protected under KLE Tech's privacy and retention policy.</p>

      <SidePanel
        open={passwordPanelOpen}
        onClose={() => setPasswordPanelOpen(false)}
        title="Change password"
        defaultSize="S"
        footer={<><Button variant="ghost" onClick={() => setPasswordPanelOpen(false)}>Cancel</Button><Button onClick={updatePassword}>Update password</Button></>}
      >
        <div className="space-y-4">
          <Field label="Current password" defaultValue="" />
          <Field label="New password" defaultValue="" />
          <Field label="Confirm new password" defaultValue="" />
        </div>
      </SidePanel>
    </div>
  )
}

function Field({ label, defaultValue }: { label: string; defaultValue?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}</label>
      <input defaultValue={defaultValue} className="mt-1.5 h-9 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
    </div>
  )
}

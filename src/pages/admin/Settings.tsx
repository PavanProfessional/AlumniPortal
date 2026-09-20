import { useRef, useState } from 'react'
import { Building2, Palette, Flag, Layers, ShieldAlert, UploadCloud, Trash2, Plus, X } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { useToast } from '../../components/ui/Toast'
import { useAppState } from '../../context/AppStateContext'
import { departments as defaultDepartments, programs as defaultPrograms } from '../../data/reference'
import type { Tenant } from '../../types'

const tabs = [
  { key: 'general', label: 'General' }, { key: 'branding', label: 'Branding' },
  { key: 'flags', label: 'Feature flags' }, { key: 'academic', label: 'Academic structure' },
  { key: 'retention', label: 'Data retention' },
]

const allFlags = ['mentoring', 'fundraising', 'careers', 'communities', 'sso', 'scim', 'custom-domain', 'advanced-analytics', 'workflow-automation', 'employer-portal']
const brandColors = ['#6c5cf5', '#23ae80', '#e6595f', '#3f9bdc', '#e6a23c', '#c95bd8']
const institutionTypes: Tenant['institutionType'][] = ['School', 'College', 'University', 'Professional Institute', 'Training Academy', 'Non-profit/Association', 'Corporate Alumni Network']
const MAX_LOGO_BYTES = 2 * 1024 * 1024

export default function AdminSettings() {
  const { tenant, updateTenant } = useAppState()
  const notify = useToast()
  const [tab, setTab] = useState('general')

  // ---- General ----
  const [general, setGeneral] = useState({
    legalName: tenant.legalName,
    displayName: tenant.displayName,
    institutionType: tenant.institutionType,
    domain: tenant.domains[0] ?? '',
    timezone: tenant.timezone,
    currency: tenant.currency,
  })

  function saveGeneral() {
    updateTenant({
      legalName: general.legalName,
      displayName: general.displayName,
      institutionType: general.institutionType,
      domains: [general.domain],
      timezone: general.timezone,
      currency: general.currency,
    })
    notify({ message: 'Institution details saved', type: 'success', position: 'top-right' })
  }

  // ---- Branding ----
  const [brandColor, setBrandColor] = useState(tenant.brandColor)
  const [logoPreview, setLogoPreview] = useState<string | undefined>(tenant.logoImageUrl)
  const [terminology, setTerminology] = useState({ member: 'Alumni', batch: 'Class Year', department: 'School', chapter: 'Regional Chapter' })
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleLogoFile(file: File | undefined | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      notify({ message: 'Unsupported file type', description: 'Please upload a PNG, JPG or SVG image.', type: 'error', position: 'top-right' })
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      notify({ message: 'Logo file too large', description: 'Please upload an image under 2MB.', type: 'error', position: 'top-right' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  function saveBranding() {
    updateTenant({ brandColor, logoImageUrl: logoPreview })
    notify({
      message: 'Branding updated',
      description: logoPreview ? 'Your logo now appears across the sidebar.' : 'Showing your initials badge in the sidebar.',
      type: 'success',
      position: 'top-right',
    })
  }

  // ---- Feature flags ----
  const [flags, setFlags] = useState<Set<string>>(new Set(tenant.featureFlags))

  function toggleFlag(f: string) {
    setFlags((prev) => {
      const next = new Set(prev)
      const turningOn = !next.has(f)
      if (turningOn) next.add(f)
      else next.delete(f)
      updateTenant({ featureFlags: Array.from(next) })
      notify({ message: `${f.replace(/-/g, ' ')} ${turningOn ? 'enabled' : 'disabled'}`, type: turningOn ? 'success' : 'warning', position: 'bottom-right' })
      return next
    })
  }

  // ---- Academic structure ----
  const [departmentsList, setDepartmentsList] = useState<string[]>(defaultDepartments)
  const [programsList, setProgramsList] = useState<string[]>(defaultPrograms)
  const [newDept, setNewDept] = useState('')
  const [newProgram, setNewProgram] = useState('')

  function addDepartment() {
    const value = newDept.trim()
    if (!value || departmentsList.includes(value)) return
    setDepartmentsList((prev) => [...prev, value])
    setNewDept('')
    notify({ message: `"${value}" added to departments`, type: 'success', position: 'bottom-left' })
  }

  function removeDepartment(d: string) {
    setDepartmentsList((prev) => prev.filter((x) => x !== d))
    notify({ message: `"${d}" removed`, type: 'warning', position: 'bottom-left' })
  }

  function addProgram() {
    const value = newProgram.trim()
    if (!value || programsList.includes(value)) return
    setProgramsList((prev) => [...prev, value])
    setNewProgram('')
    notify({ message: `"${value}" added to programs`, type: 'success', position: 'bottom-left' })
  }

  function removeProgram(p: string) {
    setProgramsList((prev) => prev.filter((x) => x !== p))
    notify({ message: `"${p}" removed`, type: 'warning', position: 'bottom-left' })
  }

  // ---- Data retention ----
  const [retention, setRetention] = useState({
    inactiveYears: '7', auditYears: '10', purgeDays: '30', residency: 'United States (us-west)',
  })

  function saveRetention() {
    notify({ message: 'Data retention policy saved', description: 'Applies to new records going forward.', type: 'success', position: 'top-right' })
  }

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Configuration" title="Organisation Settings" description="Configuration beats customer-specific forks — everything here applies without engineering involvement." />
      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {tab === 'general' && (
        <Card>
          <CardHeader title="Institution details" icon={<Building2 className="h-4 w-4" />} />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <Field label="Legal name" value={general.legalName} onChange={(v) => setGeneral((g) => ({ ...g, legalName: v }))} />
            <Field label="Display name" value={general.displayName} onChange={(v) => setGeneral((g) => ({ ...g, displayName: v }))} />
            <SelectField label="Institution type" value={general.institutionType} options={institutionTypes} onChange={(v) => setGeneral((g) => ({ ...g, institutionType: v as Tenant['institutionType'] }))} />
            <Field label="Primary domain" value={general.domain} onChange={(v) => setGeneral((g) => ({ ...g, domain: v }))} />
            <SelectField label="Timezone" value={general.timezone} options={Array.from(new Set([tenant.timezone, 'America/New_York', 'Europe/London', 'Asia/Kolkata']))} onChange={(v) => setGeneral((g) => ({ ...g, timezone: v }))} />
            <SelectField label="Currency" value={general.currency} options={Array.from(new Set([tenant.currency, 'USD', 'GBP', 'EUR', 'INR']))} onChange={(v) => setGeneral((g) => ({ ...g, currency: v }))} />
          </div>
          <div className="flex justify-end border-t border-ink-100 px-5 py-3.5 dark:border-ink-800"><Button size="sm" onClick={saveGeneral}>Save changes</Button></div>
        </Card>
      )}

      {tab === 'branding' && (
        <Card>
          <CardHeader title="Branding & terminology" icon={<Palette className="h-4 w-4" />} />
          <div className="space-y-6 p-5">
            <div>
              <p className="text-xs font-medium text-ink-600 dark:text-ink-300">Organisation logo</p>
              <p className="mt-0.5 text-xs text-ink-400">Shown throughout the sidebar in place of your initials badge. PNG, JPG or SVG, up to 2MB.</p>
              <div className="mt-2 flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-ink-200 bg-white dark:border-ink-700 dark:bg-ink-900">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: brandColor }}>
                      {tenant.logoInitials}
                    </div>
                  )}
                </div>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleLogoFile(e.dataTransfer.files?.[0]) }}
                  className={`flex flex-1 items-center justify-between gap-3 rounded-xl2 border-2 border-dashed px-4 py-3 transition-colors ${dragOver ? 'border-brand-400 bg-brand-50 dark:bg-brand-500/10' : 'border-ink-200 dark:border-ink-700'}`}
                >
                  <div className="flex items-center gap-2.5 text-xs text-ink-500 dark:text-ink-400">
                    <UploadCloud className="h-4 w-4 shrink-0" />
                    <span>Drag & drop an image, or</span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Browse files</Button>
                    {logoPreview && <Button variant="ghost" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />} onClick={() => setLogoPreview(undefined)}>Remove</Button>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoFile(e.target.files?.[0])} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-ink-600 dark:text-ink-300">Brand color</p>
              <div className="mt-2 flex items-center gap-2">
                {brandColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setBrandColor(c)}
                    className="h-9 w-9 rounded-full transition-transform hover:scale-105"
                    style={{ backgroundColor: c, boxShadow: c === brandColor ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined }}
                    aria-label={`Use ${c} as brand color`}
                  />
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-ink-600 dark:text-ink-300">Terminology</p>
              <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label='"Member" terminology' value={terminology.member} onChange={(v) => setTerminology((t) => ({ ...t, member: v }))} />
                <Field label='"Batch" terminology' value={terminology.batch} onChange={(v) => setTerminology((t) => ({ ...t, batch: v }))} />
                <Field label='"Department" terminology' value={terminology.department} onChange={(v) => setTerminology((t) => ({ ...t, department: v }))} />
                <Field label='"Chapter" terminology' value={terminology.chapter} onChange={(v) => setTerminology((t) => ({ ...t, chapter: v }))} />
              </div>
            </div>
          </div>
          <div className="flex justify-end border-t border-ink-100 px-5 py-3.5 dark:border-ink-800"><Button size="sm" onClick={saveBranding}>Save changes</Button></div>
        </Card>
      )}

      {tab === 'flags' && (
        <Card>
          <CardHeader title="Feature flags" subtitle="Platform defaults → plan defaults → tenant overrides" icon={<Flag className="h-4 w-4" />} />
          <div className="divide-y divide-ink-100 dark:divide-ink-800">
            {allFlags.map((f) => {
              const on = flags.has(f)
              return (
                <div key={f} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-medium capitalize text-ink-700 dark:text-ink-200">{f.replace(/-/g, ' ')}</p>
                    <p className="text-xs text-ink-400">{on ? 'Enabled for this tenant' : 'Available on Growth+ plans'}</p>
                  </div>
                  <button
                    onClick={() => toggleFlag(f)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${on ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'}`}
                  >
                    <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {tab === 'academic' && (
        <Card>
          <CardHeader title="Academic taxonomy" icon={<Layers className="h-4 w-4" />} />
          <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase text-ink-400">Departments</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {departmentsList.map((d) => (
                  <Badge key={d} className="gap-1.5 pr-1.5">
                    {d}
                    <button onClick={() => removeDepartment(d)} className="rounded-full p-0.5 hover:bg-ink-200 dark:hover:bg-ink-700"><X className="h-2.5 w-2.5" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDepartment()}
                  placeholder="Add a department…"
                  className="h-8 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
                />
                <Button size="sm" variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={addDepartment}>Add</Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-ink-400">Programs</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {programsList.map((p) => (
                  <Badge key={p} className="gap-1.5 pr-1.5">
                    {p}
                    <button onClick={() => removeProgram(p)} className="rounded-full p-0.5 hover:bg-ink-200 dark:hover:bg-ink-700"><X className="h-2.5 w-2.5" /></button>
                  </Badge>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={newProgram}
                  onChange={(e) => setNewProgram(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProgram()}
                  placeholder="Add a program…"
                  className="h-8 flex-1 rounded-lg border border-ink-200 bg-white px-2.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
                />
                <Button size="sm" variant="outline" icon={<Plus className="h-3.5 w-3.5" />} onClick={addProgram}>Add</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {tab === 'retention' && (
        <Card>
          <CardHeader title="Data retention & privacy" icon={<ShieldAlert className="h-4 w-4" />} />
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
            <SelectField label="Inactive account retention" value={retention.inactiveYears} options={['3', '5', '7', '10']} suffix=" years" onChange={(v) => setRetention((r) => ({ ...r, inactiveYears: v }))} />
            <SelectField label="Audit log retention" value={retention.auditYears} options={['5', '7', '10', '15']} suffix=" years" onChange={(v) => setRetention((r) => ({ ...r, auditYears: v }))} />
            <SelectField label="Deleted record purge window" value={retention.purgeDays} options={['15', '30', '60', '90']} suffix=" days" onChange={(v) => setRetention((r) => ({ ...r, purgeDays: v }))} />
            <SelectField label="Data residency" value={retention.residency} options={['United States (us-west)', 'United States (us-east)', 'European Union (eu-central)', 'India (ap-south)', 'Singapore (ap-southeast)']} onChange={(v) => setRetention((r) => ({ ...r, residency: v }))} />
          </div>
          <div className="px-5 pb-2">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              Changing data residency affects new records only. Existing records require a migration request — see Platform Support.
            </div>
          </div>
          <div className="flex justify-end border-t border-ink-100 px-5 py-3.5 dark:border-ink-800"><Button size="sm" onClick={saveRetention}>Save changes</Button></div>
        </Card>
      )}
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-9 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
    </div>
  )
}

function SelectField({ label, value, options, onChange, suffix }: { label: string; value: string; options: string[]; onChange: (v: string) => void; suffix?: string }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-9 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100">
        {options.map((o) => <option key={o} value={o}>{o}{suffix ?? ''}</option>)}
      </select>
    </div>
  )
}

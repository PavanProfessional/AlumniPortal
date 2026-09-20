import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  GraduationCap, Check, Building2, Palette, Layers, UploadCloud, KeyRound,
  ClipboardCheck, ArrowRight, ArrowLeft, Users, Sparkles, CheckCircle2, FileSpreadsheet, Loader2, X,
} from 'lucide-react'
import { Button, Card, ProgressBar } from '../../components/ui/Primitives'
import { departments, programs } from '../../data/reference'
import { useAppState } from '../../context/AppStateContext'
import { parseUploadedFile, analyzeRows, type ParsedFile, type FileAnalysis } from '../../utils/fileImport'
import { formatNumber } from '../../utils/format'
import type { Tenant } from '../../types'

const steps = [
  { key: 'org', label: 'Organisation', icon: Building2 },
  { key: 'brand', label: 'Branding & domain', icon: Palette },
  { key: 'taxonomy', label: 'Academic taxonomy', icon: Layers },
  { key: 'import', label: 'Import alumni', icon: UploadCloud },
  { key: 'auth', label: 'Authentication', icon: KeyRound },
  { key: 'launch', label: 'Launch checklist', icon: ClipboardCheck },
]

const checklist = [
  'Legal/customer record', 'Plan selected', 'Tenant created', 'Admin owner invited',
  'Branding configured', 'Domain verified', 'Roles configured', 'Academic taxonomy set',
  'Member import completed', 'Duplicate resolution reviewed', 'Authentication configured',
  'Communication configuration set', 'Privacy/consent configuration set',
]

const brandColorOptions = ['#c1272d', '#6c5cf5', '#23ae80', '#3f9bdc', '#e6a23c', '#c95bd8']

const activationMessages = [
  'Creating your organisation…',
  'Applying your branding…',
  'Setting up the alumni directory…',
  'Provisioning member workspaces…',
  'Almost ready…',
]

export default function Onboarding() {
  const { tenant, updateTenant } = useAppState()
  const [step, setStep] = useState(0)
  const [phase, setPhase] = useState<'wizard' | 'activating'>('wizard')
  const [checked, setChecked] = useState<Set<string>>(new Set(checklist.slice(0, 9)))
  const navigate = useNavigate()

  const [org, setOrg] = useState({
    legalName: tenant.legalName,
    displayName: tenant.displayName,
    institutionType: tenant.institutionType,
    timezone: tenant.timezone,
    locale: tenant.locale,
    currency: tenant.currency,
  })
  const [branding, setBranding] = useState({
    domain: tenant.domains[0] ?? '',
    logoInitials: tenant.logoInitials,
    brandColor: tenant.brandColor,
  })

  const [importFile, setImportFile] = useState<File | null>(null)
  const [importParsed, setImportParsed] = useState<ParsedFile | null>(null)
  const [importAnalysis, setImportAnalysis] = useState<FileAnalysis | null>(null)
  const [importLoading, setImportLoading] = useState(false)
  const [importDragOver, setImportDragOver] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  function handleImportFile(file: File | undefined | null) {
    if (!file) return
    setImportFile(file)
    setImportParsed(null)
    setImportAnalysis(null)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const parsed = parseUploadedFile(file.name, text)
      setImportLoading(true)
      window.setTimeout(() => {
        setImportParsed(parsed)
        setImportAnalysis(analyzeRows(parsed.columns, parsed.rows))
        setImportLoading(false)
      }, 5000)
    }
    reader.readAsText(file)
  }

  function resetImport() {
    setImportFile(null)
    setImportParsed(null)
    setImportAnalysis(null)
  }

  const isLast = step === steps.length - 1
  const progressPct = ((step + 1) / steps.length) * 100

  function toggle(item: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(item) ? next.delete(item) : next.add(item)
      return next
    })
  }

  function activateTenant() {
    updateTenant({
      legalName: org.legalName,
      displayName: org.displayName,
      institutionType: org.institutionType as Tenant['institutionType'],
      timezone: org.timezone,
      locale: org.locale,
      currency: org.currency,
      domains: [branding.domain],
      logoInitials: branding.logoInitials,
      brandColor: branding.brandColor,
      status: 'active',
    })
    setPhase('activating')
  }

  if (phase === 'activating') {
    return <ActivationScreen tenantName={org.displayName} onDone={() => navigate('/login')} />
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-950">
      <header className="border-b border-ink-200 bg-white px-6 py-4 dark:border-ink-800 dark:bg-ink-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white"><GraduationCap className="h-4.5 w-4.5" /></div>
            <span className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">Alumnia</span>
          </Link>
          <p className="text-xs font-medium text-ink-400">Tenant onboarding · Step {step + 1} of {steps.length}</p>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-6 py-4">
        <ProgressBar value={progressPct} />
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 pb-16 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1">
          {steps.map((s, idx) => (
            <button
              key={s.key}
              onClick={() => setStep(idx)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                idx === step ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800'
              }`}
            >
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${idx < step ? 'bg-accent-500 text-white' : idx === step ? 'bg-brand-600 text-white' : 'bg-ink-200 text-ink-500 dark:bg-ink-700'}`}>
                {idx < step ? <Check className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              {s.label}
            </button>
          ))}
        </nav>

        <Card className="p-7">
          {step === 0 && (
            <StepShell title="Organisation details" desc="Create the tenant record for your institution.">
              <FormRow label="Legal name" value={org.legalName} onChange={(v) => setOrg((o) => ({ ...o, legalName: v }))} />
              <FormRow label="Display name" value={org.displayName} onChange={(v) => setOrg((o) => ({ ...o, displayName: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <SelectRow label="Institution type" options={['University', 'College', 'School', 'Professional Institute', 'Training Academy', 'Non-profit/Association', 'Corporate Alumni Network']} value={org.institutionType} onChange={(v) => setOrg((o) => ({ ...o, institutionType: v as Tenant['institutionType'] }))} />
                <SelectRow label="Timezone" options={['Asia/Kolkata', 'America/Los_Angeles', 'America/New_York', 'Europe/London', 'Asia/Singapore']} value={org.timezone} onChange={(v) => setOrg((o) => ({ ...o, timezone: v }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectRow label="Locale" options={['en-IN', 'en-US', 'en-GB', 'en-SG']} value={org.locale} onChange={(v) => setOrg((o) => ({ ...o, locale: v }))} />
                <SelectRow label="Currency" options={['INR', 'USD', 'GBP', 'SGD', 'EUR']} value={org.currency} onChange={(v) => setOrg((o) => ({ ...o, currency: v }))} />
              </div>
            </StepShell>
          )}
          {step === 1 && (
            <StepShell title="Branding & domain" desc="Configure how members will recognize your institution — the brand color you pick here is applied across the entire product once you activate.">
              <FormRow label="Primary domain" value={branding.domain} onChange={(v) => setBranding((b) => ({ ...b, domain: v }))} />
              <div className="grid grid-cols-2 gap-4">
                <FormRow label="Logo initials" value={branding.logoInitials} onChange={(v) => setBranding((b) => ({ ...b, logoInitials: v.slice(0, 3).toUpperCase() }))} />
                <div>
                  <label className="text-xs font-medium text-ink-600 dark:text-ink-300">Brand color</label>
                  <div className="mt-1.5 flex items-center gap-2">
                    {brandColorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBranding((b) => ({ ...b, brandColor: c }))}
                        className="h-8 w-8 rounded-full ring-offset-2 ring-offset-white transition-all dark:ring-offset-ink-900"
                        style={{ backgroundColor: c, boxShadow: branding.brandColor === c ? `0 0 0 2px ${c}` : undefined }}
                        aria-label={`Choose ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <FormRow label="Initial owner email" defaultValue="pavan.kumar@alumnimail.com" />
            </StepShell>
          )}
          {step === 2 && (
            <StepShell title="Academic taxonomy" desc="Confirm the hierarchy and reference data used across the platform.">
              <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-4 text-xs text-ink-500 dark:border-ink-800 dark:bg-ink-900/40">
                Organisation → Institution → Campus → School/Faculty → Department → Program/Course → Batch/Class. Simpler hierarchies are supported.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-ink-600 dark:text-ink-300">Departments ({departments.length})</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{departments.map((d) => <span key={d} className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] text-ink-600 dark:bg-ink-800 dark:text-ink-300">{d}</span>)}</div>
                </div>
                <div>
                  <p className="text-xs font-medium text-ink-600 dark:text-ink-300">Programs ({programs.length})</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">{programs.slice(0, 8).map((d) => <span key={d} className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] text-ink-600 dark:bg-ink-800 dark:text-ink-300">{d}</span>)}<span className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] text-ink-500 dark:bg-ink-800">+{programs.length - 8} more</span></div>
                </div>
              </div>
            </StepShell>
          )}
          {step === 3 && (
            <StepShell title="Import alumni" desc="Upload existing records — we'll scan, validate and summarize them right here.">
              {!importFile ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setImportDragOver(true) }}
                  onDragLeave={() => setImportDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setImportDragOver(false); handleImportFile(e.dataTransfer.files?.[0]) }}
                  className={`flex flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed px-6 py-12 text-center transition-colors ${importDragOver ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10' : 'border-ink-200 bg-ink-50/50 dark:border-ink-700 dark:bg-ink-900/40'}`}
                >
                  <UploadCloud className="h-8 w-8 text-ink-400" />
                  <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Drag and drop a CSV or JSON file</p>
                  <p className="text-xs text-ink-400">or</p>
                  <Button variant="outline" size="sm" onClick={() => importInputRef.current?.click()}>Browse files</Button>
                  <input ref={importInputRef} type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(e) => handleImportFile(e.target.files?.[0])} />
                </div>
              ) : importAnalysis ? (
                <div className="space-y-3 rounded-xl2 border border-ink-200 bg-ink-50/50 p-5 dark:border-ink-700 dark:bg-ink-900/40">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-600 dark:bg-accent-500/15 dark:text-accent-400"><FileSpreadsheet className="h-4.5 w-4.5" /></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{importFile.name}</p>
                        <p className="text-xs text-ink-400">{formatNumber(importAnalysis.totalRows)} rows · {importParsed?.columns.length ?? 0} columns detected</p>
                      </div>
                    </div>
                    <button onClick={resetImport} className="shrink-0 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200" title="Remove file"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-white p-3 dark:bg-ink-900">
                      <p className="font-display text-lg font-bold text-accent-600 dark:text-accent-400">{formatNumber(importAnalysis.validRows)}</p>
                      <p className="text-[11px] text-ink-400">Ready to import</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 dark:bg-ink-900">
                      <p className="font-display text-lg font-bold text-rose-600 dark:text-rose-400">{formatNumber(importAnalysis.invalidRows)}</p>
                      <p className="text-[11px] text-ink-400">Validation errors</p>
                    </div>
                    <div className="rounded-lg bg-white p-3 dark:bg-ink-900">
                      <p className="font-display text-lg font-bold text-amber-600 dark:text-amber-400">{formatNumber(importAnalysis.duplicateRows)}</p>
                      <p className="text-[11px] text-ink-400">Possible duplicates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-accent-700 dark:text-accent-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Analyzed and ready — fine-tune mapping and validation any time from the admin Import console.
                  </div>
                </div>
              ) : null}
              <p className="text-xs text-ink-400">Pipeline: upload → inspect → map → validate → preview → approve → process → reconcile. You can also skip and import later from the admin console.</p>
            </StepShell>
          )}
          {step === 4 && (
            <StepShell title="Authentication & communications" desc="Choose how members sign in and how the platform sends email.">
              <div className="grid grid-cols-2 gap-3">
                {['Email/Password', 'Magic Link', 'OTP', 'SAML SSO', 'OIDC', 'Social Login'].map((m) => (
                  <label key={m} className="flex items-center gap-2.5 rounded-lg border border-ink-200 px-3 py-2.5 text-sm dark:border-ink-700">
                    <input type="checkbox" defaultChecked={['Email/Password', 'Magic Link', 'SAML SSO'].includes(m)} className="h-4 w-4 rounded border-ink-300 text-brand-600" /> {m}
                  </label>
                ))}
              </div>
              <FormRow label="Sender email" defaultValue="alumni@kletech.ac.in" />
            </StepShell>
          )}
          {step === 5 && (
            <StepShell title="Launch checklist" desc="Review before activating the tenant.">
              <div className="space-y-2">
                {checklist.map((c) => (
                  <label key={c} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-ink-700 dark:text-ink-200">
                    <input type="checkbox" checked={checked.has(c)} onChange={() => toggle(c)} className="h-4 w-4 rounded border-ink-300 text-brand-600" />
                    {c}
                  </label>
                ))}
              </div>
            </StepShell>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-5 dark:border-ink-800">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
            {isLast ? (
              <Button onClick={activateTenant} icon={<Check className="h-4 w-4" />}>Activate tenant</Button>
            ) : (
              <Button onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))} icon={<ArrowRight className="h-4 w-4" />}>Continue</Button>
            )}
          </div>
        </Card>
      </div>

      {importLoading && <ImportLoadingPopup fileName={importFile?.name ?? 'your file'} />}
    </div>
  )
}

function ImportLoadingPopup({ fileName }: { fileName: string }) {
  const [filled, setFilled] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setFilled(true), 50)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 backdrop-blur-sm">
      <Card className="w-full max-w-xs p-6 text-center shadow-popover">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink-900 dark:text-ink-50">Analyzing your file</p>
        <p className="mt-1 truncate text-xs text-ink-400">{fileName}</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
          <div className={`h-full rounded-full bg-brand-600 transition-all duration-[5000ms] ease-linear ${filled ? 'w-full' : 'w-0'}`} />
        </div>
      </Card>
    </div>
  )
}

function ActivationScreen({ tenantName, onDone }: { tenantName: string; onDone: () => void }) {
  const [msgIndex, setMsgIndex] = useState(0)
  const [filled, setFilled] = useState(false)

  useEffect(() => {
    const fillTimer = window.setTimeout(() => setFilled(true), 50)
    const msgTimer = window.setInterval(() => setMsgIndex((i) => Math.min(i + 1, activationMessages.length - 1)), 1000)
    const doneTimer = window.setTimeout(onDone, 5000)
    return () => { window.clearTimeout(fillTimer); window.clearInterval(msgTimer); window.clearTimeout(doneTimer) }
  }, [onDone])

  const icons = [Building2, Users, Palette, Sparkles]

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 px-4 text-center text-white">
      <div className="relative flex h-24 w-24 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/20" />
        <span className="absolute inset-2 rounded-full bg-white/10" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-2xl">
          <GraduationCap className="h-8 w-8" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {icons.map((Icon, i) => (
          <div
            key={i}
            className="flex h-10 w-10 animate-bounce items-center justify-center rounded-full bg-white/15"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <Icon className="h-5 w-5" />
          </div>
        ))}
      </div>

      <div>
        <h1 className="font-display text-2xl font-bold">Creating {tenantName || 'your organisation'}</h1>
        <p className="mt-2 text-sm text-white/80">{activationMessages[msgIndex]}</p>
      </div>

      <div className="h-1.5 w-72 overflow-hidden rounded-full bg-white/20">
        <div className={`h-full rounded-full bg-white transition-all duration-[5000ms] ease-linear ${filled ? 'w-full' : 'w-0'}`} />
      </div>
    </div>
  )
}

function StepShell({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-bold text-ink-900 dark:text-ink-50">{title}</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{desc}</p>
      </div>
      {children}
    </div>
  )
}

function FormRow({ label, value, defaultValue, onChange }: { label: string; value?: string; defaultValue?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}</label>
      <input
        value={value}
        defaultValue={value === undefined ? defaultValue : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
      />
    </div>
  )
}

function SelectRow({ label, options, value, defaultValue, onChange }: { label: string; options: string[]; value?: string; defaultValue?: string; onChange?: (v: string) => void }) {
  return (
    <div>
      <label className="text-xs font-medium text-ink-600 dark:text-ink-300">{label}</label>
      <select
        value={value}
        defaultValue={value === undefined ? (defaultValue ?? options[0]) : undefined}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="mt-1.5 h-10 w-full rounded-lg border border-ink-200 bg-white px-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

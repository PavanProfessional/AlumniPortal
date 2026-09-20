import { useRef, useState } from 'react'
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, Copy, Loader2 } from 'lucide-react'
import { SectionHeading, Card, CardHeader, Button, ProgressBar, SearchInput } from '../../components/ui/Primitives'
import { StatusBadge } from '../../components/ui/Badge'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { SidePanel } from '../../components/ui/SidePanel'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { useToast } from '../../components/ui/Toast'
import { useAppState } from '../../context/AppStateContext'
import { importBatches as sampleBatches, dataQuality } from '../../data/support'
import type { ImportBatch } from '../../types'
import { formatDate } from '../../utils/dates'
import { formatNumber } from '../../utils/format'
import { guessDestination, parseUploadedFile, analyzeRows, type ParsedFile, type FileAnalysis } from '../../utils/fileImport'

const pipeline = ['Upload', 'Inspect', 'Map fields', 'Validate', 'Preview', 'Approve', 'Process', 'Reconcile']
type Analysis = FileAnalysis

export default function AdminImport() {
  const notify = useToast()
  const { currentUser } = useAppState()
  const [open, setOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(0)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<ViewMode>('table')
  const [committedBatches, setCommittedBatches] = useState<ImportBatch[]>([])

  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [processing, setProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allBatches = [...committedBatches, ...sampleBatches]
  const filteredBatches = allBatches.filter((b) => `${b.fileName} ${b.uploadedBy} ${b.source}`.toLowerCase().includes(query.trim().toLowerCase()))

  function openWizard() {
    setOpen(true)
    setWizardStep(0)
    setFile(null)
    setParsed(null)
    setAnalysis(null)
    setProcessing(false)
  }

  function handleFile(f: File | undefined | null) {
    if (!f) return
    setFile(f)
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? '')
      const p = parseUploadedFile(f.name, text)
      setParsed(p)
      setAnalysis(analyzeRows(p.columns, p.rows))
    }
    reader.readAsText(f)
  }

  function goNext() {
    const next = Math.min(pipeline.length - 1, wizardStep + 1)
    setWizardStep(next)
    if (next === 6) {
      setProcessing(true)
      window.setTimeout(() => setProcessing(false), 1400)
    }
  }

  function commitImport() {
    if (!file || !analysis) return
    const source: ImportBatch['source'] = file.name.toLowerCase().endsWith('.json')
      ? 'API'
      : file.name.toLowerCase().endsWith('.csv')
        ? 'CSV'
        : file.name.toLowerCase().endsWith('.xlsx')
          ? 'XLSX'
          : 'Legacy Export'
    const batch: ImportBatch = {
      id: `imp_${Date.now()}`,
      fileName: file.name,
      source,
      status: 'completed',
      totalRows: analysis.totalRows,
      validRows: analysis.validRows,
      invalidRows: analysis.invalidRows,
      duplicateRows: analysis.duplicateRows,
      uploadedAt: new Date().toISOString(),
      uploadedBy: `${currentUser.firstName} ${currentUser.lastName}`,
      mappingTemplate: 'Auto-detected mapping',
    }
    setCommittedBatches((prev) => [batch, ...prev])
    setOpen(false)
    notify({
      message: 'Import committed',
      description: `${formatNumber(analysis.validRows)} records created/updated, ${formatNumber(analysis.invalidRows)} skipped, ${formatNumber(analysis.duplicateRows)} flagged as duplicates.`,
      type: 'success',
      position: 'bottom-right',
    })
  }

  const columns: Column<ImportBatch>[] = [
    { header: 'File', accessor: (b) => (
      <div className="flex items-center gap-2.5">
        <FileSpreadsheet className="h-4 w-4 shrink-0 text-ink-400" />
        <div className="min-w-0"><p className="truncate font-medium text-ink-800 dark:text-ink-100">{b.fileName}</p><p className="text-xs text-ink-400">{b.mappingTemplate}</p></div>
      </div>
    ) },
    { header: 'Source', accessor: (b) => b.source },
    { header: 'Rows', accessor: (b) => formatNumber(b.totalRows) },
    { header: 'Valid', accessor: (b) => <span className="text-accent-600 dark:text-accent-400">{formatNumber(b.validRows)}</span> },
    { header: 'Invalid', accessor: (b) => <span className="text-rose-600 dark:text-rose-400">{formatNumber(b.invalidRows)}</span> },
    { header: 'Duplicates', accessor: (b) => formatNumber(b.duplicateRows) },
    { header: 'Status', accessor: (b) => <StatusBadge status={b.status} /> },
    { header: 'Uploaded', accessor: (b) => <span className="text-xs text-ink-400">{formatDate(b.uploadedAt)} · {b.uploadedBy}</span> },
  ]

  const qualityMetrics = [
    { label: 'Completeness', value: dataQuality.completeness }, { label: 'Validity', value: dataQuality.validity },
    { label: 'Uniqueness', value: dataQuality.uniqueness }, { label: 'Freshness', value: dataQuality.freshness },
    { label: 'Reachability', value: dataQuality.reachability },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Data operations" title="Imports & Data Quality" description="Migrate alumni records safely with mapping templates, dry-run validation and reconciliation." action={<Button icon={<UploadCloud className="h-3.5 w-3.5" />} onClick={openWizard}>New import</Button>} />

      <Card className="p-5">
        <CardHeader title="Data quality snapshot" className="border-0 px-0 pt-0" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {qualityMetrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between text-xs"><span className="text-ink-500">{m.label}</span><span className="font-semibold text-ink-800 dark:text-ink-100">{m.value}%</span></div>
              <ProgressBar value={m.value} className="mt-1.5" tone={m.value > 80 ? 'success' : m.value > 60 ? 'brand' : 'warning'} />
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4 border-t border-ink-100 pt-4 dark:border-ink-800">
          <div className="flex items-center gap-2 text-xs text-ink-500"><Copy className="h-4 w-4 text-amber-500" /> {dataQuality.duplicateRecords} duplicate records</div>
          <div className="flex items-center gap-2 text-xs text-ink-500"><AlertTriangle className="h-4 w-4 text-rose-500" /> {dataQuality.missingEmail} missing email</div>
          <div className="flex items-center gap-2 text-xs text-ink-500"><AlertTriangle className="h-4 w-4 text-ink-400" /> {dataQuality.staleRecords} stale records</div>
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Import batches"
          subtitle="Upload → inspect → map → validate → preview → approve → process → reconcile"
        />
        <div className="flex flex-col gap-3 border-b border-ink-100 px-5 py-3.5 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput placeholder="Search by file name or uploader…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
          <ViewToggle view={view} onChange={setView} />
        </div>
        {view === 'table' ? (
          <DataTable columns={columns} rows={filteredBatches} keyFn={(b) => b.id} />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredBatches.map((b) => (
              <Card key={b.id} className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <FileSpreadsheet className="h-4 w-4 shrink-0 text-ink-400" />
                    <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{b.fileName}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-xs text-ink-400">{b.mappingTemplate} · {b.source}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div><p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{formatNumber(b.totalRows)}</p><p className="text-[10px] text-ink-400">Rows</p></div>
                  <div><p className="font-display text-base font-bold text-accent-600 dark:text-accent-400">{formatNumber(b.validRows)}</p><p className="text-[10px] text-ink-400">Valid</p></div>
                  <div><p className="font-display text-base font-bold text-rose-600 dark:text-rose-400">{formatNumber(b.invalidRows)}</p><p className="text-[10px] text-ink-400">Invalid</p></div>
                </div>
                <p className="mt-3 border-t border-ink-100 pt-3 text-xs text-ink-400 dark:border-ink-800">{formatDate(b.uploadedAt)} · {b.uploadedBy}</p>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <SidePanel
        open={open}
        onClose={() => setOpen(false)}
        title="New import"
        description="Upload → inspect → map → validate → preview → approve → process → reconcile."
        defaultSize="XL"
        footer={
          <>
            <Button variant="ghost" onClick={() => setWizardStep((s) => Math.max(0, s - 1))} disabled={wizardStep === 0}>Back</Button>
            {wizardStep < pipeline.length - 1 ? (
              <Button onClick={goNext} disabled={wizardStep === 0 && !parsed}>Continue</Button>
            ) : (
              <Button onClick={commitImport} icon={<CheckCircle2 className="h-4 w-4" />} disabled={!analysis}>Commit import</Button>
            )}
          </>
        }
      >
        <div className="mb-6 flex items-center gap-1 overflow-x-auto">
          {pipeline.map((p, i) => (
            <div key={p} className="flex items-center gap-1">
              <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${i === wizardStep ? 'bg-brand-600 text-white' : i < wizardStep ? 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300' : 'bg-ink-100 text-ink-500 dark:bg-ink-800'}`}>{p}</span>
              {i < pipeline.length - 1 && <span className="h-px w-3 bg-ink-200 dark:bg-ink-700" />}
            </div>
          ))}
        </div>

        {wizardStep === 0 && (
          <div className="space-y-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl2 border-2 border-dashed px-6 py-12 text-center transition-colors ${dragOver ? 'border-brand-400 bg-brand-50/60 dark:bg-brand-500/10' : 'border-ink-200 bg-ink-50/50 dark:border-ink-700 dark:bg-ink-900/40'}`}
            >
              <UploadCloud className="h-8 w-8 text-ink-400" />
              <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Drag and drop a CSV or JSON file</p>
              <p className="text-xs text-ink-400">or</p>
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Browse files</Button>
              <input ref={fileInputRef} type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
            </div>
            {file && parsed && (
              <div className="flex items-center gap-2 rounded-lg border border-accent-200 bg-accent-50 px-4 py-2.5 text-sm text-accent-700 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-300">
                <CheckCircle2 className="h-4 w-4 shrink-0" /> {file.name} — {formatNumber(parsed.rows.length)} rows · {parsed.columns.length} columns detected
              </div>
            )}
          </div>
        )}

        {wizardStep === 1 && (
          parsed && file ? (
            <SamplePreview title={`${formatNumber(parsed.rows.length)} rows detected · ${parsed.columns.length} columns`} desc={`${file.name} — headers detected on row 1. Columns: ${parsed.columns.slice(0, 8).join(', ')}${parsed.columns.length > 8 ? '…' : ''}`} />
          ) : (
            <SamplePreview title="No file uploaded yet" desc="Go back to the Upload step and choose a CSV or JSON file to analyse." />
          )
        )}

        {wizardStep === 2 && (
          parsed ? <MappingTable columns={parsed.columns} /> : <SamplePreview title="No file uploaded yet" desc="Upload a file first to see its detected column mapping." />
        )}

        {wizardStep === 3 && (
          analysis ? <ValidationSummary analysis={analysis} /> : <SamplePreview title="No file uploaded yet" desc="Upload a file first to run validation." />
        )}

        {wizardStep === 4 && (
          analysis
            ? <SamplePreview title={`Preview: ${formatNumber(analysis.validRows)} rows ready to import`} desc={`${formatNumber(analysis.invalidRows)} rows have validation errors, ${formatNumber(analysis.duplicateRows)} are likely duplicates of existing records.`} />
            : <SamplePreview title="No file uploaded yet" desc="Upload a file first to preview the import." />
        )}

        {wizardStep === 5 && (
          <SamplePreview title="Awaiting approval" desc="An Alumni Relations Officer or Admin must approve this batch before processing." />
        )}

        {wizardStep === 6 && (
          processing ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-ink-100 bg-ink-50/60 p-8 text-center dark:border-ink-800 dark:bg-ink-900/40">
              <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
              <p className="text-sm font-medium text-ink-700 dark:text-ink-200">Writing records…</p>
              <p className="text-xs text-ink-400">Applying tenant-scoped ownership and idempotent batch tracking.</p>
            </div>
          ) : (
            <SamplePreview title="Processing complete" desc="Records were written with tenant-scoped ownership and idempotent batch tracking." />
          )
        )}

        {wizardStep === 7 && (
          analysis
            ? <SamplePreview title="Reconciliation complete" desc={`${formatNumber(analysis.validRows)} created/updated, ${formatNumber(analysis.invalidRows)} skipped with exception report, ${formatNumber(analysis.duplicateRows)} flagged for duplicate review.`} />
            : <SamplePreview title="Reconciliation complete" desc="No file was analysed for this batch." />
        )}
      </SidePanel>
    </div>
  )
}

function SamplePreview({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-ink-50/60 p-5 dark:border-ink-800 dark:bg-ink-900/40">
      <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{title}</p>
      <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{desc}</p>
    </div>
  )
}

function MappingTable({ columns }: { columns: string[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-100 dark:border-ink-800">
      <table className="w-full text-sm">
        <thead className="bg-ink-50 dark:bg-ink-900/60"><tr><th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">Source column</th><th className="px-3 py-2 text-left text-xs font-semibold text-ink-500">Destination field</th></tr></thead>
        <tbody>
          {columns.map((c) => {
            const dest = guessDestination(c)
            return (
              <tr key={c} className="border-t border-ink-100 dark:border-ink-800">
                <td className="px-3 py-2 font-mono text-xs text-ink-500">{c}</td>
                <td className="px-3 py-2 text-xs font-medium text-ink-700 dark:text-ink-200">{dest === 'ignored' ? <span className="text-ink-400">Not mapped</span> : dest}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function ValidationSummary({ analysis }: { analysis: Analysis }) {
  const items = [
    { label: 'Name field detected', ok: analysis.requiredPresent },
    { label: analysis.emailColumn ? `Email column detected (${analysis.emailColumn})` : 'No email column detected', ok: Boolean(analysis.emailColumn) },
    { label: `${formatNumber(analysis.missingEmail)} rows missing email`, ok: analysis.missingEmail === 0 },
    { label: `${formatNumber(analysis.invalidEmail)} rows with invalid email format`, ok: analysis.invalidEmail === 0 },
    { label: `${formatNumber(analysis.duplicateRows)} possible duplicates found`, ok: analysis.duplicateRows === 0 },
  ]
  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i.label} className="flex items-center gap-2 text-sm">
          {i.ok ? <CheckCircle2 className="h-4 w-4 text-accent-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
          <span className="text-ink-600 dark:text-ink-300">{i.label}</span>
        </div>
      ))}
    </div>
  )
}

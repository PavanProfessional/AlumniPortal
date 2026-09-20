import { useMemo, useState } from 'react'
import { Mail, Phone, MapPin, GraduationCap, Users } from 'lucide-react'
import { SectionHeading, Card, Avatar, SearchInput, Chip, EmptyState } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { Pagination } from '../../components/ui/Pagination'
import { usePagination } from '../../hooks/usePagination'
import { ViewToggle, type ViewMode } from '../../components/ui/ViewToggle'
import { DataTable, type Column } from '../../components/ui/DataTable'
import { SidePanel } from '../../components/ui/SidePanel'
import { safeAlumniRecords, type SafeAlumniRecord } from '../../data/alumniSource'
import { AlumniDetail, IconBadge, colorFor, fieldTone } from '../../components/alumni/AlumniQuickView'

export default function MemberDirectory() {
  const [query, setQuery] = useState('')
  const [batchYear, setBatchYear] = useState<number | null>(null)
  const [view, setView] = useState<ViewMode>('card')
  const [selected, setSelected] = useState<SafeAlumniRecord | null>(null)

  const batchYears = useMemo(() => {
    const years = new Set<number>()
    safeAlumniRecords.forEach((r) => { if (r.graduationYear) years.add(r.graduationYear) })
    return Array.from(years).sort((a, b) => b - a)
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return safeAlumniRecords.filter((r) => {
      if (batchYear && r.graduationYear !== batchYear) return false
      if (!q) return true
      const hay = `${r.name} ${r.occupation} ${r.occupationType} ${r.workingPlace} ${r.nativePlace} ${r.education}`.toLowerCase()
      return hay.includes(q)
    })
  }, [query, batchYear])

  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex } = usePagination(filtered, 18)

  const columns: Column<SafeAlumniRecord>[] = [
    { header: 'Alumnus', accessor: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={r.name} color={colorFor(r.index)} size="sm" />
        <div className="min-w-0"><p className="truncate font-medium text-ink-800 dark:text-ink-100">{r.name}</p><p className="truncate text-xs text-ink-400">{r.occupation || '—'}</p></div>
      </div>
    ) },
    { header: 'Contact', accessor: (r) => (
      <div className="text-xs text-ink-500 dark:text-ink-400">
        {r.phone && <p>{r.phone}</p>}
        {r.email && <p className="truncate">{r.email}</p>}
      </div>
    ) },
    { header: 'Batch', accessor: (r) => r.graduationYear ?? '—' },
    { header: 'Location', accessor: (r) => <span className="text-xs">{r.workingPlace || r.nativePlace || '—'}</span> },
    { header: 'Type', accessor: (r) => r.occupationType ? <Badge tone="brand">{r.occupationType}</Badge> : <span className="text-xs text-ink-400">—</span> },
  ]

  return (
    <div className="space-y-6">
      <SectionHeading eyebrow="Alumni network" title="Directory" description={`${filtered.length.toLocaleString()} alumni match your filters`} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search by name, occupation, place…" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} className="sm:max-w-sm" />
          <div className="flex flex-wrap items-center gap-2">
            {batchYears.slice(0, 6).map((y) => (
              <Chip key={y} active={batchYear === y} onClick={() => { setBatchYear((v) => (v === y ? null : y)); setPage(1) }}>Batch {y}</Chip>
            ))}
          </div>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-5 w-5" />} title="No alumni match these filters" description="Try clearing your search or selecting a different batch." />
      ) : view === 'table' ? (
        <DataTable columns={columns} rows={filtered} keyFn={(r) => r.id} onRowClick={setSelected} defaultPageSize={18} pageSizeOptions={[18, 36, 54, 90]} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((r) => (
              <button key={r.id} onClick={() => setSelected(r)} className="text-left">
                <Card className="h-full p-5 transition-shadow hover:shadow-card">
                  <div className="flex items-start justify-between gap-2">
                    <Avatar name={r.name} color={colorFor(r.index)} size="lg" />
                    {r.occupationType && <Badge tone="brand" className="text-[10px]">{r.occupationType}</Badge>}
                  </div>
                  <p className="mt-3 truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{r.name}</p>
                  <p className="truncate text-xs text-ink-500 dark:text-ink-400">{r.occupation || 'KLE Tech Alumnus'}</p>
                  <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5 border-t border-ink-100 pt-3.5 text-xs text-ink-600 dark:border-ink-800 dark:text-ink-300">
                    {r.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <IconBadge icon={Phone} tone={fieldTone.phone} size="sm" />
                        <span className="truncate">{r.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 truncate">
                      <IconBadge icon={GraduationCap} tone={fieldTone.batch} size="sm" />
                      <span className="truncate">Batch {r.graduationYear ?? '—'}</span>
                    </div>
                    {r.email && (
                      <div className="col-span-2 flex items-center gap-2 truncate">
                        <IconBadge icon={Mail} tone={fieldTone.email} size="sm" />
                        <span className="truncate">{r.email}</span>
                      </div>
                    )}
                    <div className="col-span-2 flex items-center gap-2 truncate">
                      <IconBadge icon={MapPin} tone={fieldTone.workingPlace} size="sm" />
                      <span className="truncate">{r.workingPlace || r.nativePlace || '—'}</span>
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
          <Card className="p-0">
            <Pagination
              page={page} totalPages={totalPages} onPageChange={setPage}
              pageSize={pageSize} onPageSizeChange={setPageSize}
              totalItems={totalItems} startIndex={startIndex} endIndex={endIndex}
              pageSizeOptions={[18, 36, 54, 90]}
            />
          </Card>
        </>
      )}

      <SidePanel
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name ?? 'Alumnus'}
        description="Alumni directory profile"
        defaultSize="M"
        allowResize={false}
      >
        {selected && <AlumniDetail record={selected} />}
      </SidePanel>
    </div>
  )
}

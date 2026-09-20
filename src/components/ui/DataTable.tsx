import type { ReactNode } from 'react'
import clsx from 'clsx'
import { Inbox } from 'lucide-react'
import { EmptyState } from './Primitives'
import { Pagination } from './Pagination'
import { usePagination } from '../../hooks/usePagination'

export interface Column<T> {
  header: string
  accessor: (row: T) => ReactNode
  className?: string
  headerClassName?: string
}

export function DataTable<T>({
  columns, rows, keyFn, onRowClick, emptyTitle = 'No records found', emptyDescription = 'Try adjusting your filters or search terms.',
  selectable, selected, onToggleSelect, footer,
  paginate = true, defaultPageSize = 10, pageSizeOptions,
}: {
  columns: Column<T>[]
  rows: T[]
  keyFn: (row: T) => string
  onRowClick?: (row: T) => void
  emptyTitle?: string
  emptyDescription?: string
  selectable?: boolean
  selected?: Set<string>
  onToggleSelect?: (id: string) => void
  footer?: ReactNode
  /** Set false for small, fixed lists (e.g. inside a modal) that shouldn't paginate. */
  paginate?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]
}) {
  const { page, setPage, pageSize, setPageSize, totalItems, totalPages, pageItems, startIndex, endIndex } = usePagination(rows, defaultPageSize)
  const displayRows = paginate ? pageItems : rows

  if (rows.length === 0) {
    return <EmptyState icon={<Inbox className="h-5 w-5" />} title={emptyTitle} description={emptyDescription} />
  }
  return (
    <div className="overflow-hidden rounded-xl2 border border-ink-200/70 bg-white dark:border-ink-800 dark:bg-ink-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink-100 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900/60">
              {selectable && <th className="w-10 px-4 py-2.5" />}
              {columns.map((c) => (
                <th key={c.header} className={clsx('px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 dark:text-ink-400', c.headerClassName)}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => {
              const id = keyFn(row)
              return (
                <tr
                  key={id}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'border-b border-ink-100 last:border-0 dark:border-ink-800/70',
                    onRowClick && 'cursor-pointer hover:bg-ink-50 dark:hover:bg-ink-800/50',
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected?.has(id) ?? false}
                        onChange={() => onToggleSelect?.(id)}
                        className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.header} className={clsx('px-4 py-3 align-middle text-ink-700 dark:text-ink-300', c.className)}>
                      {c.accessor(row)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {paginate && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={setPageSize}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          pageSizeOptions={pageSizeOptions}
        />
      )}
      {footer}
    </div>
  )
}

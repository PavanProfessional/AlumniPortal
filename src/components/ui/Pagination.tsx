import { ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'

function pageWindow(current: number, total: number, size = 5): number[] {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1)
  let start = Math.max(1, current - Math.floor(size / 2))
  const end = Math.min(total, start + size - 1)
  start = Math.max(1, end - size + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function Pagination({
  page, totalPages, onPageChange, pageSize, onPageSizeChange, totalItems, startIndex, endIndex,
  pageSizeOptions = [10, 25, 50, 100],
}: {
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  pageSize: number
  onPageSizeChange: (n: number) => void
  totalItems: number
  startIndex: number
  endIndex: number
  pageSizeOptions?: number[]
}) {
  if (totalItems === 0) return null
  const window = pageWindow(page, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-ink-100 px-4 py-3 dark:border-ink-800 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
        <span>Rows per page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="h-7 rounded-md border border-ink-200 bg-white px-1.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
        >
          {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <span className="hidden sm:inline">
          Showing {startIndex + 1}–{endIndex} of {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-40 dark:text-ink-400 dark:hover:bg-ink-800"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>

        {window[0] > 1 && (
          <>
            <PageButton n={1} active={false} onClick={() => onPageChange(1)} />
            {window[0] > 2 && <span className="px-1 text-xs text-ink-400">…</span>}
          </>
        )}

        {window.map((n) => <PageButton key={n} n={n} active={n === page} onClick={() => onPageChange(n)} />)}

        {window[window.length - 1] < totalPages && (
          <>
            {window[window.length - 1] < totalPages - 1 && <span className="px-1 text-xs text-ink-400">…</span>}
            <PageButton n={totalPages} active={false} onClick={() => onPageChange(totalPages)} />
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex h-7 w-7 items-center justify-center rounded-md text-ink-500 transition-colors hover:bg-ink-100 disabled:pointer-events-none disabled:opacity-40 dark:text-ink-400 dark:hover:bg-ink-800"
          aria-label="Next page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function PageButton({ n, active, onClick }: { n: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'flex h-7 w-7 items-center justify-center rounded-md text-xs font-medium transition-colors',
        active
          ? 'bg-brand-600 text-white'
          : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
      )}
    >
      {n}
    </button>
  )
}

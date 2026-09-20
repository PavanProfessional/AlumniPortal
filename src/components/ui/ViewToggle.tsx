import { Table2, LayoutGrid } from 'lucide-react'
import clsx from 'clsx'

export type ViewMode = 'table' | 'card'

export function ViewToggle({ view, onChange }: { view: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="inline-flex shrink-0 items-center gap-0.5 rounded-lg border border-ink-200 bg-ink-50 p-0.5 dark:border-ink-700 dark:bg-ink-900">
      <button
        onClick={() => onChange('table')}
        title="Table view"
        aria-pressed={view === 'table'}
        className={clsx(
          'flex h-7 w-8 items-center justify-center rounded-md transition-colors',
          view === 'table'
            ? 'bg-white text-brand-600 shadow-soft dark:bg-ink-800 dark:text-brand-400'
            : 'text-ink-400 hover:text-ink-600 dark:hover:text-ink-300',
        )}
      >
        <Table2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange('card')}
        title="Card view"
        aria-pressed={view === 'card'}
        className={clsx(
          'flex h-7 w-8 items-center justify-center rounded-md transition-colors',
          view === 'card'
            ? 'bg-white text-brand-600 shadow-soft dark:bg-ink-800 dark:text-brand-400'
            : 'text-ink-400 hover:text-ink-600 dark:hover:text-ink-300',
        )}
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
    </div>
  )
}

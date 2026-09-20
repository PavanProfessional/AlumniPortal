import clsx from 'clsx'

export function Tabs({ tabs, active, onChange }: { tabs: { key: string; label: string; count?: number }[]; active: string; onChange: (key: string) => void }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-ink-200 no-scrollbar dark:border-ink-800">
      {tabs.map((t) => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={clsx(
            'relative whitespace-nowrap px-3.5 py-2.5 text-sm font-medium transition-colors',
            active === t.key ? 'text-brand-600 dark:text-brand-400' : 'text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200',
          )}
        >
          <span className="flex items-center gap-1.5">
            {t.label}
            {typeof t.count === 'number' && (
              <span className={clsx('rounded-full px-1.5 py-0.5 text-[10px] font-semibold', active === t.key ? 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300' : 'bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400')}>
                {t.count}
              </span>
            )}
          </span>
          {active === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand-600 dark:bg-brand-400" />}
        </button>
      ))}
    </div>
  )
}

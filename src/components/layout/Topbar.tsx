import { Menu as MenuIcon, Search, Sun, Moon, Sparkles } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'
import { useTour } from '../../context/TourContext'
import { NotificationsMenu } from './NotificationsMenu'
import { UserMenu } from './UserMenu'
import { Kbd, IconButton } from '../ui/Primitives'

export function Topbar({ onMenuClick, title }: { onMenuClick: () => void; title?: string }) {
  const { setCommandOpen, theme, toggleTheme } = useAppState()
  const { start: startTour } = useTour()

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-ink-200/70 bg-white/80 px-4 backdrop-blur dark:border-ink-800 dark:bg-ink-950/80 sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden">
        <MenuIcon className="h-5 w-5" />
      </button>

      {title && <h2 className="hidden truncate font-display text-base font-semibold text-ink-900 dark:text-ink-50 md:block">{title}</h2>}

      <button
        data-tour="command-palette"
        onClick={() => setCommandOpen(true)}
        className="ml-0 flex h-9 flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50/70 px-3 text-sm text-ink-400 transition-colors hover:border-ink-300 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-600 md:ml-4 md:max-w-sm"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search anything…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={startTour}
          className="hidden items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1.5 text-xs font-medium text-ink-600 transition-colors hover:border-brand-300 hover:text-brand-700 dark:border-ink-700 dark:text-ink-300 dark:hover:border-brand-500/40 dark:hover:text-brand-300 sm:inline-flex"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Quick demo
        </button>
        <IconButton onClick={startTour} title="Start quick demo" className="sm:hidden">
          <Sparkles className="h-4.5 w-4.5 text-brand-500" />
        </IconButton>
        <div data-tour="theme-toggle">
          <IconButton onClick={toggleTheme} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
          </IconButton>
        </div>
        <NotificationsMenu />
        <div className="mx-1 h-6 w-px bg-ink-200 dark:bg-ink-800" />
        <UserMenu />
      </div>
    </header>
  )
}

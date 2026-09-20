import { Menu as MenuIcon, Search, Sun, Moon } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'
import { NotificationsMenu } from './NotificationsMenu'
import { UserMenu } from './UserMenu'
import { Kbd, IconButton } from '../ui/Primitives'

export function Topbar({ onMenuClick, title }: { onMenuClick: () => void; title?: string }) {
  const { setCommandOpen, theme, toggleTheme } = useAppState()

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-ink-200/70 bg-white/80 px-4 backdrop-blur dark:border-ink-800 dark:bg-ink-950/80 sm:px-6">
      <button onClick={onMenuClick} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-800 lg:hidden">
        <MenuIcon className="h-5 w-5" />
      </button>

      {title && <h2 className="hidden truncate font-display text-base font-semibold text-ink-900 dark:text-ink-50 md:block">{title}</h2>}

      <button
        onClick={() => setCommandOpen(true)}
        className="ml-0 flex h-9 flex-1 items-center gap-2 rounded-lg border border-ink-200 bg-ink-50/70 px-3 text-sm text-ink-400 transition-colors hover:border-ink-300 dark:border-ink-700 dark:bg-ink-900 dark:hover:border-ink-600 md:ml-4 md:max-w-sm"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search anything…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <div className="ml-auto flex items-center gap-1.5">
        <IconButton onClick={toggleTheme} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
          {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
        </IconButton>
        <NotificationsMenu />
        <div className="mx-1 h-6 w-px bg-ink-200 dark:bg-ink-800" />
        <UserMenu />
      </div>
    </header>
  )
}

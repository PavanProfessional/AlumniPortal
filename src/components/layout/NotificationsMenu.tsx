import { Popover, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Bell, CalendarDays, Users2, Briefcase, Handshake, Gift, Info, Newspaper } from 'lucide-react'
import { Link } from 'react-router-dom'
import { notifications as seed } from '../../data/notifications'
import { formatRelative } from '../../utils/dates'
import clsx from 'clsx'

const categoryIcon: Record<string, typeof Bell> = {
  event: CalendarDays, community: Users2, career: Briefcase, mentorship: Handshake,
  giving: Gift, system: Info, content: Newspaper,
}

export function NotificationsMenu() {
  const [items, setItems] = useState(seed)
  const unread = items.filter((n) => !n.read).length

  return (
    <Popover className="relative" data-tour="notifications">
      <Popover.Button className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-200">
        <Bell className="h-4.5 w-4.5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-ink-950">
            {unread}
          </span>
        )}
      </Popover.Button>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
        <Popover.Panel className="absolute right-0 top-full z-30 mt-2 w-96 origin-top-right rounded-xl border border-ink-200 bg-white shadow-popover dark:border-ink-800 dark:bg-ink-900">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-ink-800">
            <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">Notifications</p>
            <button onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.map((n) => {
              const Icon = categoryIcon[n.category] ?? Info
              return (
                <Link
                  key={n.id}
                  to={n.actionHref ?? '#'}
                  onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
                  className={clsx('flex gap-3 border-b border-ink-50 px-4 py-3 last:border-0 hover:bg-ink-50 dark:border-ink-800/60 dark:hover:bg-ink-800/50', !n.read && 'bg-brand-50/40 dark:bg-brand-500/5')}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-500 dark:text-ink-400">{n.body}</p>
                    <p className="mt-1 text-[11px] text-ink-400">{formatRelative(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />}
                </Link>
              )
            })}
          </div>
          <div className="border-t border-ink-100 px-4 py-2.5 text-center dark:border-ink-800">
            <Link to="/app/notifications" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">View all notifications</Link>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  )
}

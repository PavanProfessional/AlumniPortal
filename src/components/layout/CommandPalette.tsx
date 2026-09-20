import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users, CalendarDays, Briefcase, MessagesSquare, Newspaper, CornerDownLeft } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'
import { alumniPeople } from '../../data/alumniPeople'
import { events } from '../../data/events'
import { jobs } from '../../data/careers'
import { communities } from '../../data/communities'
import { content } from '../../data/content'
import { Avatar, Kbd } from '../ui/Primitives'

interface Result { id: string; title: string; subtitle: string; href: string; icon: typeof Users; kind: string }

export function CommandPalette() {
  const { commandOpen, setCommandOpen } = useAppState()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    const all: Result[] = [
      ...alumniPeople.slice(0, 40).map((p) => ({ id: p.id, title: `${p.firstName} ${p.lastName}`, subtitle: p.headline, href: `/app/directory/${p.id}`, icon: Users, kind: 'Member' })),
      ...events.map((e) => ({ id: e.id, title: e.title, subtitle: e.type, href: `/app/events/${e.id}`, icon: CalendarDays, kind: 'Event' })),
      ...jobs.map((j) => ({ id: j.id, title: j.title, subtitle: j.employer, href: `/app/careers/${j.id}`, icon: Briefcase, kind: 'Job' })),
      ...communities.map((g) => ({ id: g.id, title: g.name, subtitle: g.type, href: `/app/communities/${g.id}`, icon: MessagesSquare, kind: 'Community' })),
      ...content.map((c) => ({ id: c.id, title: c.title, subtitle: c.type, href: `/app/content`, icon: Newspaper, kind: 'Content' })),
    ]
    if (!q) return all.slice(0, 8)
    return all.filter((r) => r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)).slice(0, 10)
  }, [query])

  function go(href: string) {
    setCommandOpen(false)
    setQuery('')
    navigate(href)
  }

  return (
    <Transition show={commandOpen} as={Fragment} afterLeave={() => setQuery('')}>
      <Dialog onClose={() => setCommandOpen(false)} className="relative z-50">
        <Transition.Child as={Fragment} enter="ease-out duration-150" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 flex items-start justify-center p-4 pt-[12vh]">
          <Transition.Child as={Fragment} enter="ease-out duration-150" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-100" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-xl overflow-hidden rounded-xl2 border border-ink-200 bg-white shadow-popover dark:border-ink-800 dark:bg-ink-900">
              <div className="flex items-center gap-3 border-b border-ink-100 px-4 dark:border-ink-800">
                <Search className="h-4.5 w-4.5 text-ink-400" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members, events, jobs, communities, content…"
                  className="h-12 w-full border-0 bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-0 dark:text-ink-100"
                />
                <Kbd>Esc</Kbd>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {results.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-ink-400">No results for "{query}"</p>
                )}
                {results.map((r) => (
                  <button
                    key={`${r.kind}-${r.id}`}
                    onClick={() => go(r.href)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-ink-50 dark:hover:bg-ink-800"
                  >
                    {r.kind === 'Member' ? (
                      <Avatar name={r.title} size="sm" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-400">
                        <r.icon className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{r.title}</p>
                      <p className="truncate text-xs text-ink-400">{r.subtitle}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-medium text-ink-500 dark:bg-ink-800 dark:text-ink-400">{r.kind}</span>
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-ink-300" />
                  </button>
                ))}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

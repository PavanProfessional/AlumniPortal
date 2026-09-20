import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronsUpDown, UserCircle, ShieldCheck, Building2 } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'
import type { UserRoleContext } from '../../types'
import { workspaceMeta } from './navConfig'

const options: { key: UserRoleContext; icon: typeof UserCircle; desc: string }[] = [
  { key: 'member', icon: UserCircle, desc: 'Browse as an alumni member' },
  { key: 'admin', icon: ShieldCheck, desc: 'Manage the institution tenant' },
  { key: 'superadmin', icon: Building2, desc: 'Operate the SaaS platform' },
]

export function WorkspaceSwitcher() {
  const { workspace, setWorkspace } = useAppState()
  const navigate = useNavigate()

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex w-full items-center justify-between gap-2 rounded-lg border border-ink-200 bg-white px-3 py-2 text-left text-sm font-medium text-ink-800 shadow-soft transition-colors hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:hover:bg-ink-800">
        <span>{workspaceMeta[workspace].label}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-ink-400" />
      </Menu.Button>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
        <Menu.Items className="absolute left-0 top-full z-30 mt-1.5 w-72 origin-top-left rounded-xl border border-ink-200 bg-white p-1.5 shadow-popover focus:outline-none dark:border-ink-800 dark:bg-ink-900">
          <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-ink-400">Switch workspace</p>
          {options.map((opt) => (
            <Menu.Item key={opt.key}>
              {({ active }) => (
                <button
                  onClick={() => { setWorkspace(opt.key); navigate(workspaceMeta[opt.key].base) }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm ${active ? 'bg-ink-50 dark:bg-ink-800' : ''}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-500 dark:bg-ink-800 dark:text-ink-300">
                    <opt.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink-800 dark:text-ink-100">{workspaceMeta[opt.key].label}</p>
                    <p className="truncate text-xs text-ink-400">{opt.desc}</p>
                  </div>
                  {workspace === opt.key && <Check className="h-4 w-4 shrink-0 text-brand-600 dark:text-brand-400" />}
                </button>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

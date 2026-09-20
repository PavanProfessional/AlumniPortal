import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { X } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'
import { workspaceMeta } from './navConfig'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { OrgMark } from './Sidebar'

export function MobileNav({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { workspace, tenant } = useAppState()
  const meta = workspaceMeta[workspace]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    clsx('flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium',
      isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'text-ink-600 dark:text-ink-400')

  return (
    <Transition show={open} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50 lg:hidden">
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-ink-950/50" />
        </Transition.Child>
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="-translate-x-full" enterTo="translate-x-0" leave="ease-in duration-150" leaveFrom="translate-x-0" leaveTo="-translate-x-full">
          <Dialog.Panel className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-ink-900">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-4 dark:border-ink-800">
              <div className="flex items-center gap-2.5">
                <OrgMark size={32} rounded="lg" />
                <div className="min-w-0 leading-tight">
                  <p className="truncate font-display text-sm font-bold text-ink-900 dark:text-ink-50">{tenant.displayName}</p>
                  <p className="truncate text-[11px] text-ink-400">{meta.tagline}</p>
                </div>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"><X className="h-4.5 w-4.5" /></button>
            </div>
            <div className="shrink-0 border-b border-ink-100 px-3 py-3 dark:border-ink-800">
              <WorkspaceSwitcher />
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
              <NavLink to={meta.home.to} end={meta.home.end} onClick={onClose} className={linkClass}>
                <meta.home.icon className="h-4 w-4 shrink-0" />
                {meta.home.label}
              </NavLink>
              {meta.groups.map((group) => (
                <div key={group.label} className="pt-2">
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{group.label}</p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => (
                      <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={linkClass}>
                        <item.icon className="h-4 w-4 shrink-0" />
                        {item.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
            <div className="shrink-0 border-t border-ink-100 p-3 dark:border-ink-800">
              <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2.5 dark:bg-ink-800/60">
                <OrgMark size={28} />
                <div className="min-w-0 leading-tight">
                  <p className="truncate text-xs font-semibold text-ink-800 dark:text-ink-100">{tenant.displayName}</p>
                  <p className="truncate text-[11px] capitalize text-ink-400">{tenant.plan} plan</p>
                </div>
              </div>
            </div>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  )
}

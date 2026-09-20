import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Settings, UserCircle } from 'lucide-react'
import { useAppState } from '../../context/AppStateContext'
import { Avatar } from '../ui/Primitives'

export function UserMenu() {
  const { currentUser } = useAppState()
  const navigate = useNavigate()

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-ink-100 dark:hover:bg-ink-800">
        <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="sm" />
        <span className="hidden text-sm font-medium text-ink-700 dark:text-ink-200 sm:block">{currentUser.firstName}</span>
      </Menu.Button>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
        <Menu.Items className="absolute right-0 top-full z-30 mt-2 w-64 origin-top-right rounded-xl border border-ink-200 bg-white p-1.5 shadow-popover focus:outline-none dark:border-ink-800 dark:bg-ink-900">
          <div className="flex items-center gap-3 px-2.5 py-2">
            <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-800 dark:text-ink-100">{currentUser.firstName} {currentUser.lastName}</p>
              <p className="truncate text-xs text-ink-400">{currentUser.email}</p>
            </div>
          </div>
          <div className="my-1 h-px bg-ink-100 dark:bg-ink-800" />
          <Menu.Item>
            {({ active }) => (
              <button onClick={() => navigate('/app/profile')} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 dark:text-ink-200 ${active ? 'bg-ink-50 dark:bg-ink-800' : ''}`}>
                <UserCircle className="h-4 w-4" /> View profile
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button onClick={() => navigate('/app/settings')} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-700 dark:text-ink-200 ${active ? 'bg-ink-50 dark:bg-ink-800' : ''}`}>
                <Settings className="h-4 w-4" /> Account settings
              </button>
            )}
          </Menu.Item>
          <div className="my-1 h-px bg-ink-100 dark:bg-ink-800" />
          <Menu.Item>
            {({ active }) => (
              <button onClick={() => navigate('/')} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-rose-600 dark:text-rose-400 ${active ? 'bg-rose-50 dark:bg-rose-500/10' : ''}`}>
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

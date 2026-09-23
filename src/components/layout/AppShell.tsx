import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { CommandPalette } from './CommandPalette'
import { AssistantWidget } from '../chat/AssistantWidget'
import { TourOverlay } from '../tour/TourOverlay'
import { useAppState } from '../../context/AppStateContext'
import { workspaceMeta } from './navConfig'
import type { UserRoleContext } from '../../types'

function workspaceFromPath(pathname: string): UserRoleContext {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/platform')) return 'superadmin'
  return 'member'
}

export function AppShell() {
  const location = useLocation()
  const { workspace, setWorkspace } = useAppState()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const derived = workspaceFromPath(location.pathname)
    if (derived !== workspace) setWorkspace(derived)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const title = useMemo(() => {
    const nav = workspaceMeta[workspace].nav
    const match = nav.find((n) => (n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)))
    return match?.label
  }, [location.pathname, workspace])

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-ink-950">
      {/* Reserves the collapsed-rail gutter in the flex row — the actual Sidebar is lg:fixed so it can expand on hover without shifting content. */}
      <div className="hidden shrink-0 lg:block lg:w-[76px]" />
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-7xl animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <CommandPalette />
      <AssistantWidget />
      <TourOverlay />
    </div>
  )
}

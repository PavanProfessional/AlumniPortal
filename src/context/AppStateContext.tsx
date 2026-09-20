import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Tenant, UserRoleContext } from '../types'
import { currentPerson } from '../data/people'
import { currentTenant } from '../data/tenants'
import { applyBrandColor } from '../utils/color'

interface AppState {
  workspace: UserRoleContext
  setWorkspace: (w: UserRoleContext) => void
  theme: 'light' | 'dark'
  toggleTheme: () => void
  currentUser: typeof currentPerson
  tenant: Tenant
  updateTenant: (patch: Partial<Tenant>) => void
  commandOpen: boolean
  setCommandOpen: (v: boolean) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [workspace, setWorkspace] = useState<UserRoleContext>('member')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [commandOpen, setCommandOpen] = useState(false)
  const [tenant, setTenant] = useState<Tenant>(currentTenant)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') root.classList.add('dark')
    else root.classList.remove('dark')
  }, [theme])

  useEffect(() => {
    applyBrandColor(tenant.brandColor)
  }, [tenant.brandColor])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const value = useMemo<AppState>(() => ({
    workspace,
    setWorkspace,
    theme,
    toggleTheme: () => setTheme((t) => (t === 'light' ? 'dark' : 'light')),
    currentUser: currentPerson,
    tenant,
    updateTenant: (patch) => setTenant((prev) => ({ ...prev, ...patch })),
    commandOpen,
    setCommandOpen,
  }), [workspace, theme, tenant, commandOpen])

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider')
  return ctx
}

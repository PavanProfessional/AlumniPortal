import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CustomDashboard, DashboardWidget } from '../types'
import { NOW } from '../utils/dates'

let seq = 1000
function nextId(prefix: string) {
  seq += 1
  return `${prefix}_${seq}`
}

function seedWidget(partial: Omit<DashboardWidget, 'id' | 'lastUpdatedAt' | 'filters' | 'showAll' | 'autoReload'> & Partial<Pick<DashboardWidget, 'filters' | 'showAll' | 'autoReload'>>): DashboardWidget {
  return {
    id: nextId('widget'),
    lastUpdatedAt: NOW.toISOString(),
    filters: partial.filters ?? [],
    showAll: partial.showAll ?? false,
    autoReload: partial.autoReload ?? 'off',
    ...partial,
  }
}

function seedDashboards(): CustomDashboard[] {
  return [
    {
      id: nextId('dash'),
      name: 'Alumni Engagement Overview',
      createdAt: NOW.toISOString(),
      updatedAt: NOW.toISOString(),
      dashboardTimescale: null,
      widgets: [
        seedWidget({ title: 'Total Members', dataSource: 'members', groupBy: 'batch', metric: 'count', top: 1, timescale: 'all_time', chartType: 'panel', colorPalette: 'brand', size: 'S' }),
        seedWidget({ title: 'Members by Batch', dataSource: 'members', groupBy: 'batch', metric: 'count', top: 8, timescale: 'all_time', chartType: 'bar', colorPalette: 'brand', size: 'L' }),
        seedWidget({ title: 'Events by Type', dataSource: 'events', groupBy: 'type', metric: 'count', top: 6, timescale: 'all_time', chartType: 'pie', colorPalette: 'ocean', size: 'M' }),
        seedWidget({ title: 'Applicants by Job Type', dataSource: 'careers', groupBy: 'employmentType', metric: 'applicants', top: 5, timescale: 'all_time', chartType: 'bar', colorPalette: 'forest', size: 'M' }),
        seedWidget({ title: 'Funds Raised by Campaign', dataSource: 'fundraising', groupBy: 'type', metric: 'raised', top: 6, timescale: 'all_time', chartType: 'table', colorPalette: 'sunset', size: 'M' }),
      ],
    },
  ]
}

interface DashboardsState {
  dashboards: CustomDashboard[]
  createDashboard: (name: string) => string
  renameDashboard: (id: string, name: string) => void
  deleteDashboard: (id: string) => void
  duplicateDashboard: (id: string) => string
  setDashboardTimescale: (id: string, timescale: CustomDashboard['dashboardTimescale']) => void
  addWidget: (dashboardId: string, widget: Omit<DashboardWidget, 'id' | 'lastUpdatedAt'>) => void
  updateWidget: (dashboardId: string, widgetId: string, patch: Omit<DashboardWidget, 'id'>) => void
  deleteWidget: (dashboardId: string, widgetId: string) => void
  duplicateWidget: (dashboardId: string, widgetId: string) => void
  reorderWidgets: (dashboardId: string, fromIndex: number, toIndex: number) => void
  touchWidget: (dashboardId: string, widgetId: string) => void
}

const DashboardsContext = createContext<DashboardsState | null>(null)

export function DashboardsProvider({ children }: { children: ReactNode }) {
  const [dashboards, setDashboards] = useState<CustomDashboard[]>(() => seedDashboards())

  const touch = (d: CustomDashboard): CustomDashboard => ({ ...d, updatedAt: NOW.toISOString() })

  const createDashboard = useCallback((name: string) => {
    const id = nextId('dash')
    const dashboard: CustomDashboard = { id, name, createdAt: NOW.toISOString(), updatedAt: NOW.toISOString(), dashboardTimescale: null, widgets: [] }
    setDashboards((prev) => [...prev, dashboard])
    return id
  }, [])

  const renameDashboard = useCallback((id: string, name: string) => {
    setDashboards((prev) => prev.map((d) => (d.id === id ? touch({ ...d, name }) : d)))
  }, [])

  const deleteDashboard = useCallback((id: string) => {
    setDashboards((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const duplicateDashboard = useCallback((id: string) => {
    const newId = nextId('dash')
    setDashboards((prev) => {
      const source = prev.find((d) => d.id === id)
      if (!source) return prev
      const copy: CustomDashboard = {
        ...source,
        id: newId,
        name: `${source.name} (Copy)`,
        createdAt: NOW.toISOString(),
        updatedAt: NOW.toISOString(),
        widgets: source.widgets.map((w) => ({ ...w, id: nextId('widget') })),
      }
      return [...prev, copy]
    })
    return newId
  }, [])

  const setDashboardTimescale = useCallback((id: string, timescale: CustomDashboard['dashboardTimescale']) => {
    setDashboards((prev) => prev.map((d) => (d.id === id ? touch({ ...d, dashboardTimescale: timescale }) : d)))
  }, [])

  const addWidget = useCallback((dashboardId: string, widget: Omit<DashboardWidget, 'id' | 'lastUpdatedAt'>) => {
    setDashboards((prev) => prev.map((d) => (d.id === dashboardId
      ? touch({ ...d, widgets: [...d.widgets, { ...widget, id: nextId('widget'), lastUpdatedAt: NOW.toISOString() }] })
      : d)))
  }, [])

  const updateWidget = useCallback((dashboardId: string, widgetId: string, patch: Omit<DashboardWidget, 'id'>) => {
    setDashboards((prev) => prev.map((d) => (d.id === dashboardId
      ? touch({ ...d, widgets: d.widgets.map((w) => (w.id === widgetId ? { ...patch, id: widgetId } : w)) })
      : d)))
  }, [])

  const deleteWidget = useCallback((dashboardId: string, widgetId: string) => {
    setDashboards((prev) => prev.map((d) => (d.id === dashboardId ? touch({ ...d, widgets: d.widgets.filter((w) => w.id !== widgetId) }) : d)))
  }, [])

  const duplicateWidget = useCallback((dashboardId: string, widgetId: string) => {
    setDashboards((prev) => prev.map((d) => {
      if (d.id !== dashboardId) return d
      const source = d.widgets.find((w) => w.id === widgetId)
      if (!source) return d
      const copy: DashboardWidget = { ...source, id: nextId('widget'), title: `${source.title} (Copy)`, lastUpdatedAt: NOW.toISOString() }
      const idx = d.widgets.findIndex((w) => w.id === widgetId)
      const widgets = [...d.widgets]
      widgets.splice(idx + 1, 0, copy)
      return touch({ ...d, widgets })
    }))
  }, [])

  const reorderWidgets = useCallback((dashboardId: string, fromIndex: number, toIndex: number) => {
    setDashboards((prev) => prev.map((d) => {
      if (d.id !== dashboardId) return d
      const widgets = [...d.widgets]
      const [moved] = widgets.splice(fromIndex, 1)
      widgets.splice(toIndex, 0, moved)
      return touch({ ...d, widgets })
    }))
  }, [])

  const touchWidget = useCallback((dashboardId: string, widgetId: string) => {
    setDashboards((prev) => prev.map((d) => (d.id === dashboardId
      ? { ...d, widgets: d.widgets.map((w) => (w.id === widgetId ? { ...w, lastUpdatedAt: NOW.toISOString() } : w)) }
      : d)))
  }, [])

  const value = useMemo<DashboardsState>(() => ({
    dashboards, createDashboard, renameDashboard, deleteDashboard, duplicateDashboard, setDashboardTimescale,
    addWidget, updateWidget, deleteWidget, duplicateWidget, reorderWidgets, touchWidget,
  }), [dashboards, createDashboard, renameDashboard, deleteDashboard, duplicateDashboard, setDashboardTimescale, addWidget, updateWidget, deleteWidget, duplicateWidget, reorderWidgets, touchWidget])

  return <DashboardsContext.Provider value={value}>{children}</DashboardsContext.Provider>
}

export function useDashboards() {
  const ctx = useContext(DashboardsContext)
  if (!ctx) throw new Error('useDashboards must be used within DashboardsProvider')
  return ctx
}

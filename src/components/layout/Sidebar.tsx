import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import clsx from 'clsx'
import { GraduationCap } from 'lucide-react'
import { workspaceMeta } from './navConfig'
import { useAppState } from '../../context/AppStateContext'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'

export const SIDEBAR_COLLAPSED_W = 76

export function Sidebar() {
  const { workspace, tenant } = useAppState()
  const meta = workspaceMeta[workspace]
  const [expanded, setExpanded] = useState(false)

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={clsx(
        'hidden shrink-0 flex-col overflow-hidden border-r border-ink-200/70 bg-white shadow-none transition-[width] duration-200 ease-out dark:border-ink-800 dark:bg-ink-900 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex',
        expanded ? 'lg:w-72 lg:shadow-popover' : 'lg:w-[76px]',
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-ink-100 px-5 dark:border-ink-800" title={expanded ? undefined : tenant.displayName}>
        <OrgMark size={32} rounded="lg" />
        {expanded && (
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-sm font-bold text-ink-900 dark:text-ink-50">{tenant.displayName}</p>
            <p className="truncate text-[11px] text-ink-400">{meta.tagline}</p>
          </div>
        )}
      </div>

      <div className="shrink-0 border-b border-ink-100 px-3 py-3 dark:border-ink-800" data-tour="workspace-switcher">
        {expanded ? (
          <WorkspaceSwitcher />
        ) : (
          <div className="flex h-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-400 dark:border-ink-700 dark:bg-ink-900">
            <GraduationCap className="h-4 w-4" />
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-3 py-3 no-scrollbar" data-tour="sidebar-nav">
        <NavRow item={meta.home} expanded={expanded} />

        {meta.groups.map((group) => (
          <div key={group.label} className="pt-2">
            {expanded ? (
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">{group.label}</p>
            ) : (
              <div className="my-1.5 h-px bg-ink-100 dark:bg-ink-800" />
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavRow key={item.to} item={item} expanded={expanded} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-ink-100 p-3 dark:border-ink-800">
        {expanded ? (
          <div className="flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2.5 dark:bg-ink-800/60">
            <OrgMark size={28} />
            <div className="min-w-0 leading-tight">
              <p className="truncate text-xs font-semibold text-ink-800 dark:text-ink-100">{tenant.displayName}</p>
              <p className="truncate text-[11px] capitalize text-ink-400">{tenant.plan} plan</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center" title={tenant.displayName}>
            <OrgMark size={36} />
          </div>
        )}
      </div>
    </aside>
  )
}

function NavRow({ item, expanded }: { item: import('./navConfig').NavItem; expanded: boolean }) {
  const rowClass = clsx(
    'flex items-center gap-2.5 rounded-lg py-2 text-sm font-medium transition-colors',
    expanded ? 'px-3' : 'justify-center px-0',
    'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100',
  )

  if (item.external) {
    return (
      <a href={item.to} target="_blank" rel="noreferrer" title={expanded ? undefined : item.label} className={rowClass}>
        <item.icon className="h-4 w-4 shrink-0" />
        {expanded && <span className="truncate">{item.label}</span>}
      </a>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      title={expanded ? undefined : item.label}
      className={({ isActive }) =>
        clsx(
          'flex items-center gap-2.5 rounded-lg py-2 text-sm font-medium transition-colors',
          expanded ? 'px-3' : 'justify-center px-0',
          isActive
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
            : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-100',
        )
      }
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {expanded && <span className="truncate">{item.label}</span>}
    </NavLink>
  )
}

/** Renders the tenant's uploaded logo when present, falling back to an initials badge in the brand color. */
export function OrgMark({ size = 28, rounded = 'md' }: { size?: number; rounded?: 'md' | 'lg' }) {
  const { tenant } = useAppState()
  const roundedClass = rounded === 'lg' ? 'rounded-lg' : 'rounded-md'
  if (tenant.logoImageUrl) {
    return (
      <img
        src={tenant.logoImageUrl}
        alt={tenant.displayName}
        className={clsx('shrink-0 object-cover', roundedClass)}
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div
      className={clsx('flex shrink-0 items-center justify-center font-bold text-white', roundedClass)}
      style={{ backgroundColor: tenant.brandColor, width: size, height: size, fontSize: size * 0.38 }}
    >
      {tenant.logoInitials}
    </div>
  )
}

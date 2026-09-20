import type { ReactNode } from 'react'
import clsx from 'clsx'

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info'

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-ink-100 text-ink-700 dark:bg-ink-800 dark:text-ink-200',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300',
  success: 'bg-accent-100 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300',
  warning: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
}

export function Badge({ tone = 'neutral', children, dot = false, className }: { tone?: BadgeTone; children: ReactNode; dot?: boolean; className?: string }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', toneClasses[tone], className)}>
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', {
        'bg-ink-500': tone === 'neutral', 'bg-brand-500': tone === 'brand', 'bg-accent-500': tone === 'success',
        'bg-amber-500': tone === 'warning', 'bg-rose-500': tone === 'danger', 'bg-sky-500': tone === 'info',
      })} />}
      {children}
    </span>
  )
}

const statusToneMap: Record<string, BadgeTone> = {
  active: 'success', published: 'success', completed: 'success', attended: 'success', captured: 'success',
  connected: 'success', delivered: 'success', resolved: 'success', accepted: 'success', approved: 'success',
  checked_in: 'success', verified: 'success', 'institution-verified': 'success',
  draft: 'neutral', pending: 'warning', pending_review: 'warning', review: 'warning', waitlisted: 'warning',
  trial: 'warning', retrying: 'warning', in_progress: 'warning', assigned: 'warning', screening: 'warning',
  scheduled: 'info', registered: 'info', new: 'info', matched: 'info', invited: 'info', shortlisted: 'info',
  registration_open: 'info', live: 'info', authorized: 'info',
  suspended: 'danger', cancelled: 'danger', failed: 'danger', error: 'danger', disconnected: 'neutral',
  rejected: 'danger', no_show: 'danger', chargeback: 'danger', refunded: 'neutral', disputed: 'danger',
  archived: 'neutral', closed: 'neutral', paused: 'neutral', deactivated: 'neutral', unverified: 'neutral',
  imported: 'info', withdrawn: 'neutral', not_configured: 'neutral',
}

export function StatusBadge({ status }: { status: string }) {
  const tone = statusToneMap[status] ?? 'neutral'
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  return <Badge tone={tone} dot>{label}</Badge>
}

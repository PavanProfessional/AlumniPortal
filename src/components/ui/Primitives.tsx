import type { ButtonHTMLAttributes, HTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import clsx from 'clsx'
import { Search } from 'lucide-react'
import { initials as getInitials } from '../../utils/format'

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx('rounded-xl2 border border-ink-200/70 bg-white shadow-soft dark:border-ink-800 dark:bg-ink-900', className)}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, className, icon }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <div className={clsx('flex items-start justify-between gap-4 border-b border-ink-100 px-5 py-4 dark:border-ink-800', className)}>
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-ink-50">{icon}{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-sm shadow-brand-600/20 focus-visible:outline-brand-600',
  secondary: 'bg-ink-900 text-white hover:bg-ink-800 dark:bg-ink-100 dark:text-ink-900 dark:hover:bg-white',
  outline: 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-200 dark:hover:bg-ink-800',
  ghost: 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-600/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
}

export function Button({
  variant = 'primary', size = 'md', className, children, icon, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; icon?: ReactNode }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant], sizeClasses[size], className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}

export function IconButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx('inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-700 dark:text-ink-400 dark:hover:bg-ink-800 dark:hover:text-ink-200', className)}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Avatar({ name, color, size = 'md', src }: { name: string; color?: string; size?: 'xs' | 'sm' | 'md' | 'lg'; src?: string }) {
  const [first, ...rest] = name.split(' ')
  const last = rest.join(' ')
  const sizeMap = { xs: 'h-6 w-6 text-[10px]', sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg' }
  if (src) {
    return <img src={src} alt={name} className={clsx('rounded-full object-cover', sizeMap[size])} />
  }
  return (
    <div
      className={clsx('flex shrink-0 items-center justify-center rounded-full font-semibold text-white', sizeMap[size])}
      style={{ backgroundColor: color ?? 'rgb(var(--color-brand-500))' }}
    >
      {getInitials(first ?? '', last ?? '')}
    </div>
  )
}

export function ProgressBar({ value, tone = 'brand', className }: { value: number; tone?: 'brand' | 'success' | 'warning' | 'danger'; className?: string }) {
  const toneMap = { brand: 'bg-brand-500', success: 'bg-accent-500', warning: 'bg-amber-500', danger: 'bg-rose-500' }
  return (
    <div className={clsx('h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800', className)}>
      <div className={clsx('h-full rounded-full transition-all', toneMap[tone])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function StatCard({ label, value, delta, deltaTone = 'success', icon, sub }: {
  label: string; value: ReactNode; delta?: string; deltaTone?: 'success' | 'danger' | 'neutral'; icon?: ReactNode; sub?: string
}) {
  const deltaColor = deltaTone === 'success' ? 'text-accent-600 dark:text-accent-400' : deltaTone === 'danger' ? 'text-rose-600 dark:text-rose-400' : 'text-ink-500'
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500 dark:text-ink-400">{label}</p>
        {icon && <div className="text-ink-400 dark:text-ink-500">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <p className="font-display text-2xl font-bold text-ink-900 dark:text-ink-50">{value}</p>
        {delta && <span className={clsx('text-xs font-semibold', deltaColor)}>{delta}</span>}
      </div>
      {sub && <p className="mt-1 text-xs text-ink-500 dark:text-ink-400">{sub}</p>}
    </Card>
  )
}

export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl2 border border-dashed border-ink-200 bg-ink-50/50 px-6 py-14 text-center dark:border-ink-800 dark:bg-ink-900/40">
      {icon && <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-ink-800 dark:text-ink-500">{icon}</div>}
      <div>
        <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-sm text-xs text-ink-500 dark:text-ink-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function SearchInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={clsx('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <input
        className="h-9 w-full rounded-lg border border-ink-200 bg-white pl-9 pr-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100 dark:placeholder:text-ink-500 dark:focus:ring-brand-500/20"
        {...rest}
      />
    </div>
  )
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-xl font-bold text-ink-900 dark:text-ink-50 sm:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-500 dark:text-ink-400">{description}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  )
}

export function Chip({ active, children, onClick, count }: { active?: boolean; children: ReactNode; onClick?: () => void; count?: number }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-brand-600 bg-brand-600 text-white'
          : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 hover:bg-ink-50 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300 dark:hover:bg-ink-800',
      )}
    >
      {children}
      {typeof count === 'number' && (
        <span className={clsx('rounded-full px-1.5 text-[10px]', active ? 'bg-white/20' : 'bg-ink-100 dark:bg-ink-800')}>{count}</span>
      )}
    </button>
  )
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className="rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-500 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-400">{children}</kbd>
}

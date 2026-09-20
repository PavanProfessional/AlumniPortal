import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastOptions {
  message: string
  description?: string
  type?: ToastType
  position?: ToastPosition
  duration?: number
}

interface ToastRecord extends Required<Pick<ToastOptions, 'message' | 'type' | 'position' | 'duration'>> {
  id: number
  description?: string
}

interface ToastContextValue {
  notify: (opts: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const positions: ToastPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right']

const positionClass: Record<ToastPosition, string> = {
  'top-left': 'top-4 left-4 items-start',
  'top-right': 'top-4 right-4 items-end',
  'bottom-left': 'bottom-4 left-4 items-start',
  'bottom-right': 'bottom-4 right-4 items-end',
}

const typeIcon: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2, error: XCircle, warning: AlertTriangle, info: Info,
}

const typeClass: Record<ToastType, string> = {
  success: 'text-accent-600 dark:text-accent-400',
  error: 'text-rose-600 dark:text-rose-400',
  warning: 'text-amber-600 dark:text-amber-400',
  info: 'text-sky-600 dark:text-sky-400',
}

let idCounter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const notify = useCallback((opts: ToastOptions) => {
    const id = ++idCounter
    const record: ToastRecord = {
      id,
      message: opts.message,
      description: opts.description,
      type: opts.type ?? 'success',
      position: opts.position ?? 'top-right',
      duration: opts.duration ?? 3800,
    }
    setToasts((prev) => [...prev, record])
    window.setTimeout(() => remove(id), record.duration)
  }, [remove])

  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {positions.map((pos) => {
        const items = toasts.filter((t) => t.position === pos)
        if (items.length === 0) return null
        return (
          <div key={pos} className={clsx('pointer-events-none fixed z-[100] flex w-full max-w-sm flex-col gap-2 sm:max-w-sm', positionClass[pos])}>
            {items.map((t) => {
              const Icon = typeIcon[t.type]
              return (
                <div
                  key={t.id}
                  className="animate-scale-in pointer-events-auto flex w-full items-start gap-3 rounded-xl2 border border-ink-200 bg-white px-4 py-3 shadow-popover dark:border-ink-800 dark:bg-ink-900"
                >
                  <Icon className={clsx('mt-0.5 h-4.5 w-4.5 shrink-0', typeClass[t.type])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink-800 dark:text-ink-100">{t.message}</p>
                    {t.description && <p className="mt-0.5 text-xs text-ink-500 dark:text-ink-400">{t.description}</p>}
                  </div>
                  <button onClick={() => remove(t.id)} className="shrink-0 text-ink-300 hover:text-ink-600 dark:hover:text-ink-300">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        )
      })}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx.notify
}

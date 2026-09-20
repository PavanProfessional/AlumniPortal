import { Dialog, Transition } from '@headlessui/react'
import { Fragment, type ReactNode, useState } from 'react'
import { X, Maximize2, Minimize2 } from 'lucide-react'
import clsx from 'clsx'
import { IconButton } from './Primitives'

export type PanelSize = 'S' | 'M' | 'L' | 'XL' | 'XXL'

const sizeOrder: PanelSize[] = ['S', 'M', 'L', 'XL', 'XXL']

const sizeClass: Record<PanelSize, string> = {
  S: 'max-w-[420px]',
  M: 'max-w-[560px]',
  L: 'max-w-[720px]',
  XL: 'max-w-[900px]',
  XXL: 'max-w-[1120px]',
}

/**
 * Right-hand slide-over used for every create/edit flow in the app (replaces center modals).
 * Left side of the header cycles through S/M/L/XL/XXL widths; right side always closes.
 */
export function SidePanel({
  open, onClose, title, description, children, footer, defaultSize = 'L', allowResize = true,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  footer?: ReactNode
  defaultSize?: PanelSize
  allowResize?: boolean
}) {
  const [size, setSize] = useState<PanelSize>(defaultSize)
  const atMax = size === 'XXL'

  function cycleSize() {
    const idx = sizeOrder.indexOf(size)
    setSize(sizeOrder[atMax ? 0 : idx + 1])
  }

  return (
    <Transition show={open} as={Fragment} afterLeave={() => setSize(defaultSize)}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-ink-950/50 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-y-0 right-0 flex max-w-full">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-250" enterFrom="translate-x-full" enterTo="translate-x-0"
            leave="ease-in duration-200" leaveFrom="translate-x-0" leaveTo="translate-x-full"
          >
            <Dialog.Panel className={clsx('flex h-full w-screen flex-col border-l border-ink-200 bg-white shadow-popover transition-[max-width] duration-200 dark:border-ink-800 dark:bg-ink-900', sizeClass[size])}>
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-ink-100 px-6 py-4 dark:border-ink-800">
                <div className="flex items-start gap-3">
                  {allowResize && (
                    <IconButton onClick={cycleSize} title={`Resize panel (currently ${size})`} className="mt-0.5 shrink-0">
                      {atMax ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </IconButton>
                  )}
                  <div>
                    <Dialog.Title className="text-base font-semibold text-ink-900 dark:text-ink-50">{title}</Dialog.Title>
                    {description && <Dialog.Description className="mt-1 text-sm text-ink-500 dark:text-ink-400">{description}</Dialog.Description>}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {allowResize && (
                    <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold text-ink-500 dark:bg-ink-800 dark:text-ink-400">{size}</span>
                  )}
                  <IconButton onClick={onClose} title="Close"><X className="h-4 w-4" /></IconButton>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
              {footer && <div className="flex shrink-0 justify-end gap-2 border-t border-ink-100 px-6 py-4 dark:border-ink-800">{footer}</div>}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

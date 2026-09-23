import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export interface TourStep {
  /** Matches a `data-tour="<target>"` attribute in the DOM. Omit for a centered, un-spotlighted step (intro/outro). */
  target?: string
  title: string
  body: string
}

export const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Alumnia 👋',
    body: "Let's take a 60-second tour of the workspace so you know exactly where everything lives.",
  },
  {
    target: 'sidebar-nav',
    title: 'Your navigation',
    body: 'Every module for this workspace lives here — hover the rail to expand it and see full labels.',
  },
  {
    target: 'workspace-switcher',
    title: 'Switch workspace',
    body: 'Jump between the Member Portal, Admin Console and Platform Console from here at any time.',
  },
  {
    target: 'command-palette',
    title: 'Search anything',
    body: 'Press ⌘K (or Ctrl+K) anywhere to jump straight to a page, person or record without clicking around.',
  },
  {
    target: 'notifications',
    title: 'Stay in the loop',
    body: 'Mentions, approvals and platform alerts land here — nothing gets missed.',
  },
  {
    target: 'theme-toggle',
    title: 'Light or dark',
    body: 'Switch between light and dark mode any time to match your preference.',
  },
  {
    target: 'assistant-widget',
    title: 'Ask the assistant',
    body: "Stuck? Open the assistant and ask it anything — it answers using this workspace's live data.",
  },
  {
    title: "You're all set! 🎉",
    body: 'Explore at your own pace — you can restart this tour anytime from the top bar.',
  },
]

interface TourContextValue {
  active: boolean
  stepIndex: number
  steps: TourStep[]
  start: () => void
  stop: () => void
  next: () => void
  back: () => void
}

const TourContext = createContext<TourContextValue | null>(null)

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const value = useMemo<TourContextValue>(() => ({
    active,
    stepIndex,
    steps: TOUR_STEPS,
    start: () => { setStepIndex(0); setActive(true) },
    stop: () => setActive(false),
    next: () => setStepIndex((i) => {
      if (i + 1 >= TOUR_STEPS.length) { setActive(false); return i }
      return i + 1
    }),
    back: () => setStepIndex((i) => Math.max(0, i - 1)),
  }), [active, stepIndex])

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

export function useTour() {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Sparkles, X } from 'lucide-react'
import { useTour } from '../../context/TourContext'

interface Rect { top: number; left: number; width: number; height: number }

const PAD = 8
const TOOLTIP_W = 320

function measure(target?: string): Rect | null {
  if (!target) return null
  const el = document.querySelector(`[data-tour="${target}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  // A hidden element (e.g. the desktop sidebar below the lg breakpoint) reports a
  // zero-size rect at (0,0) — treat that as "not on screen" and fall back to centered.
  if (r.width === 0 && r.height === 0) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

export function TourOverlay() {
  const { active, stepIndex, steps, next, back, stop } = useTour()
  const [rect, setRect] = useState<Rect | null>(null)
  const step = steps[stepIndex]

  useEffect(() => {
    if (!active) return
    function update() { setRect(measure(step?.target)) }
    update()
    // Target elements can shift slightly right after mount/theme toggle — settle once more shortly after.
    const settle = window.setTimeout(update, 120)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.clearTimeout(settle)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [active, step?.target])

  if (!active || !step) return null

  const spotlight = rect
    ? { top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2 }
    : null

  let tooltipStyle: { top: number; left: number }
  if (spotlight) {
    const spaceBelow = window.innerHeight - (spotlight.top + spotlight.height)
    const below = spaceBelow > 220
    const top = below ? spotlight.top + spotlight.height + 14 : Math.max(16, spotlight.top - 14 - 210)
    const left = Math.min(Math.max(16, spotlight.left + spotlight.width / 2 - TOOLTIP_W / 2), window.innerWidth - TOOLTIP_W - 16)
    tooltipStyle = { top, left }
  } else {
    tooltipStyle = { top: window.innerHeight / 2 - 110, left: window.innerWidth / 2 - TOOLTIP_W / 2 }
  }

  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1

  return (
    <div className="fixed inset-0 z-[200]">
      {spotlight ? (
        <div
          className="fixed rounded-xl transition-all duration-300 ease-out"
          style={{ ...spotlight, boxShadow: '0 0 0 9999px rgba(15,23,42,0.65)', outline: '2px solid rgba(255,255,255,0.9)', outlineOffset: 2 }}
        />
      ) : (
        <div className="fixed inset-0 bg-ink-950/65 transition-opacity duration-300" />
      )}

      <div
        className="fixed z-[201] w-80 rounded-2xl border border-ink-200 bg-white p-4 shadow-2xl transition-all duration-300 ease-out dark:border-ink-700 dark:bg-ink-900"
        style={{ top: tooltipStyle.top, left: tooltipStyle.left }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            <Sparkles className="h-3.5 w-3.5" /> Step {stepIndex + 1} of {steps.length}
          </div>
          <button onClick={stop} className="rounded-md p-0.5 text-ink-400 hover:bg-ink-100 hover:text-ink-600 dark:hover:bg-ink-800">
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 font-display text-base font-bold text-ink-900 dark:text-ink-50">{step.title}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-600 dark:text-ink-300">{step.body}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, i) => (
              <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === stepIndex ? 'bg-brand-600' : 'bg-ink-200 dark:bg-ink-700'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {!isFirst && (
              <button onClick={back} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            )}
            <button onClick={next} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
              {isLast ? 'Finish' : 'Next'} {!isLast && <ArrowRight className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
        {!isLast && (
          <button onClick={stop} className="mt-2 text-xs font-medium text-ink-400 hover:text-ink-600 dark:hover:text-ink-300">Skip tour</button>
        )}
      </div>
    </div>
  )
}

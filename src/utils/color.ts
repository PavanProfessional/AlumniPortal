// Generates a full 50–950 Tailwind-style shade scale from a single brand color,
// so the whole product can be re-themed at runtime from one admin-picked hex value.

export const brandShadeSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
export type BrandShadeStep = (typeof brandShadeSteps)[number]

function hexToHsl(hex: string): [number, number, number] {
  const clean = hex.replace('#', '')
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean
  const r = parseInt(full.slice(0, 2), 16) / 255
  const g = parseInt(full.slice(2, 4), 16) / 255
  const b = parseInt(full.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      default: h = (r - g) / d + 4
    }
    h /= 6
  }
  return [h * 360, s * 100, l * 100]
}

/** Returns a space-separated "r g b" triplet (0-255 ints) — the format Tailwind's <alpha-value> pattern expects. */
function hslToRgbTriplet(h: number, s: number, l: number): string {
  const hh = h / 360
  const ss = Math.min(100, Math.max(0, s)) / 100
  const ll = Math.min(100, Math.max(0, l)) / 100
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t
    if (tt < 0) tt += 1
    if (tt > 1) tt -= 1
    if (tt < 1 / 6) return p + (q - p) * 6 * tt
    if (tt < 1 / 2) return q
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6
    return p
  }
  let r: number, g: number, b: number
  if (ss === 0) {
    r = g = b = ll
  } else {
    const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss
    const p = 2 * ll - q
    r = hue2rgb(p, q, hh + 1 / 3)
    g = hue2rgb(p, q, hh)
    b = hue2rgb(p, q, hh - 1 / 3)
  }
  const to255 = (x: number) => Math.round(x * 255)
  return `${to255(r)} ${to255(g)} ${to255(b)}`
}

/**
 * Anchors the input color at the "600" step (the weight used for primary buttons,
 * active nav states, etc.) and interpolates lighter/darker steps around it.
 */
export function generateBrandShades(baseHex: string): Record<BrandShadeStep, string> {
  const [h, s, rawL] = hexToHsl(baseHex)
  const baseL = Math.min(72, Math.max(28, rawL))

  const lightnessByStep: Record<BrandShadeStep, number> = {
    '50': baseL + 40,
    '100': baseL + 34,
    '200': baseL + 26,
    '300': baseL + 19,
    '400': baseL + 11,
    '500': baseL + 5,
    '600': baseL,
    '700': baseL * 0.82,
    '800': baseL * 0.66,
    '900': baseL * 0.52,
    '950': baseL * 0.34,
  }

  const saturationByStep = (step: BrandShadeStep) => {
    if (step === '50' || step === '100') return Math.max(s * 0.45, 25)
    if (step === '950') return Math.min(s * 1.05, 92)
    return s
  }

  const shades = {} as Record<BrandShadeStep, string>
  for (const step of brandShadeSteps) {
    shades[step] = hslToRgbTriplet(h, saturationByStep(step), Math.min(98, Math.max(6, lightnessByStep[step])))
  }
  return shades
}

/** Writes the generated scale onto :root as --color-brand-{step} "r g b" custom properties. */
export function applyBrandColor(baseHex: string) {
  const shades = generateBrandShades(baseHex)
  const root = document.documentElement
  for (const step of brandShadeSteps) {
    root.style.setProperty(`--color-brand-${step}`, shades[step])
  }
}

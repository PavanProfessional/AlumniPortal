import { makeRng } from './random'

const monthLabels = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

export function monthlySeries(seed: number, base: number, growth = 0.03, volatility = 0.08) {
  const rng = makeRng(seed)
  let value = base
  return monthLabels.map((month) => {
    value = value * (1 + growth + (rng.next() - 0.5) * volatility)
    return { month, value: Math.round(value) }
  })
}

export function multiSeries(seed: number, keys: { key: string; base: number; growth?: number }[]) {
  const rng = makeRng(seed)
  const values: Record<string, number> = {}
  keys.forEach((k) => { values[k.key] = k.base })
  return monthLabels.map((month) => {
    const row: Record<string, number | string> = { month }
    keys.forEach((k) => {
      values[k.key] = values[k.key] * (1 + (k.growth ?? 0.03) + (rng.next() - 0.5) * 0.08)
      row[k.key] = Math.round(values[k.key])
    })
    return row
  })
}

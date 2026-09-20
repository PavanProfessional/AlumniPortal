// Deterministic pseudo-random generator so sample data is stable across renders/reloads.
export function mulberry32(seed: number) {
  let a = seed
  return function rand() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function makeRng(seed = 42) {
  const rand = mulberry32(seed)
  return {
    next: () => rand(),
    int: (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min,
    pick<T>(arr: T[]): T {
      return arr[Math.floor(rand() * arr.length)]
    },
    pickMany<T>(arr: T[], count: number): T[] {
      const pool = [...arr]
      const out: T[] = []
      for (let i = 0; i < count && pool.length; i++) {
        const idx = Math.floor(rand() * pool.length)
        out.push(pool[idx])
        pool.splice(idx, 1)
      }
      return out
    },
    bool: (p = 0.5) => rand() < p,
    id: (prefix: string, n: number) => `${prefix}_${String(n).padStart(4, '0')}`,
  }
}

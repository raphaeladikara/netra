/** Deterministic PRNG so the demo looks identical on every reload. */
export function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const pick = <T,>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length) % list.length]

export const between = (rand: () => number, min: number, max: number) =>
  min + rand() * (max - min)

import type { Rang } from '../typen'

const STUFEN: { ab: number; rang: Rang }[] = [
  { ab: 600, rang: 'Leitung' },
  { ab: 350, rang: 'Senior' },
  { ab: 175, rang: 'Profi' },
  { ab: 50, rang: 'Junior' },
  { ab: 0, rang: 'Praktikum' },
]

export function rangVon(xp: number): Rang {
  return STUFEN.find((s) => xp >= s.ab)?.rang ?? 'Praktikum'
}

/** XP bis zum nächsten Rang, für die Anzeige. */
export function bisNaechsterRang(xp: number): number | null {
  const hoeher = [...STUFEN].reverse().find((s) => s.ab > xp)
  return hoeher ? hoeher.ab - xp : null
}

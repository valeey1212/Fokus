import type { Keeper, Stammartikel } from '../types'

const EINKAUFSWOERTER = [
  'milch', 'brot', 'eier', 'butter', 'käse', 'obst', 'gemüse', 'kaufen',
  'einkaufen', 'einkaufsliste', 'klopapier', 'shampoo', 'waschmittel', 'zahnpasta',
  'seife', 'kaffee', 'tee', 'reis', 'nudeln',
]

const TERMINWOERTER = [
  'termin', 'anruf', 'anrufen', 'uhr', 'montag', 'dienstag', 'mittwoch', 'donnerstag',
  'freitag', 'samstag', 'sonntag', 'morgen', 'abgeben', 'bezahlen', 'rechnung',
  'frist', 'deadline', 'erinnern', 'zurückrufen',
]

export function zielVorschlagen(
  inhalt: string,
  stammartikel: Stammartikel[],
): NonNullable<Keeper['ziel']> {
  const text = inhalt.toLowerCase()

  const kennterArtikel = stammartikel.some((a) => text.includes(a.text.toLowerCase()))
  if (kennterArtikel || EINKAUFSWOERTER.some((w) => text.includes(w))) return 'einkauf'

  if (TERMINWOERTER.some((w) => text.includes(w))) return 'todo'

  return 'ablage'
}

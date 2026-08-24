import { ANFANGSZUSTAND, type Zustand } from '../types'

export function zustandAlsJson(zustand: Zustand): string {
  return JSON.stringify({ version: 1, exportiertAm: new Date().toISOString(), daten: zustand }, null, 2)
}

export function jsonDatenLadenUndAnbieten(zustand: Zustand): void {
  const json = zustandAlsJson(zustand)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const heute = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `fokus-sicherung-${heute}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export class ImportFehler extends Error {}

export function jsonZuZustand(text: string): Zustand {
  let geparst: unknown
  try {
    geparst = JSON.parse(text)
  } catch {
    throw new ImportFehler('Die Datei ist kein gültiges JSON.')
  }
  const daten =
    geparst && typeof geparst === 'object' && 'daten' in geparst
      ? (geparst as { daten: unknown }).daten
      : geparst

  if (!daten || typeof daten !== 'object') {
    throw new ImportFehler('Die Datei enthält keine gültigen Fokus-Daten.')
  }
  const d = daten as Partial<Zustand>
  return {
    keeper: Array.isArray(d.keeper) ? d.keeper : [],
    karten: Array.isArray(d.karten) ? d.karten : [],
    eintraege: Array.isArray(d.eintraege) ? d.eintraege : [],
    stammartikel: Array.isArray(d.stammartikel) ? d.stammartikel : [],
    sessions: Array.isArray(d.sessions) ? d.sessions : [],
    einstellungen: { ...ANFANGSZUSTAND.einstellungen, ...d.einstellungen },
  }
}

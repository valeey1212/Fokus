import type { Zustand } from '../typen'
import { ersetzeZustand, lies } from './speicher'

export function exportiere(): void {
  const daten = JSON.stringify(lies(), null, 2)
  const blob = new Blob([daten], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const heute = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `buero-sicherung-${heute}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importiere(datei: File): Promise<void> {
  const text = await datei.text()
  const daten = JSON.parse(text) as Zustand
  if (!daten || !Array.isArray(daten.mitarbeiter)) {
    throw new Error('Diese Datei sieht nicht nach einer Bürosicherung aus.')
  }
  ersetzeZustand(daten)
}

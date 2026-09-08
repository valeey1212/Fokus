import type { Werkzeugaufruf } from './werkzeuge'

/**
 * Modelle halten sich nicht immer an „nur JSON“. Deshalb großzügig auslesen:
 * Code-Zäune entfernen, erstes ausgewogenes Objekt suchen, sonst als Ergebnis werten.
 */
export function leseWerkzeugaufruf(roh: string): Werkzeugaufruf {
  const text = roh.trim()
  const ohneZaun = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/, '')
    .trim()

  const kandidat = ersterJsonBlock(ohneZaun)
  if (kandidat) {
    try {
      const daten = JSON.parse(kandidat) as Record<string, unknown>
      const werkzeug = typeof daten.werkzeug === 'string' ? daten.werkzeug : typeof daten.tool === 'string' ? daten.tool : ''
      if (werkzeug) {
        const eingabe =
          daten.eingabe && typeof daten.eingabe === 'object'
            ? (daten.eingabe as Record<string, unknown>)
            : daten.input && typeof daten.input === 'object'
              ? (daten.input as Record<string, unknown>)
              : {}
        return {
          werkzeug,
          eingabe,
          gedanke: typeof daten.gedanke === 'string' ? daten.gedanke : undefined,
        }
      }
    } catch {
      // fällt unten durch
    }
  }

  // Kein brauchbares JSON: Der Text ist offenbar schon die Antwort.
  return { werkzeug: 'fertig', eingabe: { ergebnis: text }, gedanke: 'Antwort ohne Werkzeugformat' }
}

function ersterJsonBlock(text: string): string | null {
  const start = text.indexOf('{')
  if (start < 0) return null
  let tiefe = 0
  let imString = false
  let maskiert = false
  for (let i = start; i < text.length; i++) {
    const c = text[i]
    if (imString) {
      if (maskiert) maskiert = false
      else if (c === '\\') maskiert = true
      else if (c === '"') imString = false
      continue
    }
    if (c === '"') imString = true
    else if (c === '{') tiefe++
    else if (c === '}') {
      tiefe--
      if (tiefe === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

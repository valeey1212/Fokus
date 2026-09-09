/**
 * Isometrische Bürodarstellung.
 *
 * Die Pixelgrafiken (Boden, Abteilungs-Einheiten, Figuren) liegen in
 * `public/assets/pixelbuero/` in ihrer nativen Auflösung von 1248×846.
 * Alles wird in diesem Koordinatenraum berechnet und dann als Prozentwert
 * relativ zur Bühne positioniert – so bleibt es CSS-only responsiv,
 * ohne dass eine ResizeObserver-Schleife den Maßstab nachführen muss.
 *
 * Herkunft der Maße: manifest.json der Pixel-Büro-Vorlage.
 */

export const FLOOR_BREITE = 1248
export const FLOOR_HOEHE = 846
export const SPALTEN = 12
export const REIHEN = 8

const KACHEL_BREITE = 60 // Halbbreite einer Rautenkachel
const KACHEL_HOEHE = 30
const URSPRUNG_X = 504
const URSPRUNG_Y = 180

/** Kachelkoordinate (Spalte, Reihe) → Bildpunkt im 1248×846-Raum. */
export function kachelZuPixel(spalte: number, reihe: number): [number, number] {
  return [URSPRUNG_X + (spalte - reihe) * KACHEL_BREITE, URSPRUNG_Y + (spalte + reihe) * KACHEL_HOEHE]
}

/** Für den umgekehrten Weg, z. B. bei Drag & Drop – aktuell ungenutzt, aber praktisch. */
export function pixelZuKachel(x: number, y: number): [number, number] {
  const dx = (x - URSPRUNG_X) / KACHEL_BREITE
  const dy = (y - URSPRUNG_Y) / KACHEL_HOEHE
  return [(dx + dy) / 2, (dy - dx) / 2]
}

export type Einheitstyp = 'design' | 'engineering' | 'sales' | 'marketing' | 'support'

export const EINHEITEN: Record<Einheitstyp, { name: string; datei: string; akzent: string }> = {
  design: { name: 'Design-Studio', datei: 'office-units/design-studio.png', akzent: '#a45bb8' },
  engineering: { name: 'Engineering-Lab', datei: 'office-units/engineering-lab.png', akzent: '#3a7ac0' },
  sales: { name: 'Sales-Office', datei: 'office-units/sales-office.png', akzent: '#c9822f' },
  marketing: { name: 'Marketing-Ecke', datei: 'office-units/marketing-corner.png', akzent: '#c9a72f' },
  support: { name: 'Support-Basis', datei: 'office-units/support-base.png', akzent: '#3f8a5a' },
}

/** Welche Abteilungs-Einheit zu welcher Rolle passt. Unbekannte Rollen landen in der Support-Basis. */
export function einheitFuerRolle(rolle: string): Einheitstyp {
  const r = rolle.toLowerCase()
  if (r.includes('text') || r.includes('design')) return 'design'
  if (r.includes('technik') || r.includes('entwick')) return 'engineering'
  if (r.includes('vertrieb') || r.includes('sales')) return 'sales'
  if (r.includes('recherche') || r.includes('projekt') || r.includes('marketing')) return 'marketing'
  return 'support'
}

/** Die sechs Stellflächen im Raum, je 3×2 Kacheln. */
export const STELLFLAECHEN: [number, number][] = [
  [0, 0],
  [4, 0],
  [8, 0],
  [0, 4],
  [4, 4],
  [8, 4],
]
export const EINHEIT_BREITE = 360
export const EINHEIT_HOEHE = 438
const EINHEIT_ANKER_X = 150
const EINHEIT_ANKER_Y = 228

export function einheitPosition(slotIndex: number) {
  const [sc, sr] = STELLFLAECHEN[slotIndex % STELLFLAECHEN.length]
  const [x, y] = kachelZuPixel(sc, sr)
  return { left: x - EINHEIT_ANKER_X, top: y - EINHEIT_ANKER_Y, z: 10 * (sc + sr) + 2 }
}

/** Sitzplätze innerhalb einer Einheit, in Kachel-Lokalkoordinaten (zwei Schreibtische nebeneinander). */
const SITZPLAETZE_LOKAL: [number, number][] = [
  [1.05, 1.55],
  [1.85, 1.8],
]

export function sitzplatz(slotIndex: number, platzInSlot: 0 | 1): [number, number] {
  const [sc, sr] = STELLFLAECHEN[slotIndex % STELLFLAECHEN.length]
  const [lc, lr] = SITZPLAETZE_LOKAL[platzInSlot]
  return [sc + lc, sr + lr]
}

export const FIGUR_BREITE = 48
export const FIGUR_HOEHE = 93

/** Figuren-Datei nach Aussehen-Index (0–9 → character-01…10.png). */
export function figurDatei(aussehen: number): string {
  const nr = (Math.abs(aussehen) % 10) + 1
  return `characters/character-${String(nr).padStart(2, '0')}.png`
}

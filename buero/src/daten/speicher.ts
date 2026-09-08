import { get, set } from 'idb-keyval'
import type { Zustand } from '../typen'
import { startZustand } from './vorlagen'

const SCHLUESSEL = 'buero-zustand'

let zustand: Zustand = startZustand()
let geladen = false
const hoerer = new Set<() => void>()
let schreibTimer: number | undefined

function melden() {
  for (const h of hoerer) h()
}

async function sichern() {
  try {
    await set(SCHLUESSEL, zustand)
  } catch (fehler) {
    console.warn('Speichern fehlgeschlagen', fehler)
  }
}

function sichernGebremst() {
  if (schreibTimer) window.clearTimeout(schreibTimer)
  schreibTimer = window.setTimeout(() => void sichern(), 250)
}

export async function ladeZustand(): Promise<void> {
  try {
    const gespeichert = await get<Zustand>(SCHLUESSEL)
    if (gespeichert && gespeichert.mitarbeiter) {
      // Fehlende Felder aus einer älteren Fassung ergänzen.
      zustand = { ...startZustand(), ...gespeichert, einstellungen: { ...startZustand().einstellungen, ...gespeichert.einstellungen } }
    }
  } catch (fehler) {
    console.warn('Laden fehlgeschlagen, starte leer', fehler)
  }
  geladen = true
  melden()
}

export function istGeladen(): boolean {
  return geladen
}

export function lies(): Zustand {
  return zustand
}

/** Einzige Schreibstelle: nimmt den alten Zustand und gibt den neuen zurück. */
export function aendere(fn: (alt: Zustand) => Zustand): void {
  zustand = fn(zustand)
  melden()
  sichernGebremst()
}

export function abonniere(fn: () => void): () => void {
  hoerer.add(fn)
  return () => hoerer.delete(fn)
}

export function ersetzeZustand(neu: Zustand): void {
  zustand = neu
  melden()
  void sichern()
}

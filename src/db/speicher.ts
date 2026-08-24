import { get, set } from 'idb-keyval'
import { ANFANGSZUSTAND, type Zustand } from '../types'

const SCHLUESSEL = 'fokus-zustand'

export async function zustandLaden(): Promise<Zustand> {
  const gespeichert = await get<Zustand>(SCHLUESSEL)
  if (!gespeichert) return ANFANGSZUSTAND
  // Fehlende Felder aus älteren Versionen mit Anfangswerten auffüllen.
  return {
    ...ANFANGSZUSTAND,
    ...gespeichert,
    einstellungen: { ...ANFANGSZUSTAND.einstellungen, ...gespeichert.einstellungen },
  }
}

export async function zustandSpeichern(zustand: Zustand): Promise<void> {
  await set(SCHLUESSEL, zustand)
}

import { useSyncExternalStore } from 'react'
import { abonniere, istGeladen, lies } from '../daten/speicher'
import type { Zustand } from '../typen'

export function useZustand(): Zustand {
  return useSyncExternalStore(abonniere, lies, lies)
}

export function useGeladen(): boolean {
  return useSyncExternalStore(abonniere, istGeladen, istGeladen)
}

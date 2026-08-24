import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'

export type Tab = 'jetzt' | 'board' | 'listen' | 'ablage'

export type Overlay =
  | { art: 'keeper' }
  | { art: 'sortier' }
  | { art: 'kartenAssistent'; vorbelegterTitel?: string; keeperId?: string }
  | { art: 'kartendetail'; karteId: string }
  | { art: 'fokus'; karteId: string }
  | { art: 'tausch'; karteId: string }
  | { art: 'einstellungen' }

type UiContextWert = {
  tab: Tab
  setTab: (tab: Tab) => void
  overlays: Overlay[]
  oeffne: (overlay: Overlay) => void
  schliesse: () => void
  schliesseAlle: () => void
}

const UiContext = createContext<UiContextWert | null>(null)

export function UiProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<Tab>('jetzt')
  const [overlays, setOverlays] = useState<Overlay[]>([])

  function oeffne(overlay: Overlay) {
    setOverlays((liste) => [...liste, overlay])
  }

  function schliesse() {
    setOverlays((liste) => liste.slice(0, -1))
  }

  function schliesseAlle() {
    setOverlays([])
  }

  return (
    <UiContext.Provider value={{ tab, setTab, overlays, oeffne, schliesse, schliesseAlle }}>
      {children}
    </UiContext.Provider>
  )
}

export function useUi() {
  const wert = useContext(UiContext)
  if (!wert) throw new Error('useUi muss innerhalb von UiProvider verwendet werden.')
  return wert
}

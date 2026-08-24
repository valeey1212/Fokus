import { createContext, useContext, useEffect, useReducer, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { zustandLaden, zustandSpeichern } from '../db/speicher'
import { ANFANGSZUSTAND, type Zustand } from '../types'
import type { Aktion } from './aktionen'
import { reducer } from './reducer'

type ZustandContextWert = {
  zustand: Zustand
  dispatch: React.Dispatch<Aktion>
  geladen: boolean
  heuteAbgelaufen: string[]
  heuteAbgelaufenAufgeloest: (karteId: string) => void
}

const ZustandContext = createContext<ZustandContextWert | null>(null)

export function ZustandProvider({ children }: { children: ReactNode }) {
  const [zustand, dispatch] = useReducer(reducer, ANFANGSZUSTAND)
  const [geladen, setGeladen] = useState(false)
  const [heuteAbgelaufen, setHeuteAbgelaufen] = useState<string[]>([])
  const ersterLauf = useRef(true)

  useEffect(() => {
    zustandLaden().then((geladenerZustand) => {
      dispatch({ typ: 'ZUSTAND_ERSETZT', zustand: geladenerZustand })

      const jetzt = new Date()
      const abgelaufen = geladenerZustand.karten.filter(
        (k) => k.spalte === 'aktiv' && k.heuteBis && new Date(k.heuteBis) <= jetzt,
      )
      abgelaufen.forEach((k) => dispatch({ typ: 'HEUTE_PLATZ_ABGELAUFEN', id: k.id }))
      if (abgelaufen.length > 0) setHeuteAbgelaufen(abgelaufen.map((k) => k.id))

      setGeladen(true)
    })
  }, [])

  useEffect(() => {
    if (!geladen) return
    if (ersterLauf.current) {
      ersterLauf.current = false
      return
    }
    zustandSpeichern(zustand)
  }, [zustand, geladen])

  function heuteAbgelaufenAufgeloest(karteId: string) {
    setHeuteAbgelaufen((liste) => liste.filter((id) => id !== karteId))
  }

  return (
    <ZustandContext.Provider value={{ zustand, dispatch, geladen, heuteAbgelaufen, heuteAbgelaufenAufgeloest }}>
      {children}
    </ZustandContext.Provider>
  )
}

export function useZustand() {
  const wert = useContext(ZustandContext)
  if (!wert) throw new Error('useZustand muss innerhalb von ZustandProvider verwendet werden.')
  return wert
}

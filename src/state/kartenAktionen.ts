import { useZustand } from './ZustandContext'
import { useUi } from './UiContext'

export function useKartenAktionen() {
  const { zustand, dispatch } = useZustand()
  const { oeffne } = useUi()

  const hauptplatzKarten = zustand.karten.filter((k) => k.spalte === 'aktiv' && !k.heuteBis)
  const heutePlatzKarte = zustand.karten.find((k) => k.spalte === 'aktiv' && k.heuteBis)

  function aktiviere(karteId: string) {
    if (hauptplatzKarten.length < zustand.einstellungen.plaetze) {
      dispatch({ typ: 'KARTE_AKTIVIERT', id: karteId })
    } else {
      oeffne({ art: 'tausch', karteId })
    }
  }

  function parken(karteId: string) {
    dispatch({ typ: 'KARTE_GEPARKT', id: karteId })
  }

  function abschliessen(karteId: string) {
    dispatch({ typ: 'KARTE_ABGESCHLOSSEN', id: karteId })
  }

  function loeschen(karteId: string) {
    dispatch({ typ: 'KARTE_GELOESCHT', id: karteId })
  }

  return { hauptplatzKarten, heutePlatzKarte, aktiviere, parken, abschliessen, loeschen }
}

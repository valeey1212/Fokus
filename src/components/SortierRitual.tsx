import { useEffect } from 'react'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import type { Keeper } from '../types'
import { zielVorschlagen } from '../utils/sortierRegeln'
import './SortierRitual.css'

const ZIEL_LABEL: Record<NonNullable<Keeper['ziel']>, string> = {
  board: 'Board',
  todo: 'To-do',
  einkauf: 'Einkauf',
  ablage: 'Ablage',
}

export function SortierRitual() {
  const { zustand, dispatch } = useZustand()
  const { schliesse, oeffne } = useUi()

  const offene = zustand.keeper
    .filter((k) => k.status === 'offen')
    .sort((a, b) => new Date(a.erstelltAm).getTime() - new Date(b.erstelltAm).getTime())

  const aktuell = offene[0]

  useEffect(() => {
    if (!aktuell) schliesse()
  }, [aktuell, schliesse])

  if (!aktuell) return null

  const vorschlag = zielVorschlagen(aktuell.inhalt, zustand.stammartikel)
  const weitereZiele = (['board', 'todo', 'einkauf', 'ablage'] as const).filter((z) => z !== vorschlag)

  function zuZiel(ziel: NonNullable<Keeper['ziel']>) {
    if (ziel === 'board') {
      oeffne({ art: 'kartenAssistent', vorbelegterTitel: aktuell.inhalt, keeperId: aktuell.id })
      return
    }
    dispatch({ typ: 'KEEPER_SORTIERT', id: aktuell.id, ziel })
  }

  function loeschen() {
    dispatch({ typ: 'KEEPER_GELOESCHT', id: aktuell.id })
  }

  return (
    <div className="vollbild sortier-ritual">
      <div className="sortier-ritual-kopf">
        <button className="button-text" onClick={schliesse}>
          Fertig für jetzt
        </button>
        <span className="mono sortier-ritual-zaehler">{offene.length} übrig</span>
      </div>

      <div className="sortier-ritual-karte">
        <p className="sortier-ritual-text">{aktuell.inhalt}</p>
      </div>

      <div className="sortier-ritual-ziele">
        <button className="button-primaer sortier-ritual-hauptziel" onClick={() => zuZiel(vorschlag)}>
          {ZIEL_LABEL[vorschlag]}
        </button>
        <div className="sortier-ritual-nebenziele">
          {weitereZiele.map((z) => (
            <button key={z} className="button-sekundaer" onClick={() => zuZiel(z)}>
              {ZIEL_LABEL[z]}
            </button>
          ))}
          <button className="button-sekundaer" onClick={loeschen}>
            Löschen
          </button>
        </div>
      </div>
    </div>
  )
}

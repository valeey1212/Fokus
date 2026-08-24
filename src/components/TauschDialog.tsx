import { useState } from 'react'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import { Punkte } from './Punkte'
import './TauschDialog.css'

type Phase = 'wahl' | 'karte-waehlen' | 'wohin'

export function TauschDialog({ karteId }: { karteId: string }) {
  const { zustand, dispatch } = useZustand()
  const { schliesse } = useUi()
  const [phase, setPhase] = useState<Phase>('wahl')
  const [hinausId, setHinausId] = useState<string | null>(null)

  const neueKarte = zustand.karten.find((k) => k.id === karteId)
  const hauptplatzKarten = zustand.karten.filter((k) => k.spalte === 'aktiv' && !k.heuteBis)
  const heutePlatzBelegt = zustand.karten.some((k) => k.spalte === 'aktiv' && k.heuteBis)
  const hinausKarte = zustand.karten.find((k) => k.id === hinausId)

  if (!neueKarte) return null

  function nurFuerHeute() {
    dispatch({ typ: 'KARTE_AKTIVIERT', id: karteId, nurHeute: true })
    schliesse()
  }

  function wohin(ziel: 'naechstes' | 'ablage') {
    if (!hinausId) return
    dispatch({ typ: 'KARTE_GETAUSCHT', hineinId: karteId, hinausId, hinausWohin: ziel })
    schliesse()
  }

  return (
    <div className="vollbild tausch-dialog">
      <div className="tausch-dialog-kopf">
        <button className="button-text" onClick={schliesse}>
          Abbrechen
        </button>
      </div>

      <div className="tausch-dialog-inhalt">
        {phase === 'wahl' && (
          <>
            <h2>Alle Plätze sind belegt.</h2>
            <p className="tausch-dialog-hinweis">„{neueKarte.titel}" möchtest du aktivieren.</p>
            <button className="button-primaer" onClick={() => setPhase('karte-waehlen')}>
              Platz tauschen
            </button>
            {!heutePlatzBelegt && (
              <button className="button-sekundaer" onClick={nurFuerHeute}>
                Nur für heute
              </button>
            )}
          </>
        )}

        {phase === 'karte-waehlen' && (
          <>
            <h2>Welchen Platz tauschen?</h2>
            <ul className="tausch-dialog-liste">
              {hauptplatzKarten.map((k) => (
                <li key={k.id}>
                  <button
                    className="tausch-dialog-karte"
                    onClick={() => {
                      setHinausId(k.id)
                      setPhase('wohin')
                    }}
                  >
                    <span className="tausch-dialog-karte-titel">{k.titel}</span>
                    <Punkte schritte={k.schritte} />
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {phase === 'wohin' && hinausKarte && (
          <>
            <h2>Wohin mit „{hinausKarte.titel}"?</h2>
            <p className="tausch-dialog-hinweis">
              Der Fortschritt bleibt erhalten (
              {hinausKarte.schritte.filter((s) => s.erledigtAm).length} von {hinausKarte.schritte.length} Schritten).
            </p>
            <button className="button-primaer" onClick={() => wohin('naechstes')}>
              Als Nächstes
            </button>
            <button className="button-sekundaer" onClick={() => wohin('ablage')}>
              In die Ablage
            </button>
          </>
        )}
      </div>
    </div>
  )
}

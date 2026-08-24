import { useState } from 'react'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import { useKartenAktionen } from '../state/kartenAktionen'
import { tageSeit } from '../utils/datum'
import { Punkte } from './Punkte'
import { TerminChip } from './TerminChip'
import type { Karte } from '../types'

export function AktivePlatzKarte({ karte }: { karte: Karte }) {
  const { dispatch } = useZustand()
  const { oeffne } = useUi()
  const { parken } = useKartenAktionen()
  const [erneuerungOffen, setErneuerungOffen] = useState(false)

  const aktuellerSchritt = karte.schritte.find((s) => !s.erledigtAm)
  const baseline = [karte.letzteSessionAm, karte.aktivSeit, karte.erneuerungBestaetigtAm]
    .filter((d): d is string => !!d)
    .sort()
    .at(-1)
  const tageOhneSession = baseline ? tageSeit(baseline) : 0
  const zeigeErneuerung = !karte.heuteBis && tageOhneSession >= 7

  return (
    <div className="karte aktive-platz-karte">
      <button className="aktive-platz-karte-hauptbereich" onClick={() => oeffne({ art: 'kartendetail', karteId: karte.id })}>
        <div className="aktive-platz-karte-kopf">
          <span className="aktive-platz-karte-titel">{karte.titel}</span>
          {karte.heuteBis && <span className="chip chip-wunsch">nur heute</span>}
        </div>
        {aktuellerSchritt && <p className="aktive-platz-karte-schritt">{aktuellerSchritt.text}</p>}
        <div className="aktive-platz-karte-fuss">
          <Punkte schritte={karte.schritte} />
          <TerminChip frist={karte.frist} wunschtermin={karte.wunschtermin} />
        </div>
      </button>

      {zeigeErneuerung && (
        <div className="aktive-platz-karte-erneuerung">
          {!erneuerungOffen ? (
            <p>
              Seit {tageOhneSession} Tagen keine Session.{' '}
              <button className="aktive-platz-karte-ansehen" onClick={() => setErneuerungOffen(true)}>
                Ansehen
              </button>
            </p>
          ) : (
            <div className="aktive-platz-karte-erneuerung-optionen">
              <button
                className="button-sekundaer"
                onClick={() => {
                  dispatch({
                    typ: 'KARTE_AKTUALISIERT',
                    id: karte.id,
                    patch: { erneuerungBestaetigtAm: new Date().toISOString() },
                  })
                  setErneuerungOffen(false)
                }}
              >
                Aktiv lassen
              </button>
              <button
                className="button-sekundaer"
                onClick={() => oeffne({ art: 'kartendetail', karteId: karte.id })}
              >
                Schritt kleiner machen
              </button>
              <button className="button-sekundaer" onClick={() => parken(karte.id)}>
                Parken
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

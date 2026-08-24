import { useEffect, useRef, useState } from 'react'
import { neueId } from '../utils/id'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import type { Karte } from '../types'
import './KartenAssistent.css'

const MAX_SCHRITTE = 7

type Termin = 'keiner' | 'wunsch' | 'frist'

export function KartenAssistent({
  vorbelegterTitel,
  keeperId,
}: {
  vorbelegterTitel?: string
  keeperId?: string
}) {
  const { dispatch } = useZustand()
  const { schliesse } = useUi()

  const [schritt, setSchritt] = useState(0)
  const [titel, setTitel] = useState(vorbelegterTitel ?? '')
  const [fertigWenn, setFertigWenn] = useState('')
  const [ersterSchritt, setErsterSchritt] = useState('')
  const [weitereSchritte, setWeitereSchritte] = useState<string[]>([])
  const [termin, setTermin] = useState<Termin>('keiner')
  const [terminDatum, setTerminDatum] = useState('')

  const feldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    feldRef.current?.focus()
  }, [schritt])

  const gesamtSchritte = 1 + weitereSchritte.filter((s) => s.trim()).length
  const kannWeiter =
    (schritt === 0 && titel.trim().length > 0) ||
    (schritt === 2 && ersterSchritt.trim().length > 0) ||
    schritt === 1 ||
    schritt === 3 ||
    schritt === 4

  function weiter() {
    if (schritt < 4) {
      setSchritt(schritt + 1)
    } else {
      fertigstellen()
    }
  }

  function zurueck() {
    if (schritt > 0) setSchritt(schritt - 1)
  }

  function fertigstellen() {
    const jetzt = new Date().toISOString()
    const karte: Karte = {
      id: neueId(),
      titel: titel.trim(),
      fertigWenn: fertigWenn.trim(),
      spalte: 'naechstes',
      schritte: [
        { id: neueId(), text: ersterSchritt.trim(), erledigtAm: null },
        ...weitereSchritte
          .filter((s) => s.trim())
          .map((s) => ({ id: neueId(), text: s.trim(), erledigtAm: null })),
      ],
      wunschtermin: termin === 'wunsch' && terminDatum ? terminDatum : null,
      frist: termin === 'frist' && terminDatum ? terminDatum : null,
      letzteSessionAm: null,
      uebergangen: 0,
      erstelltAm: jetzt,
      abgeschlossenAm: null,
      erneuerungBestaetigtAm: null,
    }
    dispatch({ typ: 'KARTE_ANGELEGT', karte })
    if (keeperId) {
      dispatch({ typ: 'KEEPER_SORTIERT', id: keeperId, ziel: 'board', zielId: karte.id })
    }
    schliesse()
  }

  function schrittAendern(index: number, text: string) {
    setWeitereSchritte((liste) => liste.map((s, i) => (i === index ? text : s)))
  }

  function schrittEntfernen(index: number) {
    setWeitereSchritte((liste) => liste.filter((_, i) => i !== index))
  }

  return (
    <div className="vollbild karten-assistent">
      <div className="karten-assistent-kopf">
        <button className="button-text" onClick={schliesse}>
          Abbrechen
        </button>
        <span className="mono karten-assistent-schritt">{schritt + 1}/5</span>
      </div>

      <div className="karten-assistent-inhalt">
        {schritt === 0 && (
          <>
            <h2>Wie heißt es?</h2>
            <input
              ref={feldRef}
              className="karten-assistent-feld"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="Titel"
            />
          </>
        )}

        {schritt === 1 && (
          <>
            <h2>Woran merkst du, dass es fertig ist?</h2>
            <input
              ref={feldRef}
              className="karten-assistent-feld"
              value={fertigWenn}
              onChange={(e) => setFertigWenn(e.target.value)}
              placeholder="Optional"
            />
          </>
        )}

        {schritt === 2 && (
          <>
            <h2>Erster Schritt, konkret, unter 15 Minuten</h2>
            <p className="karten-assistent-hilfstext">
              Nicht „Konzept entwickeln", sondern etwas, das du sofort tun könntest.
            </p>
            <input
              ref={feldRef}
              className="karten-assistent-feld"
              value={ersterSchritt}
              onChange={(e) => setErsterSchritt(e.target.value)}
              placeholder="Erster Schritt"
            />
          </>
        )}

        {schritt === 3 && (
          <>
            <h2>Weitere Schritte</h2>
            <ul className="karten-assistent-schritte-liste">
              {weitereSchritte.map((s, i) => (
                <li key={i} className="karten-assistent-schritt-zeile">
                  <input
                    className="karten-assistent-feld"
                    value={s}
                    onChange={(e) => schrittAendern(i, e.target.value)}
                  />
                  <button className="button-text" onClick={() => schrittEntfernen(i)} aria-label="Entfernen">
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            {gesamtSchritte < MAX_SCHRITTE ? (
              <button
                className="button-sekundaer"
                onClick={() => setWeitereSchritte((liste) => [...liste, ''])}
              >
                + Schritt hinzufügen
              </button>
            ) : (
              <p className="karten-assistent-hilfstext">Sieben Schritte. Mehr wären vermutlich zwei Karten.</p>
            )}
          </>
        )}

        {schritt === 4 && (
          <>
            <h2>Termin</h2>
            <div className="karten-assistent-termin-optionen">
              <button
                className={`button-sekundaer ${termin === 'keiner' ? 'aktiv' : ''}`}
                onClick={() => setTermin('keiner')}
              >
                Keiner
              </button>
              <button
                className={`button-sekundaer ${termin === 'wunsch' ? 'aktiv' : ''}`}
                onClick={() => setTermin('wunsch')}
              >
                Wunschtermin
              </button>
              <button
                className={`button-sekundaer ${termin === 'frist' ? 'aktiv' : ''}`}
                onClick={() => setTermin('frist')}
              >
                Feste Frist
              </button>
            </div>
            {termin !== 'keiner' && (
              <input
                type="date"
                className="karten-assistent-feld"
                value={terminDatum}
                onChange={(e) => setTerminDatum(e.target.value)}
              />
            )}
          </>
        )}
      </div>

      <div className="karten-assistent-fuss">
        <button className="button-text" onClick={zurueck} disabled={schritt === 0}>
          Zurück
        </button>
        {(schritt === 1 || schritt === 3) && (
          <button className="button-text" onClick={weiter}>
            Überspringen
          </button>
        )}
        <button className="button-primaer" onClick={weiter} disabled={!kannWeiter}>
          {schritt === 4 ? 'Karte anlegen' : 'Weiter'}
        </button>
      </div>
    </div>
  )
}

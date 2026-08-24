import { useState } from 'react'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import { useKartenAktionen } from '../state/kartenAktionen'
import type { Karte } from '../types'
import { Punkte } from './Punkte'
import './Kartendetail.css'

const MAX_SCHRITTE = 7

export function Kartendetail({ karteId }: { karteId: string }) {
  const { zustand, dispatch } = useZustand()
  const { schliesse, oeffne } = useUi()
  const { aktiviere, parken, abschliessen, loeschen } = useKartenAktionen()
  const [neuerSchritt, setNeuerSchritt] = useState('')
  const [loeschenBestaetigen, setLoeschenBestaetigen] = useState(false)

  const karte = zustand.karten.find((k) => k.id === karteId)
  if (!karte) return null

  function schrittHinzufuegen() {
    if (!neuerSchritt.trim()) return
    dispatch({ typ: 'SCHRITT_HINZUGEFUEGT', karteId, text: neuerSchritt })
    setNeuerSchritt('')
  }

  function feldAendern(patch: Partial<Karte>) {
    dispatch({ typ: 'KARTE_AKTUALISIERT', id: karteId, patch })
  }

  return (
    <div className="vollbild kartendetail">
      <div className="kartendetail-kopf">
        <button className="button-text" onClick={schliesse}>
          Zurück
        </button>
        {loeschenBestaetigen ? (
          <div className="kartendetail-loeschen-bestaetigen">
            <button className="button-text" onClick={() => setLoeschenBestaetigen(false)}>
              Doch nicht
            </button>
            <button
              className="button-text"
              onClick={() => {
                loeschen(karteId)
                schliesse()
              }}
            >
              Wirklich löschen
            </button>
          </div>
        ) : (
          <button className="button-text" onClick={() => setLoeschenBestaetigen(true)}>
            Löschen
          </button>
        )}
      </div>

      <div className="kartendetail-inhalt">
        <input
          className="kartendetail-titel"
          value={karte.titel}
          onChange={(e) => feldAendern({ titel: e.target.value })}
        />

        <div className="kartendetail-feld-gruppe">
          <label className="kartendetail-label">Woran merkst du, dass es fertig ist?</label>
          <input
            className="kartendetail-feld"
            value={karte.fertigWenn}
            onChange={(e) => feldAendern({ fertigWenn: e.target.value })}
            placeholder="Optional"
          />
        </div>

        <div className="kartendetail-feld-gruppe">
          <div className="kartendetail-label-zeile">
            <label className="kartendetail-label">Pfad</label>
            <Punkte schritte={karte.schritte} />
          </div>
          <ul className="kartendetail-schritte">
            {karte.schritte.map((s) => (
              <li key={s.id} className="kartendetail-schritt">
                <button
                  className={`kartendetail-checkbox ${s.erledigtAm ? 'erledigt' : ''}`}
                  onClick={() => dispatch({ typ: 'SCHRITT_UMGESCHALTET', karteId, schrittId: s.id })}
                  aria-label={s.erledigtAm ? 'Als offen markieren' : 'Als erledigt markieren'}
                />
                <input
                  className="kartendetail-schritt-text"
                  value={s.text}
                  onChange={(e) => {
                    const schritte = karte.schritte.map((x) =>
                      x.id === s.id ? { ...x, text: e.target.value } : x,
                    )
                    feldAendern({ schritte })
                  }}
                />
              </li>
            ))}
          </ul>
          {karte.schritte.length < MAX_SCHRITTE ? (
            <div className="kartendetail-schritt-hinzufuegen">
              <input
                className="kartendetail-feld"
                placeholder="Weiterer Schritt"
                value={neuerSchritt}
                onChange={(e) => setNeuerSchritt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && schrittHinzufuegen()}
              />
              <button className="button-sekundaer" onClick={schrittHinzufuegen}>
                Hinzufügen
              </button>
            </div>
          ) : (
            <p className="kartendetail-hilfstext">Sieben Schritte. Mehr wären vermutlich zwei Karten.</p>
          )}
        </div>

        <div className="kartendetail-feld-gruppe">
          <label className="kartendetail-label">Termin</label>
          <div className="kartendetail-termin-zeile">
            <div>
              <span className="kartendetail-termin-label">Wunschtermin</span>
              <input
                type="date"
                className="kartendetail-feld"
                value={karte.wunschtermin ?? ''}
                onChange={(e) => feldAendern({ wunschtermin: e.target.value || null })}
              />
            </div>
            <div>
              <span className="kartendetail-termin-label">Feste Frist</span>
              <input
                type="date"
                className="kartendetail-feld"
                value={karte.frist ?? ''}
                onChange={(e) => feldAendern({ frist: e.target.value || null })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="kartendetail-fuss">
        {karte.spalte === 'aktiv' ? (
          <>
            <button className="button-primaer" onClick={() => oeffne({ art: 'fokus', karteId })}>
              Fokus starten
            </button>
            <button
              className="button-sekundaer"
              onClick={() => {
                parken(karteId)
                schliesse()
              }}
            >
              Parken
            </button>
          </>
        ) : (
          <button className="button-primaer" onClick={() => aktiviere(karteId)}>
            Aktivieren
          </button>
        )}
        {karte.spalte !== 'fertig' && (
          <button
            className="button-sekundaer"
            onClick={() => {
              abschliessen(karteId)
              schliesse()
            }}
          >
            Abschließen
          </button>
        )}
      </div>
    </div>
  )
}

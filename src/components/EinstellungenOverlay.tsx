import { useRef, useState } from 'react'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import { jsonDatenLadenUndAnbieten, jsonZuZustand, ImportFehler } from '../db/exportImport'
import type { Zustand } from '../types'
import './EinstellungenOverlay.css'

export function EinstellungenOverlay() {
  const { zustand, dispatch } = useZustand()
  const { schliesse } = useUi()
  const dateiRef = useRef<HTMLInputElement>(null)
  const [fehler, setFehler] = useState<string | null>(null)
  const [importVorschau, setImportVorschau] = useState<Zustand | null>(null)

  function exportieren() {
    jsonDatenLadenUndAnbieten(zustand)
  }

  function dateiAusgewaehlt(e: React.ChangeEvent<HTMLInputElement>) {
    const datei = e.target.files?.[0]
    if (!datei) return
    setFehler(null)
    datei.text().then((text) => {
      try {
        setImportVorschau(jsonZuZustand(text))
      } catch (err) {
        setFehler(err instanceof ImportFehler ? err.message : 'Die Datei konnte nicht gelesen werden.')
      }
    })
    e.target.value = ''
  }

  function importBestaetigen() {
    if (!importVorschau) return
    dispatch({ typ: 'ZUSTAND_ERSETZT', zustand: importVorschau })
    setImportVorschau(null)
  }

  return (
    <div className="vollbild einstellungen-overlay">
      <div className="einstellungen-overlay-kopf">
        <button className="button-text" onClick={schliesse}>
          Zurück
        </button>
        <h1>Einstellungen</h1>
      </div>

      <div className="einstellungen-overlay-inhalt">
        <section className="einstellungen-abschnitt">
          <h2>Sicherung</h2>
          <p className="einstellungen-hinweis">
            Alle Daten liegen nur auf diesem Gerät. Ein Export ist die einzige Absicherung gegen Datenverlust.
          </p>
          <button className="button-primaer" onClick={exportieren}>
            Als Datei sichern
          </button>
          <button className="button-sekundaer" onClick={() => dateiRef.current?.click()}>
            Aus Datei wiederherstellen
          </button>
          <input
            ref={dateiRef}
            type="file"
            accept="application/json"
            className="einstellungen-datei-input"
            onChange={dateiAusgewaehlt}
          />
          {fehler && <p className="einstellungen-fehler">{fehler}</p>}
        </section>
      </div>

      {importVorschau && (
        <div className="vollbild einstellungen-import-bestaetigung">
          <div className="einstellungen-import-bestaetigung-inhalt">
            <h2>Daten wiederherstellen?</h2>
            <p>
              {importVorschau.karten.length} Karten, {importVorschau.eintraege.length} Listeneinträge und{' '}
              {importVorschau.keeper.length} Notizen aus der Datei ersetzen die aktuellen Daten auf diesem Gerät.
            </p>
            <button className="button-primaer" onClick={importBestaetigen}>
              Ersetzen
            </button>
            <button className="button-sekundaer" onClick={() => setImportVorschau(null)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

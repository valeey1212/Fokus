import { useState } from 'react'
import type { Zustand } from '../typen'
import { aendereEinstellungen } from '../daten/aktionen'
import { exportiere, importiere } from '../daten/exportImport'

type Props = { zustand: Zustand }

export function Einstellungen({ zustand }: Props) {
  const e = zustand.einstellungen
  const [brueckeStand, setBrueckeStand] = useState<string | null>(null)
  const [meldung, setMeldung] = useState<string | null>(null)

  const pruefeBruecke = async () => {
    setBrueckeStand('prüfe …')
    try {
      const antwort = await fetch(`${e.brueckeUrl.replace(/\/$/, '')}/api/status`)
      const daten = (await antwort.json()) as { bereit?: boolean; modus?: string; hinweis?: string }
      setBrueckeStand(daten.bereit ? `verbunden (${daten.modus ?? 'Abo'})` : (daten.hinweis ?? 'erreichbar, aber nicht bereit'))
    } catch {
      setBrueckeStand('nicht erreichbar')
    }
  }

  return (
    <div>
      <h1>Setup</h1>

      <div className="karte">
        <h2>Firma</h2>
        <label>
          <span>Name</span>
          <input value={e.firma} onChange={(ev) => aendereEinstellungen({ firma: ev.target.value })} />
        </label>
      </div>

      <div className="karte">
        <h2>Anthropic-API</h2>
        <p className="leise">
          Gilt für alle Mitarbeiter im Modus „API“, sofern sie keinen eigenen Schlüssel haben. Der Schlüssel bleibt auf
          diesem Gerät und geht nur an api.anthropic.com.
        </p>
        <label>
          <span>Schlüssel</span>
          <input
            type="password"
            value={e.anthropicSchluessel}
            placeholder="sk-ant-…"
            onChange={(ev) => aendereEinstellungen({ anthropicSchluessel: ev.target.value })}
          />
        </label>
      </div>

      <div className="karte">
        <h2>Kostenlose Modelle</h2>
        <p className="leise">Für kleine Aufgaben. Jeder OpenAI-kompatible Anbieter geht, z. B. OpenRouter.</p>
        <label>
          <span>Endpunkt</span>
          <input value={e.freieBasisUrl} onChange={(ev) => aendereEinstellungen({ freieBasisUrl: ev.target.value })} />
        </label>
        <label>
          <span>Schlüssel</span>
          <input
            type="password"
            value={e.freierSchluessel}
            onChange={(ev) => aendereEinstellungen({ freierSchluessel: ev.target.value })}
          />
        </label>
        <label>
          <span>Standardmodell</span>
          <input
            value={e.freiesStandardmodell}
            onChange={(ev) => aendereEinstellungen({ freiesStandardmodell: ev.target.value })}
          />
        </label>
      </div>

      <div className="karte">
        <h2>Abo-Brücke</h2>
        <p className="leise">
          Damit Mitarbeiter über dein Claude-Abo laufen, muss auf deinem Rechner das kleine Programm aus
          <code> buero/bruecke</code> laufen. Vom iPhone allein geht der Abo-Modus nicht – dort nimm API oder ein
          kostenloses Modell.
        </p>
        <label>
          <span>Adresse</span>
          <input value={e.brueckeUrl} onChange={(ev) => aendereEinstellungen({ brueckeUrl: ev.target.value })} />
        </label>
        <button type="button" onClick={() => void pruefeBruecke()}>
          Verbindung prüfen
        </button>
        {brueckeStand && <p className="leise">Status: {brueckeStand}</p>}
      </div>

      <div className="karte">
        <h2>Bürotakt</h2>
        <label>
          <span>Gleichzeitig arbeitende Agenten: {e.gleichzeitig}</span>
          <input
            type="range"
            min={1}
            max={5}
            value={e.gleichzeitig}
            onChange={(ev) => aendereEinstellungen({ gleichzeitig: Number(ev.target.value) })}
          />
        </label>
        <label>
          <span>Werkzeugschritte pro Aufgabe: {e.maxSchritte}</span>
          <input
            type="range"
            min={4}
            max={30}
            value={e.maxSchritte}
            onChange={(ev) => aendereEinstellungen({ maxSchritte: Number(ev.target.value) })}
          />
        </label>
      </div>

      <div className="karte">
        <h2>Sicherung</h2>
        <p className="leise">Alles liegt lokal. Ohne Export ist es beim Löschen der Website weg.</p>
        <div className="zeile">
          <button type="button" onClick={exportiere}>
            Exportieren
          </button>
          <label
            className="datei-knopf"
            style={{ margin: 0 }}
          >
            <span style={{ display: 'none' }}>Datei</span>
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(ev) => {
                const datei = ev.target.files?.[0]
                if (!datei) return
                importiere(datei)
                  .then(() => setMeldung('Sicherung eingespielt.'))
                  .catch((f: Error) => setMeldung(f.message))
              }}
            />
            Importieren
          </label>
        </div>
        {meldung && <p className="leise">{meldung}</p>}
      </div>
    </div>
  )
}

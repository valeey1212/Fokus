import { useState } from 'react'
import type { Ressource, Ressourcenart, Zustand } from '../typen'
import { aendereRessource, legeRessourceAn, loescheDatei, loescheRessource, schreibeDatei } from '../daten/aktionen'
import { Dialog } from '../komponenten/Dialog'
import { datumZeit } from '../utils/zeit'

type Props = { zustand: Zustand }

const ARTEN: { art: Ressourcenart; text: string }[] = [
  { art: 'ordner', text: 'Ordner' },
  { art: 'email', text: 'Postfach' },
  { art: 'kalender', text: 'Kalender' },
  { art: 'notizen', text: 'Notizen' },
]

export function Ressourcen({ zustand }: Props) {
  const [offen, setOffen] = useState<string | null>(null)
  const [neu, setNeu] = useState(false)

  const ressource = zustand.ressourcen.find((r) => r.id === offen)

  return (
    <div>
      <div className="kopfzeile">
        <h1>Ordner & Programme</h1>
        <button type="button" className="klein" onClick={() => setNeu(true)}>
          + Neu
        </button>
      </div>
      <p className="leise">
        Alles hier liegt lokal auf diesem Gerät. Mitarbeiter sehen nur, was du ihnen zuweist.
      </p>

      <div className="liste">
        {zustand.ressourcen.map((r) => (
          <button key={r.id} type="button" className="karte person-zeile" onClick={() => setOffen(r.id)}>
            <span>
              <b>{r.name}</b> <span className="marke">{r.art}</span>
            </span>
            <span className="leise">
              {r.dateien.length} Einträge · Zugriff:{' '}
              {zustand.mitarbeiter
                .filter((m) => m.ressourcen.includes(r.id))
                .map((m) => m.name)
                .join(', ') || 'niemand'}
            </span>
          </button>
        ))}
      </div>

      {ressource && <RessourcenDialog ressource={ressource} schliessen={() => setOffen(null)} />}
      {neu && <NeueRessource schliessen={() => setNeu(false)} />}
    </div>
  )
}

function NeueRessource({ schliessen }: { schliessen: () => void }) {
  const [name, setName] = useState('')
  const [art, setArt] = useState<Ressourcenart>('ordner')
  const [beschreibung, setBeschreibung] = useState('')

  return (
    <Dialog titel="Neuer Ordner" schliessen={schliessen}>
      <label>
        <span>Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Rechnungen 2026" />
      </label>
      <label>
        <span>Art</span>
        <select value={art} onChange={(e) => setArt(e.target.value as Ressourcenart)}>
          {ARTEN.map((a) => (
            <option key={a.art} value={a.art}>
              {a.text}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Wofür ist das? (sieht der Agent)</span>
        <textarea value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} rows={3} />
      </label>
      <button
        type="button"
        className="haupt"
        disabled={!name.trim()}
        onClick={() => {
          legeRessourceAn(art, name.trim(), beschreibung.trim())
          schliessen()
        }}
      >
        Anlegen
      </button>
    </Dialog>
  )
}

function RessourcenDialog({ ressource, schliessen }: { ressource: Ressource; schliessen: () => void }) {
  const [dateiName, setDateiName] = useState('')
  const [inhalt, setInhalt] = useState('')
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)

  const datei = ressource.dateien.find((d) => d.id === gewaehlt)

  return (
    <Dialog titel={ressource.name} schliessen={schliessen}>
      <p className="leise">{ressource.beschreibung}</p>

      <div className="zeile" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="klein"
          onClick={() => aendereRessource(ressource.id, { schreibrecht: !ressource.schreibrecht })}
        >
          {ressource.schreibrecht ? '☑' : '☐'} Agenten dürfen schreiben
        </button>
      </div>

      <h3 className="abschnitt-titel">Eintrag anlegen</h3>
      <label>
        <span>{ressource.art === 'email' ? 'Betreff' : 'Dateiname'}</span>
        <input value={dateiName} onChange={(e) => setDateiName(e.target.value)} />
      </label>
      <label>
        <span>Inhalt</span>
        <textarea value={inhalt} onChange={(e) => setInhalt(e.target.value)} rows={6} />
      </label>
      <button
        type="button"
        className="haupt"
        disabled={!dateiName.trim()}
        onClick={() => {
          schreibeDatei(ressource.id, dateiName.trim(), inhalt, null)
          setDateiName('')
          setInhalt('')
        }}
      >
        Ablegen
      </button>

      <h3 className="abschnitt-titel">Inhalt ({ressource.dateien.length})</h3>
      <div className="liste">
        {ressource.dateien.map((d) => (
          <div key={d.id} className="karte">
            <button
              type="button"
              className="person-zeile"
              style={{ background: 'transparent', border: 0, padding: 0, minHeight: 0 }}
              onClick={() => setGewaehlt(gewaehlt === d.id ? null : d.id)}
            >
              <b>{d.name}</b>
              <span className="leise">{datumZeit(d.geaendertAm)}</span>
            </button>
            {datei?.id === d.id && (
              <>
                <div className="ergebnisfeld" style={{ marginTop: 8, borderColor: 'var(--rahmen)' }}>
                  {d.inhalt || '(leer)'}
                </div>
                <div className="zeile" style={{ marginTop: 8 }}>
                  <button type="button" className="klein" onClick={() => void navigator.clipboard?.writeText(d.inhalt)}>
                    Kopieren
                  </button>
                  <button
                    type="button"
                    className="klein gefahr"
                    onClick={() => {
                      loescheDatei(ressource.id, d.id)
                      setGewaehlt(null)
                    }}
                  >
                    Löschen
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        {ressource.dateien.length === 0 && <p className="leise">Noch leer.</p>}
      </div>

      <h3 className="abschnitt-titel">Gefahrenzone</h3>
      <button
        type="button"
        className="gefahr"
        onClick={() => {
          loescheRessource(ressource.id)
          schliessen()
        }}
      >
        Ordner löschen
      </button>
    </Dialog>
  )
}

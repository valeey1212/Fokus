import { useState } from 'react'
import type { Zustand } from '../typen'
import { aendereMitarbeiter, entlasse, legeAufgabeAn, setzeStatus } from '../daten/aktionen'
import { bisNaechsterRang, rangVon } from '../spiel/rang'
import { Dialog } from './Dialog'
import { VerbindungFelder } from './VerbindungFelder'

type Props = { zustand: Zustand; mitarbeiterId: string; schliessen: () => void }

export function MitarbeiterDialog({ zustand, mitarbeiterId, schliessen }: Props) {
  const person = zustand.mitarbeiter.find((m) => m.id === mitarbeiterId)
  const [bearbeiten, setBearbeiten] = useState(false)
  const [auftrag, setAuftrag] = useState('')
  const [titel, setTitel] = useState('')

  if (!person) return null

  const meine = zustand.aufgaben.filter((a) => a.zugewiesenAn === person.id)
  const offen = meine.filter((a) => a.status !== 'erledigt' && a.status !== 'abgebrochen')
  const bisRang = bisNaechsterRang(person.xp)

  const geben = () => {
    if (!auftrag.trim()) return
    legeAufgabeAn(titel.trim() || auftrag.trim().slice(0, 40), auftrag.trim(), person.id)
    setAuftrag('')
    setTitel('')
    if (person.status === 'pause') setzeStatus(person.id, 'frei')
  }

  return (
    <Dialog titel={`${person.name} · ${person.rolle}`} schliessen={schliessen}>
      <div className="hud">
        <span>
          Rang <b>{rangVon(person.xp)}</b>
        </span>
        <span>
          XP <b>{person.xp}</b>
        </span>
        <span>
          Erledigt <b>{person.erledigt}</b>
        </span>
        <span>
          Status <b>{person.status}</b>
        </span>
      </div>
      {bisRang !== null && <p className="leise">Noch {bisRang} XP bis zum nächsten Rang.</p>}

      {person.status === 'pause' && (
        <div className="karte">
          <p>Steht seit einem Fehler still. Details stehen im Aufgabenprotokoll.</p>
          <button type="button" className="haupt" onClick={() => setzeStatus(person.id, 'frei')}>
            Wieder an die Arbeit
          </button>
        </div>
      )}

      <h3 className="abschnitt-titel">Aufgabe geben</h3>
      <label>
        <span>Titel (optional)</span>
        <input value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="Kurzer Titel" />
      </label>
      <label>
        <span>Auftrag – so genau wie du kannst</span>
        <textarea
          value={auftrag}
          onChange={(e) => setAuftrag(e.target.value)}
          placeholder="Woran erkennst du, dass es fertig ist?"
        />
      </label>
      <button type="button" className="haupt" onClick={geben} disabled={!auftrag.trim()}>
        Beauftragen
      </button>

      <h3 className="abschnitt-titel">Schreibtisch ({offen.length} offen)</h3>
      <div className="liste">
        {meine.slice(0, 6).map((a) => (
          <div key={a.id} className="karte">
            <span className={`marke ${a.status}`}>{a.status}</span> {a.titel}
          </div>
        ))}
        {meine.length === 0 && <p className="leise">Noch nichts zu tun.</p>}
      </div>

      <h3 className="abschnitt-titel">Profil und Anschluss</h3>
      {!bearbeiten ? (
        <>
          <p className="leise" style={{ whiteSpace: 'pre-wrap' }}>
            {person.profil}
          </p>
          <p className="leise">
            Anschluss: {person.verbindung.modus} · {person.verbindung.modell}
          </p>
          <p className="leise">
            Zugriff:{' '}
            {person.ressourcen
              .map((id) => zustand.ressourcen.find((r) => r.id === id)?.name)
              .filter(Boolean)
              .join(', ') || 'nichts'}
          </p>
          <div className="zeile">
            <button type="button" onClick={() => setBearbeiten(true)}>
              Ändern
            </button>
            <button
              type="button"
              className="gefahr"
              onClick={() => {
                entlasse(person.id)
                schliessen()
              }}
            >
              Entlassen
            </button>
          </div>
        </>
      ) : (
        <>
          <label>
            <span>Name</span>
            <input value={person.name} onChange={(e) => aendereMitarbeiter(person.id, { name: e.target.value })} />
          </label>
          <label>
            <span>Rolle</span>
            <input value={person.rolle} onChange={(e) => aendereMitarbeiter(person.id, { rolle: e.target.value })} />
          </label>
          <label>
            <span>Aufgabenprofil</span>
            <textarea
              value={person.profil}
              rows={8}
              onChange={(e) => aendereMitarbeiter(person.id, { profil: e.target.value })}
            />
          </label>

          <span className="leise">Zugriff auf</span>
          <div className="liste" style={{ margin: '6px 0 14px' }}>
            {zustand.ressourcen.map((r) => {
              const an = person.ressourcen.includes(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  className={an ? 'klein haupt' : 'klein'}
                  onClick={() =>
                    aendereMitarbeiter(person.id, {
                      ressourcen: an ? person.ressourcen.filter((x) => x !== r.id) : [...person.ressourcen, r.id],
                    })
                  }
                >
                  {an ? '☑ ' : '☐ '}
                  {r.name} ({r.art})
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className={person.darfDelegieren ? 'klein haupt' : 'klein'}
            onClick={() => aendereMitarbeiter(person.id, { darfDelegieren: !person.darfDelegieren })}
            style={{ marginBottom: 14 }}
          >
            {person.darfDelegieren ? '☑' : '☐'} darf Aufgaben an Kollegen verteilen
          </button>

          <VerbindungFelder
            wert={person.verbindung}
            aendern={(v) => aendereMitarbeiter(person.id, { verbindung: v })}
          />

          <button type="button" className="haupt" onClick={() => setBearbeiten(false)}>
            Fertig
          </button>
        </>
      )}
    </Dialog>
  )
}

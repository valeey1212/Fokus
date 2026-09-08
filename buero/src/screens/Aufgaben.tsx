import { useState } from 'react'
import type { Aufgabe, Zustand } from '../typen'
import { aendereAufgabe, legeAufgabeAn, loescheAufgabe } from '../daten/aktionen'
import { bearbeiteAufgabe, brichAb, laeuft } from '../agenten/lauf'
import { datumZeit, uhrzeit } from '../utils/zeit'

type Props = { zustand: Zustand }

export function Aufgaben({ zustand }: Props) {
  const [titel, setTitel] = useState('')
  const [auftrag, setAuftrag] = useState('')
  const [an, setAn] = useState(zustand.mitarbeiter[0]?.id ?? '')
  const [offenId, setOffenId] = useState<string | null>(null)

  const anlegen = () => {
    if (!auftrag.trim() || !an) return
    legeAufgabeAn(titel.trim() || auftrag.trim().slice(0, 40), auftrag.trim(), an)
    setTitel('')
    setAuftrag('')
  }

  const laufend = zustand.aufgaben.filter((a) => a.status === 'laeuft' || a.status === 'offen')
  const fragen = zustand.aufgaben.filter((a) => a.status === 'rueckfrage')
  const fertig = zustand.aufgaben.filter((a) => a.status === 'erledigt' || a.status === 'abgebrochen')

  return (
    <div>
      <h1>Aufgaben</h1>

      <div className="karte">
        <label>
          <span>Titel (optional)</span>
          <input value={titel} onChange={(e) => setTitel(e.target.value)} />
        </label>
        <label>
          <span>Auftrag</span>
          <textarea
            value={auftrag}
            onChange={(e) => setAuftrag(e.target.value)}
            placeholder="Was soll getan werden, und woran erkennt man, dass es fertig ist?"
          />
        </label>
        <label>
          <span>Wer macht es?</span>
          <select value={an} onChange={(e) => setAn(e.target.value)}>
            {zustand.mitarbeiter.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} – {m.rolle}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="haupt" onClick={anlegen} disabled={!auftrag.trim() || !an}>
          Auftrag geben
        </button>
      </div>

      {fragen.length > 0 && (
        <>
          <h2 className="abschnitt-titel">Wartet auf dich</h2>
          <div className="liste">
            {fragen.map((a) => (
              <AufgabenZeile key={a.id} aufgabe={a} zustand={zustand} offen={offenId === a.id} umschalten={setOffenId} />
            ))}
          </div>
        </>
      )}

      <h2 className="abschnitt-titel">Im Umlauf ({laufend.length})</h2>
      <div className="liste">
        {laufend.map((a) => (
          <AufgabenZeile key={a.id} aufgabe={a} zustand={zustand} offen={offenId === a.id} umschalten={setOffenId} />
        ))}
        {laufend.length === 0 && <p className="leise">Nichts offen. Ruhiger Tag.</p>}
      </div>

      {fertig.length > 0 && (
        <>
          <h2 className="abschnitt-titel">Erledigt ({fertig.length})</h2>
          <div className="liste">
            {fertig.slice(0, 30).map((a) => (
              <AufgabenZeile key={a.id} aufgabe={a} zustand={zustand} offen={offenId === a.id} umschalten={setOffenId} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

type ZeileProps = {
  aufgabe: Aufgabe
  zustand: Zustand
  offen: boolean
  umschalten: (id: string | null) => void
}

function AufgabenZeile({ aufgabe, zustand, offen, umschalten }: ZeileProps) {
  const [antwort, setAntwort] = useState('')
  const person = zustand.mitarbeiter.find((m) => m.id === aufgabe.zugewiesenAn)

  return (
    <div className="karte">
      <button
        type="button"
        className="person-zeile"
        style={{ background: 'transparent', border: 0, padding: 0, minHeight: 0 }}
        onClick={() => umschalten(offen ? null : aufgabe.id)}
      >
        <span>
          <span className={`marke ${aufgabe.status}`}>{aufgabe.status}</span> <b>{aufgabe.titel}</b>
        </span>
        <span className="leise">
          {person?.name ?? 'niemand'} · {datumZeit(aufgabe.erstelltAm)}
        </span>
      </button>

      {offen && (
        <div style={{ marginTop: 10 }}>
          <p className="leise" style={{ whiteSpace: 'pre-wrap' }}>
            {aufgabe.auftrag}
          </p>

          {aufgabe.status === 'rueckfrage' && (
            <div className="karte" style={{ borderColor: 'var(--gold)' }}>
              <p className="gold">{aufgabe.rueckfrage}</p>
              <label>
                <span>Deine Antwort</span>
                <textarea value={antwort} onChange={(e) => setAntwort(e.target.value)} rows={3} />
              </label>
              <button
                type="button"
                className="haupt"
                disabled={!antwort.trim()}
                onClick={() => {
                  aendereAufgabe(aufgabe.id, { antwort: antwort.trim(), status: 'offen', rueckfrage: null })
                  setAntwort('')
                }}
              >
                Antworten und weitermachen
              </button>
            </div>
          )}

          {aufgabe.ergebnis && (
            <>
              <h3 className="abschnitt-titel">Ergebnis</h3>
              <div className="ergebnisfeld">{aufgabe.ergebnis}</div>
              <button
                type="button"
                className="klein"
                style={{ marginTop: 8 }}
                onClick={() => void navigator.clipboard?.writeText(aufgabe.ergebnis ?? '')}
              >
                Kopieren
              </button>
            </>
          )}

          {aufgabe.protokoll.length > 0 && (
            <>
              <h3 className="abschnitt-titel">Protokoll</h3>
              <div className="protokoll">
                {aufgabe.protokoll.map((p, i) => (
                  <div key={i} className={p.art}>
                    {uhrzeit(p.zeit)} {p.text}
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="zeile" style={{ marginTop: 10 }}>
            {laeuft(aufgabe.id) ? (
              <button type="button" onClick={() => brichAb(aufgabe.id)}>
                Stopp
              </button>
            ) : (
              aufgabe.status !== 'erledigt' && (
                <button type="button" onClick={() => void bearbeiteAufgabe(aufgabe.id)}>
                  Jetzt starten
                </button>
              )
            )}
            {aufgabe.status === 'erledigt' && (
              <button
                type="button"
                onClick={() => aendereAufgabe(aufgabe.id, { status: 'offen', ergebnis: null, erledigtAm: null })}
              >
                Nacharbeiten
              </button>
            )}
            <button type="button" className="gefahr" onClick={() => loescheAufgabe(aufgabe.id)}>
              Löschen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

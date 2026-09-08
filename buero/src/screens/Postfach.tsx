import { useEffect, useState } from 'react'
import type { Zustand } from '../typen'
import { markiereGelesen, sendeNachricht } from '../daten/aktionen'
import { uhrzeit, datumZeit } from '../utils/zeit'

type Props = { zustand: Zustand }

export function Postfach({ zustand }: Props) {
  const [an, setAn] = useState(zustand.mitarbeiter[0]?.id ?? '')
  const [text, setText] = useState('')
  const [ansicht, setAnsicht] = useState<'nachrichten' | 'ereignisse'>('nachrichten')

  useEffect(() => {
    markiereGelesen('chef')
  }, [zustand.nachrichten.length])

  const name = (id: string) => (id === 'chef' ? 'Du' : (zustand.mitarbeiter.find((m) => m.id === id)?.name ?? 'Ehemalige/r'))

  return (
    <div>
      <h1>Postfach</h1>

      <div className="zeile" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className={ansicht === 'nachrichten' ? 'klein haupt' : 'klein'}
          onClick={() => setAnsicht('nachrichten')}
        >
          Nachrichten
        </button>
        <button
          type="button"
          className={ansicht === 'ereignisse' ? 'klein haupt' : 'klein'}
          onClick={() => setAnsicht('ereignisse')}
        >
          Bürotag
        </button>
      </div>

      {ansicht === 'nachrichten' ? (
        <>
          <div className="karte">
            <label>
              <span>An</span>
              <select value={an} onChange={(e) => setAn(e.target.value)}>
                {zustand.mitarbeiter.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} – {m.rolle}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Nachricht</span>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
            </label>
            <button
              type="button"
              className="haupt"
              disabled={!text.trim() || !an}
              onClick={() => {
                sendeNachricht('chef', an, text.trim())
                setText('')
              }}
            >
              Senden
            </button>
            <p className="leise">
              Nachrichten sind Kontext, kein Auftrag. Wenn etwas erledigt werden soll, gib eine Aufgabe.
            </p>
          </div>

          <div className="liste">
            {zustand.nachrichten.slice(0, 60).map((n) => (
              <div key={n.id} className="karte">
                <span className="leise">
                  {uhrzeit(n.zeit)} · {name(n.von)} → {name(n.an)}
                </span>
                <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>{n.text}</p>
              </div>
            ))}
            {zustand.nachrichten.length === 0 && <p className="leise">Noch still hier.</p>}
          </div>
        </>
      ) : (
        <div className="liste">
          {zustand.ereignisse.map((e) => (
            <div key={e.id} className="karte">
              <span className="leise">{datumZeit(e.zeit)}</span>
              <p style={{ margin: '6px 0 0' }}>{e.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

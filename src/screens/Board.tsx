import { useState } from 'react'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import { useKartenAktionen } from '../state/kartenAktionen'
import { AktivePlatzKarte } from '../components/AktivePlatzKarte'
import { Punkte } from '../components/Punkte'
import { TerminChip } from '../components/TerminChip'
import { formatDatum } from '../utils/datum'
import './Board.css'

export function Board() {
  const { zustand, heuteAbgelaufen, heuteAbgelaufenAufgeloest } = useZustand()
  const { oeffne, setTab } = useUi()
  const { hauptplatzKarten, heutePlatzKarte, aktiviere } = useKartenAktionen()
  const [ueberzogen, setUeberzogen] = useState(false)

  const naechsteKarten = zustand.karten.filter((k) => k.spalte === 'naechstes')
  const fertigeKarten = zustand.karten
    .filter((k) => k.spalte === 'fertig')
    .sort((a, b) => new Date(b.abgeschlossenAm ?? 0).getTime() - new Date(a.abgeschlossenAm ?? 0).getTime())

  const plaetze = zustand.einstellungen.plaetze
  const leereSlots = Math.max(0, plaetze - hauptplatzKarten.length)

  function beiDrop(e: React.DragEvent) {
    e.preventDefault()
    setUeberzogen(false)
    const karteId = e.dataTransfer.getData('text/karte-id')
    if (karteId) aktiviere(karteId)
  }

  return (
    <div className="bildschirm board">
      <div className="board-kopf">
        <h1>Board</h1>
        <button className="button-sekundaer" onClick={() => oeffne({ art: 'kartenAssistent' })}>
          + Neue Karte
        </button>
      </div>

      {heuteAbgelaufen.map((karteId) => {
        const karte = zustand.karten.find((k) => k.id === karteId)
        if (!karte) return null
        return (
          <div key={karteId} className="karte board-heute-abgelaufen">
            <p>
              „{karte.titel}" war nur für heute aktiv und ist jetzt bei „Als Nächstes".
            </p>
            <div className="board-heute-abgelaufen-optionen">
              <button
                className="button-sekundaer"
                onClick={() => {
                  aktiviere(karteId)
                  heuteAbgelaufenAufgeloest(karteId)
                }}
              >
                Richtig aktivieren
              </button>
              <button
                className="button-sekundaer"
                onClick={() => {
                  oeffne({ art: 'kartendetail', karteId })
                  heuteAbgelaufenAufgeloest(karteId)
                }}
              >
                Nochmal nur für heute
              </button>
            </div>
          </div>
        )
      })}

      <section className="board-plaetze">
        {hauptplatzKarten.map((karte) => (
          <AktivePlatzKarte key={karte.id} karte={karte} />
        ))}
        {Array.from({ length: leereSlots }).map((_, i) => (
          <div
            key={`leer-${i}`}
            className={`board-platz-frei ${ueberzogen ? 'board-platz-frei-ueberzogen' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setUeberzogen(true)
            }}
            onDragLeave={() => setUeberzogen(false)}
            onDrop={beiDrop}
          >
            <p className="board-platz-frei-text">Ein Platz frei</p>
          </div>
        ))}
        {heutePlatzKarte && (
          <div className="board-platz-nur-heute">
            <AktivePlatzKarte karte={heutePlatzKarte} />
          </div>
        )}
      </section>

      <section className="board-abschnitt">
        <h2>Als Nächstes</h2>
        {naechsteKarten.length === 0 ? (
          <p className="board-leer-hinweis">Nichts wartet gerade.</p>
        ) : (
          <ul className="board-naechstes-liste">
            {naechsteKarten.map((k) => (
              <li
                key={k.id}
                className="board-naechstes-eintrag"
                draggable
                onDragStart={(e) => e.dataTransfer.setData('text/karte-id', k.id)}
              >
                <button className="board-naechstes-inhalt" onClick={() => oeffne({ art: 'kartendetail', karteId: k.id })}>
                  <span className="board-naechstes-titel">{k.titel}</span>
                  <div className="board-naechstes-meta">
                    <Punkte schritte={k.schritte} />
                    <TerminChip frist={k.frist} wunschtermin={k.wunschtermin} />
                  </div>
                </button>
                <button className="button-text" onClick={() => aktiviere(k.id)}>
                  Aktivieren
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="board-abschnitt">
        <button className="board-ablage-zugang" onClick={() => setTab('ablage')}>
          Ablage öffnen
        </button>
      </section>

      {fertigeKarten.length > 0 && (
        <section className="board-abschnitt board-fertig">
          <h2>Fertig</h2>
          <ul className="board-fertig-liste">
            {fertigeKarten.map((k) => (
              <li key={k.id} className="board-fertig-eintrag">
                <span>{k.titel}</span>
                {k.abgeschlossenAm && <span className="mono board-fertig-datum">{formatDatum(k.abgeschlossenAm)}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

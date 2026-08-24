import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import { useKartenAktionen } from '../state/kartenAktionen'
import { Punkte } from '../components/Punkte'
import { formatDatum } from '../utils/datum'
import './Ablage.css'

type Eintrag =
  | { art: 'keeper'; id: string; text: string; datum: string }
  | { art: 'karte'; id: string; text: string; datum: string }

export function Ablage() {
  const { zustand } = useZustand()
  const { oeffne } = useUi()
  const { aktiviere } = useKartenAktionen()

  const keeperInAblage = zustand.keeper.filter((k) => k.status === 'sortiert' && k.ziel === 'ablage')
  const kartenInAblage = zustand.karten.filter((k) => k.spalte === 'ablage')

  const eintraege: Eintrag[] = [
    ...keeperInAblage.map((k): Eintrag => ({ art: 'keeper', id: k.id, text: k.inhalt, datum: k.erstelltAm })),
    ...kartenInAblage.map((k): Eintrag => ({ art: 'karte', id: k.id, text: k.titel, datum: k.erstelltAm })),
  ].sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())

  return (
    <div className="bildschirm ablage">
      <h1 className="ablage-titel">Ablage</h1>

      {eintraege.length === 0 ? (
        <p className="ablage-leer-hinweis">Hier liegt noch nichts.</p>
      ) : (
        <ul className="ablage-liste">
          {eintraege.map((e) => {
            const karte = e.art === 'karte' ? kartenInAblage.find((k) => k.id === e.id) : undefined
            return (
              <li key={`${e.art}-${e.id}`} className="karte ablage-eintrag">
                <div className="ablage-eintrag-inhalt">
                  <span className="ablage-eintrag-text">{e.text}</span>
                  <span className="mono ablage-eintrag-datum">{formatDatum(e.datum)}</span>
                  {karte && <Punkte schritte={karte.schritte} />}
                </div>
                {e.art === 'karte' ? (
                  <button className="button-text" onClick={() => aktiviere(e.id)}>
                    Aufs Board
                  </button>
                ) : (
                  <button
                    className="button-text"
                    onClick={() => oeffne({ art: 'kartenAssistent', vorbelegterTitel: e.text, keeperId: e.id })}
                  >
                    Aufs Board
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

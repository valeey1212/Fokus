import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import { useKartenAktionen } from '../state/kartenAktionen'
import { Punkte } from '../components/Punkte'
import { istHeute } from '../utils/datum'
import './Jetzt.css'

export function Jetzt() {
  const { zustand } = useZustand()
  const { oeffne } = useUi()
  const { hauptplatzKarten, heutePlatzKarte } = useKartenAktionen()

  const offeneKeeper = zustand.keeper.filter((k) => k.status === 'offen')
  const sessionsHeute = zustand.sessions.filter((s) => istHeute(s.start))
  const aktiveKarten = heutePlatzKarte ? [...hauptplatzKarten, heutePlatzKarte] : hauptplatzKarten

  return (
    <div className="bildschirm jetzt">
      <div className="jetzt-kopf">
        <h1 className="jetzt-titel">Jetzt</h1>
        <button className="button-text" onClick={() => oeffne({ art: 'einstellungen' })}>
          Einstellungen
        </button>
      </div>

      <p className="jetzt-tagesanzeige mono">
        {sessionsHeute.length} {sessionsHeute.length === 1 ? 'Session' : 'Sessions'} heute
      </p>

      <section className="jetzt-abschnitt">
        {aktiveKarten.length === 0 ? (
          <p className="jetzt-leer-hinweis">Noch keine aktive Karte auf dem Board.</p>
        ) : (
          <ul className="jetzt-karten-liste">
            {aktiveKarten.map((karte) => {
              const schritt = karte.schritte.find((s) => !s.erledigtAm)
              return (
                <li key={karte.id} className="karte jetzt-karte">
                  <div className="jetzt-karte-info">
                    <span className="jetzt-karte-titel">{karte.titel}</span>
                    {schritt && <span className="jetzt-karte-schritt">{schritt.text}</span>}
                    <Punkte schritte={karte.schritte} />
                  </div>
                  <button className="button-primaer" onClick={() => oeffne({ art: 'fokus', karteId: karte.id })}>
                    Fokus starten
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {offeneKeeper.length > 0 && (
        <button className="jetzt-sortier-hinweis" onClick={() => oeffne({ art: 'sortier' })}>
          {offeneKeeper.length} {offeneKeeper.length === 1 ? 'Notiz' : 'Notizen'} sortieren, ca.{' '}
          {Math.max(1, Math.round(offeneKeeper.length * 0.3))} Minuten.
        </button>
      )}
    </div>
  )
}

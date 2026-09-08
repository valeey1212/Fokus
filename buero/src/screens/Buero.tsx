import { useMemo, useState } from 'react'
import type { Zustand } from '../typen'
import { BueroCanvas } from '../komponenten/BueroCanvas'
import { MitarbeiterDialog } from '../komponenten/MitarbeiterDialog'
import { EinstellenDialog } from '../komponenten/EinstellenDialog'
import { Shop } from '../komponenten/Shop'
import { rangVon } from '../spiel/rang'
import { seitdem } from '../utils/zeit'

type Props = { zustand: Zustand; zuAufgaben: () => void }

export function Buero({ zustand, zuAufgaben }: Props) {
  const [offen, setOffen] = useState<string | null>(null)
  const [einstellen, setEinstellen] = useState(false)
  const [shop, setShop] = useState(false)

  /** Sprechblasen: was gerade frisch gesagt oder gedacht wurde. */
  const blasen = useMemo(() => {
    const ergebnis: Record<string, string> = {}
    const grenze = Date.now() - 20000
    for (const n of zustand.nachrichten) {
      if (new Date(n.zeit).getTime() < grenze) break
      if (!ergebnis[n.von] && n.von !== 'chef') ergebnis[n.von] = kuerze(n.text)
    }
    for (const a of zustand.aufgaben) {
      if (a.status !== 'laeuft' || !a.zugewiesenAn || ergebnis[a.zugewiesenAn]) continue
      const letzte = [...a.protokoll].reverse().find((p) => p.art === 'gedanke' || p.art === 'werkzeug')
      if (letzte) ergebnis[a.zugewiesenAn] = kuerze(letzte.text)
    }
    return ergebnis
  }, [zustand.nachrichten, zustand.aufgaben])

  const naechsteStufe = zustand.buero.stufe * 200
  const fortschritt = Math.min(100, ((zustand.buero.xp % 200) / 200) * 100)
  const arbeiten = zustand.mitarbeiter.filter((m) => m.status === 'arbeitet').length
  const offeneAufgaben = zustand.aufgaben.filter((a) => a.status === 'offen' || a.status === 'laeuft').length

  return (
    <div>
      <div className="kopfzeile">
        <h1>{zustand.einstellungen.firma}</h1>
        <button type="button" className="klein" onClick={() => setShop(true)}>
          Laden
        </button>
      </div>

      <div className="hud">
        <span>
          Stufe <b>{zustand.buero.stufe}</b>
        </span>
        <span>
          Münzen <b>{zustand.buero.muenzen}</b>
        </span>
        <span>
          XP <b>{zustand.buero.xp}</b>/{naechsteStufe}
        </span>
        <span>
          Team <b>{zustand.mitarbeiter.length}</b>
        </span>
      </div>
      <div className="xp-balken">
        <i style={{ width: `${fortschritt}%` }} />
      </div>

      <BueroCanvas zustand={zustand} aufMitarbeiter={setOffen} blasen={blasen} />

      <div className="zeile" style={{ marginTop: 12 }}>
        <button type="button" className="haupt" onClick={() => setEinstellen(true)}>
          + Einstellen
        </button>
        <button type="button" onClick={zuAufgaben}>
          Aufgabe geben
        </button>
      </div>

      <p className="leise" style={{ marginTop: 10 }}>
        {arbeiten > 0 ? `${arbeiten} am Arbeiten · ` : ''}
        {offeneAufgaben} Aufgaben im Umlauf
      </p>

      <h2 className="abschnitt-titel">Belegschaft</h2>
      <div className="liste">
        {zustand.mitarbeiter.map((m) => (
          <button key={m.id} type="button" className="karte person-zeile" onClick={() => setOffen(m.id)}>
            <span>
              <b>{m.name}</b> · {m.rolle}
            </span>
            <span className="leise">
              {rangVon(m.xp)} · {m.erledigt} erledigt · {statusText(m.status)} · seit {seitdem(m.eingestelltAm)}
            </span>
          </button>
        ))}
      </div>

      {offen && <MitarbeiterDialog zustand={zustand} mitarbeiterId={offen} schliessen={() => setOffen(null)} />}
      {einstellen && <EinstellenDialog zustand={zustand} schliessen={() => setEinstellen(false)} />}
      {shop && <Shop zustand={zustand} schliessen={() => setShop(false)} />}
    </div>
  )
}

function statusText(status: string): string {
  switch (status) {
    case 'arbeitet':
      return 'arbeitet'
    case 'wartet':
      return 'wartet auf dich'
    case 'pause':
      return 'Pause'
    default:
      return 'frei'
  }
}

function kuerze(text: string): string {
  const sauber = text.replace(/\s+/g, ' ').trim()
  return sauber.length > 90 ? `${sauber.slice(0, 88)}…` : sauber
}

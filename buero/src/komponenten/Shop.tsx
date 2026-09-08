import type { Zustand } from '../typen'
import { kaufeMoebel, protokolliere } from '../daten/aktionen'
import { Dialog } from './Dialog'

type Props = { zustand: Zustand; schliessen: () => void }

export function Shop({ zustand, schliessen }: Props) {
  return (
    <Dialog titel={`Büroladen · ${zustand.buero.muenzen} Münzen`} schliessen={schliessen}>
      <p className="leise">Münzen gibt es für erledigte Aufgaben. Alles hier ist Deko fürs Büro.</p>
      <div className="liste">
        {zustand.moebel.map((m) => (
          <div key={m.id} className="karte">
            <div className="kopfzeile" style={{ marginBottom: 6 }}>
              <b>{m.name}</b>
              <span className="gold">{m.preis}</span>
            </div>
            <button
              type="button"
              className={m.gekauft ? 'klein' : 'klein haupt'}
              disabled={m.gekauft || zustand.buero.muenzen < m.preis}
              onClick={() => {
                kaufeMoebel(m.id)
                protokolliere(`${m.name} steht jetzt im Büro.`, 'kauf')
              }}
            >
              {m.gekauft ? 'steht schon da' : zustand.buero.muenzen < m.preis ? 'zu teuer' : 'kaufen'}
            </button>
          </div>
        ))}
      </div>
    </Dialog>
  )
}

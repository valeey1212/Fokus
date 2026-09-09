import { useState } from 'react'
import type { Verbindung, Zustand } from '../typen'
import { ROLLENVORLAGEN, VORNAMEN, type Rollenvorlage } from '../daten/vorlagen'
import { stelleEin } from '../daten/aktionen'
import { Dialog } from './Dialog'
import { VerbindungFelder } from './VerbindungFelder'
import { figurDatei } from '../spiel/iso'

const BASIS = import.meta.env.BASE_URL + 'assets/pixelbuero/'

type Props = { zustand: Zustand; schliessen: () => void }

export function EinstellenDialog({ zustand, schliessen }: Props) {
  const [schritt, setSchritt] = useState(0)
  const [vorlage, setVorlage] = useState<Rollenvorlage | null>(null)
  const [name, setName] = useState('')
  const [rolle, setRolle] = useState('')
  const [profil, setProfil] = useState('')
  const [aussehen, setAussehen] = useState(0)
  const [ressourcen, setRessourcen] = useState<string[]>([])
  const [darfDelegieren, setDarfDelegieren] = useState(false)
  const [verbindung, setVerbindung] = useState<Verbindung>({ modus: 'api', modell: 'claude-sonnet-5' })

  const waehle = (v: Rollenvorlage) => {
    setVorlage(v)
    setRolle(v.rolle)
    setProfil(v.profil)
    setAussehen(v.aussehen)
    setName(VORNAMEN[(zustand.mitarbeiter.length + v.aussehen) % VORNAMEN.length])
    setRessourcen(zustand.ressourcen.filter((r) => v.vorschlagRessourcen.includes(r.art)).map((r) => r.id))
    setDarfDelegieren(v.rolle === 'Projektleitung')
    setSchritt(1)
  }

  const einstellen = () => {
    stelleEin({
      name: name.trim() || 'Neu',
      rolle: rolle.trim() || 'Mitarbeit',
      aussehen,
      profil: profil.trim(),
      verbindung,
      ressourcen,
      darfDelegieren,
    })
    schliessen()
  }

  return (
    <Dialog titel={schritt === 0 ? 'Wen brauchst du?' : 'Arbeitsvertrag'} schliessen={schliessen}>
      {schritt === 0 && (
        <div className="liste">
          {ROLLENVORLAGEN.map((v) => (
            <button key={v.rolle} type="button" className="karte person-zeile" onClick={() => waehle(v)}>
              <span>
                <b>{v.rolle}</b>
              </span>
              <span className="leise">{v.kurz}</span>
            </button>
          ))}
          <button
            type="button"
            className="karte person-zeile"
            onClick={() =>
              waehle({
                rolle: '',
                kurz: '',
                profil: '',
                aussehen: Math.floor(Math.random() * 10),
                vorschlagRessourcen: [],
              })
            }
          >
            <span>
              <b>Eigene Rolle</b>
            </span>
            <span className="leise">Profil selbst schreiben.</span>
          </button>
        </div>
      )}

      {schritt === 1 && vorlage && (
        <>
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            <span>Rolle</span>
            <input value={rolle} onChange={(e) => setRolle(e.target.value)} placeholder="z. B. Buchhaltung" />
          </label>

          <label>
            <span>Aussehen</span>
            <div className="aussehen-auswahl">
              {Array.from({ length: 10 }, (_, i) => i).map((i) => (
                <button
                  key={i}
                  type="button"
                  className={i === aussehen ? 'aussehen-knopf aktiv' : 'aussehen-knopf'}
                  onClick={() => setAussehen(i)}
                >
                  <img src={`${BASIS}${figurDatei(i)}`} alt={`Aussehen ${i + 1}`} width={24} height={47} />
                </button>
              ))}
            </div>
          </label>

          <label>
            <span>Aufgabenprofil – was diese Person tut und was nicht</span>
            <textarea value={profil} onChange={(e) => setProfil(e.target.value)} rows={8} />
          </label>

          <span className="leise">Zugriff auf</span>
          <div className="liste" style={{ margin: '6px 0 14px' }}>
            {zustand.ressourcen.map((r) => (
              <button
                key={r.id}
                type="button"
                className={ressourcen.includes(r.id) ? 'klein haupt' : 'klein'}
                onClick={() =>
                  setRessourcen((alt) => (alt.includes(r.id) ? alt.filter((x) => x !== r.id) : [...alt, r.id]))
                }
              >
                {ressourcen.includes(r.id) ? '☑ ' : '☐ '}
                {r.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={darfDelegieren ? 'klein haupt' : 'klein'}
            onClick={() => setDarfDelegieren((a) => !a)}
            style={{ marginBottom: 14 }}
          >
            {darfDelegieren ? '☑' : '☐'} darf Aufgaben an Kollegen verteilen
          </button>

          <VerbindungFelder wert={verbindung} aendern={setVerbindung} />

          <div className="zeile">
            <button type="button" onClick={() => setSchritt(0)}>
              Zurück
            </button>
            <button type="button" className="haupt" onClick={einstellen} disabled={!name.trim() || !profil.trim()}>
              Einstellen
            </button>
          </div>
        </>
      )}
    </Dialog>
  )
}

import { useEffect, useRef } from 'react'
import type { Mitarbeiter, Zustand } from '../typen'
import {
  EINHEITEN,
  FIGUR_BREITE,
  FIGUR_HOEHE,
  FLOOR_BREITE,
  FLOOR_HOEHE,
  SPALTEN,
  einheitFuerRolle,
  einheitPosition,
  figurDatei,
  kachelZuPixel,
  sitzplatz,
} from '../spiel/iso'
import './IsoBuero.css'

const BASIS = import.meta.env.BASE_URL + 'assets/pixelbuero/'

type Bewegung = { spalte: number; reihe: number; zielSpalte: number; zielReihe: number; wartet: number }

type Props = { zustand: Zustand; aufMitarbeiter: (id: string) => void; blasen: Record<string, string> }

/** Liest den prozentualen Wert für eine Bildpunkt-Position im 1248×846-Raum. */
const px = (wert: number) => `${(wert / FLOOR_BREITE) * 100}%`
const py = (wert: number) => `${(wert / FLOOR_HOEHE) * 100}%`

export function IsoBuero({ zustand, aufMitarbeiter, blasen }: Props) {
  const buehneRef = useRef<HTMLDivElement | null>(null)
  const bewegungen = useRef<Map<string, Bewegung>>(new Map())

  // Zwei Personen pro Stellfläche, in der Reihenfolge ihres Schreibtischs.
  const pods = new Map<number, Mitarbeiter['rolle']>()
  for (const m of zustand.mitarbeiter) {
    const slot = Math.floor(m.schreibtisch / 2)
    if (!pods.has(slot)) pods.set(slot, m.rolle)
  }

  useEffect(() => {
    const buehne = buehneRef.current
    if (!buehne) return
    let laeuft = true
    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const rahmen = () => {
      if (!laeuft) return
      for (const m of zustand.mitarbeiter) {
        const el = buehne.querySelector<HTMLElement>(`[data-figur="${m.id}"]`)
        if (!el) continue

        const slot = Math.floor(m.schreibtisch / 2)
        const platz = (m.schreibtisch % 2) as 0 | 1
        const [heimSpalte, heimReihe] = sitzplatz(slot, platz)

        let b = bewegungen.current.get(m.id)
        if (!b) {
          b = { spalte: heimSpalte, reihe: heimReihe, zielSpalte: heimSpalte, zielReihe: heimReihe, wartet: 0 }
          bewegungen.current.set(m.id, b)
        }

        if (m.status === 'arbeitet') {
          b.zielSpalte = heimSpalte
          b.zielReihe = heimReihe
        } else if (!ruhig) {
          if (b.wartet > 0) b.wartet--
          else if (Math.hypot(b.spalte - b.zielSpalte, b.reihe - b.zielReihe) < 0.05) {
            b.wartet = 150 + Math.floor(Math.random() * 400)
            if (Math.random() < 0.5) {
              // Wandert durch einen der beiden Gänge zwischen den Schreibtischreihen.
              b.zielSpalte = 0.6 + Math.random() * (SPALTEN - 1.2)
              b.zielReihe = Math.random() < 0.5 ? 2.6 : 6.6
            } else {
              b.zielSpalte = heimSpalte
              b.zielReihe = heimReihe
            }
          }
        }

        const dSpalte = b.zielSpalte - b.spalte
        const dReihe = b.zielReihe - b.reihe
        const distanz = Math.hypot(dSpalte, dReihe)
        if (distanz > 0.01) {
          const schritt = Math.min(distanz, 0.045)
          b.spalte += (dSpalte / distanz) * schritt
          b.reihe += (dReihe / distanz) * schritt
        }

        const [x, y] = kachelZuPixel(b.spalte, b.reihe)
        el.style.left = px(x - FIGUR_BREITE / 2)
        el.style.top = py(y - FIGUR_HOEHE)
        el.style.zIndex = String(Math.round(10 * (b.spalte + b.reihe) + 5))
      }
      requestAnimationFrame(rahmen)
    }

    const anfrage = requestAnimationFrame(rahmen)
    return () => {
      laeuft = false
      cancelAnimationFrame(anfrage)
    }
    // Läuft dauerhaft; liest zustand/zustand.mitarbeiter direkt aus der Closure der jeweils
    // aktuellen Render-Props, ein Neustart bei jeder Änderung wäre für die Animation unnötig teuer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zustand.mitarbeiter.length])

  return (
    <div className="iso-buehne" ref={buehneRef}>
      <img className="iso-boden" src={`${BASIS}floor-base.png`} alt="" width={FLOOR_BREITE} height={FLOOR_HOEHE} />

      {[...pods.entries()].map(([slot, rolle]) => {
        const einheit = EINHEITEN[einheitFuerRolle(rolle)]
        const pos = einheitPosition(slot)
        return (
          <img
            key={slot}
            className="iso-einheit"
            src={`${BASIS}${einheit.datei}`}
            alt={einheit.name}
            style={{ left: px(pos.left), top: py(pos.top), width: px(360), zIndex: pos.z }}
          />
        )
      })}

      {zustand.mitarbeiter.map((m) => (
        <button
          key={m.id}
          type="button"
          data-figur={m.id}
          className={`iso-figur status-${m.status}`}
          style={{ width: px(FIGUR_BREITE) }}
          onClick={() => aufMitarbeiter(m.id)}
        >
          {blasen[m.id] && <span className="iso-sprechblase">{blasen[m.id]}</span>}
          <img src={`${BASIS}${figurDatei(m.aussehen)}`} alt="" width={FIGUR_BREITE} height={FIGUR_HOEHE} />
          <span className="iso-name">{m.name}</span>
          <span className="iso-status">{statusZeichen(m)}</span>
        </button>
      ))}
    </div>
  )
}

function statusZeichen(m: Mitarbeiter): string {
  switch (m.status) {
    case 'arbeitet':
      return '···'
    case 'wartet':
      return '?'
    case 'pause':
      return 'zZ'
    default:
      return ''
  }
}

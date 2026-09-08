import { useEffect, useRef, useState } from 'react'
import type { Mitarbeiter, Zustand } from '../typen'
import { FIGUREN, MOEBEL, TISCH, figurPalette, malRaster } from '../spiel/sprites'
import './BueroCanvas.css'

export const BREITE = 256
export const HOEHE = 190
/** Sprites werden doppelt so groß gemalt – so bleibt das Raster grob und lesbar. */
const MASS = 2
const FIGUR_BREITE = 12 * MASS
const FIGUR_HOEHE = 14 * MASS

type Bewegung = { x: number; y: number; zielX: number; zielY: number; phase: number; wartet: number }

export function schreibtischPlatz(nummer: number) {
  const spalte = nummer % 4
  const reihe = Math.floor(nummer / 4) % 2
  return { x: 40 + spalte * 52, y: 86 + reihe * 58 }
}

type Props = {
  zustand: Zustand
  aufMitarbeiter: (id: string) => void
  blasen: Record<string, string>
}

export function BueroCanvas({ zustand, aufMitarbeiter, blasen }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const bewegungen = useRef<Map<string, Bewegung>>(new Map())
  const [positionen, setPositionen] = useState<Record<string, { x: number; y: number }>>({})
  const zustandRef = useRef(zustand)
  zustandRef.current = zustand

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false

    let laeuft = true
    let rahmen = 0
    const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const zeichne = () => {
      if (!laeuft) return
      rahmen++
      const z = zustandRef.current
      malRaum(ctx, z, rahmen)

      const neuePositionen: Record<string, { x: number; y: number }> = {}
      for (const person of z.mitarbeiter) {
        const platz = schreibtischPlatz(person.schreibtisch)
        const heim = { x: platz.x + 4, y: platz.y - FIGUR_HOEHE - 1 }
        let b = bewegungen.current.get(person.id)
        if (!b) {
          b = { x: heim.x, y: heim.y, zielX: heim.x, zielY: heim.y, phase: 0, wartet: 0 }
          bewegungen.current.set(person.id, b)
        }

        const sitztFest = person.status === 'arbeitet'
        if (sitztFest) {
          b.zielX = heim.x
          b.zielY = heim.y
        } else if (!ruhig) {
          // Freie Leute laufen ab und zu durchs Büro und kommen zurück.
          if (b.wartet > 0) b.wartet--
          else if (Math.abs(b.x - b.zielX) < 1 && Math.abs(b.y - b.zielY) < 1) {
            b.wartet = 120 + Math.floor(Math.random() * 400)
            if (Math.random() < 0.5) {
              b.zielX = 24 + Math.random() * (BREITE - 24 - FIGUR_BREITE - 24)
              b.zielY = 58 + Math.random() * (HOEHE - 58 - FIGUR_HOEHE - 6)
            } else {
              b.zielX = heim.x
              b.zielY = heim.y
            }
          }
        }

        const dx = b.zielX - b.x
        const dy = b.zielY - b.y
        const weite = Math.hypot(dx, dy)
        const geht = weite > 1
        if (geht) {
          b.x += (dx / weite) * 0.45
          b.y += (dy / weite) * 0.45
          b.phase += 0.12
        }

        const amPlatz = Math.abs(b.x - heim.x) < 2 && Math.abs(b.y - heim.y) < 2
        const raster = geht
          ? Math.floor(b.phase) % 2 === 0
            ? FIGUREN.geht
            : FIGUREN.stand
          : amPlatz
            ? FIGUREN.sitzt
            : FIGUREN.stand
        const wippen = !geht && amPlatz && person.status === 'arbeitet' && !ruhig ? (Math.floor(rahmen / 20) % 2) : 0

        malRaster(ctx, raster, figurPalette(person.aussehen), Math.round(b.x), Math.round(b.y) + wippen, MASS)
        neuePositionen[person.id] = { x: b.x + FIGUR_BREITE / 2, y: b.y }
      }

      setPositionen((alt) => (nahGenug(alt, neuePositionen) ? alt : neuePositionen))
      raf = requestAnimationFrame(zeichne)
    }

    let raf = requestAnimationFrame(zeichne)
    return () => {
      laeuft = false
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="buero-buehne">
      <canvas ref={canvasRef} width={BREITE} height={HOEHE} className="buero-canvas" />
      <div className="buero-overlay">
        {zustand.mitarbeiter.map((person) => {
          const pos = positionen[person.id]
          if (!pos) return null
          return (
            <button
              key={person.id}
              type="button"
              className={`figur-knopf status-${person.status}`}
              style={{ left: `${(pos.x / BREITE) * 100}%`, top: `${(pos.y / HOEHE) * 100}%` }}
              onClick={() => aufMitarbeiter(person.id)}
            >
              {blasen[person.id] && <span className="sprechblase">{blasen[person.id]}</span>}
              <span className="figur-name">{person.name}</span>
              <span className="figur-status">{statusZeichen(person)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function statusZeichen(person: Mitarbeiter): string {
  switch (person.status) {
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

function nahGenug(a: Record<string, { x: number; y: number }>, b: Record<string, { x: number; y: number }>) {
  const schluesselA = Object.keys(a)
  const schluesselB = Object.keys(b)
  if (schluesselA.length !== schluesselB.length) return false
  return schluesselA.every((k) => b[k] && Math.abs(a[k].x - b[k].x) < 0.6 && Math.abs(a[k].y - b[k].y) < 0.6)
}

function malRaum(ctx: CanvasRenderingContext2D, z: Zustand, rahmen: number) {
  // Wand
  ctx.fillStyle = '#3B4152'
  ctx.fillRect(0, 0, BREITE, 52)
  ctx.fillStyle = '#454C60'
  for (let x = 0; x < BREITE; x += 16) ctx.fillRect(x, 0, 8, 52)

  // Fenster mit Tag-Himmel
  for (const fx of [30, 176]) {
    ctx.fillStyle = '#2B3040'
    ctx.fillRect(fx - 2, 8, 44, 30)
    ctx.fillStyle = '#7FB7E8'
    ctx.fillRect(fx, 10, 40, 26)
    ctx.fillStyle = '#E8F1F8'
    ctx.fillRect(fx + 6 + ((rahmen / 12) % 30), 14, 8, 3)
    ctx.fillStyle = '#2B3040'
    ctx.fillRect(fx + 19, 10, 2, 26)
    ctx.fillRect(fx, 22, 40, 2)
  }

  // Boden
  ctx.fillStyle = '#8E7A5F'
  ctx.fillRect(0, 52, BREITE, HOEHE - 52)
  ctx.fillStyle = '#9C876A'
  for (let y = 52; y < HOEHE; y += 14) {
    for (let x = ((y - 52) / 14) % 2 === 0 ? 0 : 14; x < BREITE; x += 28) {
      ctx.fillRect(x, y, 14, 14)
    }
  }
  ctx.fillStyle = '#6F5E48'
  ctx.fillRect(0, 52, BREITE, 2)

  // Gekaufte Möbel
  for (const stueck of z.moebel) {
    if (!stueck.gekauft) continue
    const bild = MOEBEL[stueck.id]
    if (!bild) continue
    malRaster(ctx, bild.raster, bild.palette, stueck.x, stueck.y, MASS)
  }

  // Schreibtische
  for (const person of z.mitarbeiter) {
    const platz = schreibtischPlatz(person.schreibtisch)
    malRaster(ctx, TISCH.raster, TISCH.palette, platz.x, platz.y, MASS)
    if (person.status === 'arbeitet') {
      // Bildschirmflackern als Lebenszeichen
      ctx.fillStyle = (Math.floor(rahmen / 15) % 2) === 0 ? '#A6E7DA' : '#7FD4C1'
      ctx.fillRect(platz.x + 4, platz.y + 6, 8, 4)
    }
  }
}

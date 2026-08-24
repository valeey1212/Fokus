import type { Schritt } from '../types'
import './Punkte.css'

export function Punkte({ schritte }: { schritte: Schritt[] }) {
  if (schritte.length === 0) return null
  const erledigt = schritte.filter((s) => s.erledigtAm).length
  return (
    <div className="punkte" aria-label={`${erledigt} von ${schritte.length} Schritten erledigt`}>
      <div className="punkte-reihe">
        {schritte.map((s) => (
          <span key={s.id} className={`punkt ${s.erledigtAm ? 'punkt-voll' : ''}`} />
        ))}
      </div>
      <span className="mono punkte-zahl">
        {erledigt}/{schritte.length}
      </span>
    </div>
  )
}

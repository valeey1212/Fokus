import { lies, abonniere } from '../daten/speicher'
import { bearbeiteAufgabe, laeuft } from './lauf'

let angeschaltet = false
let timer: number | undefined

/**
 * Der Bürotakt: schaut regelmäßig, ob offene Aufgaben auf freie Mitarbeiter warten,
 * und startet so viele parallel, wie in den Einstellungen erlaubt ist.
 */
export function starteTakt() {
  if (angeschaltet) return
  angeschaltet = true
  const pruefen = () => {
    const z = lies()
    const aktiv = z.aufgaben.filter((a) => laeuft(a.id)).length
    let frei = Math.max(0, z.einstellungen.gleichzeitig - aktiv)
    if (frei <= 0) return
    const wartend = [...z.aufgaben]
      .filter((a) => a.status === 'offen' && a.zugewiesenAn)
      .reverse() // ältere zuerst
    for (const aufgabe of wartend) {
      if (frei <= 0) break
      const person = z.mitarbeiter.find((m) => m.id === aufgabe.zugewiesenAn)
      if (!person || person.status === 'arbeitet' || person.status === 'pause') continue
      if (laeuft(aufgabe.id)) continue
      void bearbeiteAufgabe(aufgabe.id)
      frei--
    }
  }
  timer = window.setInterval(pruefen, 1500)
  abonniere(pruefen)
}

export function stoppeTakt() {
  if (timer) window.clearInterval(timer)
  angeschaltet = false
}

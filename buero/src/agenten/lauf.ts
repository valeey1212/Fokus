import {
  aendereAufgabe,
  ergaenzeProtokoll,
  gibXp,
  protokolliere,
  sendeNachricht,
  setzeStatus,
} from '../daten/aktionen'
import { lies } from '../daten/speicher'
import type { Aufgabe, Mitarbeiter } from '../typen'
import { frageModell, ModellFehler, type Sprechzug } from './anbieter'
import { leseWerkzeugaufruf } from './parser'
import { baueAuftrag, baueSystemPrompt } from './prompt'
import { fuehreWerkzeugAus } from './werkzeuge'

const laufende = new Map<string, AbortController>()

export function laeuft(aufgabeId: string): boolean {
  return laufende.has(aufgabeId)
}

export function brichAb(aufgabeId: string) {
  laufende.get(aufgabeId)?.abort()
  laufende.delete(aufgabeId)
}

/** Arbeitet eine Aufgabe vom Anfang bis zu „fertig“, „rueckfrage“ oder Fehler ab. */
export async function bearbeiteAufgabe(aufgabeId: string): Promise<void> {
  if (laufende.has(aufgabeId)) return
  const start = lies()
  const aufgabe = start.aufgaben.find((a) => a.id === aufgabeId)
  if (!aufgabe || !aufgabe.zugewiesenAn) return
  const mitarbeiter = start.mitarbeiter.find((m) => m.id === aufgabe.zugewiesenAn)
  if (!mitarbeiter) return

  const steuerung = new AbortController()
  laufende.set(aufgabeId, steuerung)
  aendereAufgabe(aufgabeId, { status: 'laeuft', rueckfrage: null })
  setzeStatus(mitarbeiter.id, 'arbeitet')

  const verlauf: Sprechzug[] = [{ rolle: 'nutzer', text: baueAuftrag(aufgabe, start) }]
  const maxSchritte = start.einstellungen.maxSchritte

  try {
    for (let schritt = 0; schritt < maxSchritte; schritt++) {
      const zustand = lies()
      const aktuell = zustand.mitarbeiter.find((m) => m.id === mitarbeiter.id)
      if (!aktuell) break

      const roh = await frageModell(
        aktuell.verbindung,
        zustand.einstellungen,
        { system: baueSystemPrompt(aktuell, zustand), verlauf },
        steuerung.signal,
      )
      verlauf.push({ rolle: 'agent', text: roh })

      const aufruf = leseWerkzeugaufruf(roh)
      if (aufruf.gedanke) ergaenzeProtokoll(aufgabeId, { art: 'gedanke', text: aufruf.gedanke })

      const ergebnis = fuehreWerkzeugAus(aktuell, aufgabeId, aufruf)
      ergaenzeProtokoll(aufgabeId, {
        art: aufruf.werkzeug === 'fertig' ? 'ergebnis' : 'werkzeug',
        text: `${aufruf.werkzeug}: ${ergebnis.text}`,
      })

      if (ergebnis.rueckfrage) {
        aendereAufgabe(aufgabeId, { status: 'rueckfrage', rueckfrage: ergebnis.rueckfrage })
        sendeNachricht(aktuell.id, 'chef', `Rückfrage zu „${aufgabe.titel}“: ${ergebnis.rueckfrage}`, aufgabeId)
        setzeStatus(aktuell.id, 'wartet')
        return
      }

      if (ergebnis.beendet) {
        schliesseAb(aufgabe, aktuell, ergebnis.ergebnis ?? '')
        return
      }

      verlauf.push({ rolle: 'nutzer', text: `Ergebnis von ${aufruf.werkzeug}:\n${ergebnis.text}\n\nWeiter. Nur JSON.` })
    }

    // Schrittgrenze erreicht: nicht als Fehler werten, sondern ehrlich beenden.
    ergaenzeProtokoll(aufgabeId, {
      art: 'system',
      text: `Nach ${maxSchritte} Schritten gestoppt. Der letzte Stand steht im Protokoll.`,
    })
    aendereAufgabe(aufgabeId, {
      status: 'rueckfrage',
      rueckfrage: 'Ich bin an der Schrittgrenze angekommen. Soll ich weitermachen oder soll der Auftrag kleiner werden?',
    })
    setzeStatus(mitarbeiter.id, 'wartet')
  } catch (fehler) {
    if (steuerung.signal.aborted) {
      ergaenzeProtokoll(aufgabeId, { art: 'system', text: 'Vom Chef gestoppt.' })
      aendereAufgabe(aufgabeId, { status: 'offen' })
      setzeStatus(mitarbeiter.id, 'frei')
      return
    }
    const text =
      fehler instanceof ModellFehler
        ? `${fehler.message}${fehler.hinweis ? ` – ${fehler.hinweis}` : ''}`
        : fehler instanceof Error
          ? fehler.message
          : 'Unbekannter Fehler'
    ergaenzeProtokoll(aufgabeId, { art: 'fehler', text })
    aendereAufgabe(aufgabeId, { status: 'offen' })
    setzeStatus(mitarbeiter.id, 'pause')
    protokolliere(`${mitarbeiter.name} kommt nicht weiter: ${text}`, 'fehler', mitarbeiter.id)
  } finally {
    laufende.delete(aufgabeId)
    const nach = lies().aufgaben.find((a) => a.id === aufgabeId)
    if (nach && nach.status === 'laeuft') aendereAufgabe(aufgabeId, { status: 'offen' })
  }
}

function schliesseAb(aufgabe: Aufgabe, mitarbeiter: Mitarbeiter, ergebnis: string) {
  aendereAufgabe(aufgabe.id, {
    status: 'erledigt',
    ergebnis,
    erledigtAm: new Date().toISOString(),
  })
  setzeStatus(mitarbeiter.id, 'frei')
  gibXp(mitarbeiter.id, 25, 10)
  sendeNachricht(mitarbeiter.id, 'chef', `„${aufgabe.titel}“ ist fertig.`, aufgabe.id)
  protokolliere(`${mitarbeiter.name} hat „${aufgabe.titel}“ abgeschlossen. +25 XP, +10 Münzen.`, 'aufgabe', mitarbeiter.id)
}

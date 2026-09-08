import type { Mitarbeiter, Ressource, Zustand } from '../typen'
import { legeAufgabeAn, loescheDatei, protokolliere, schreibeDatei, sendeNachricht } from '../daten/aktionen'
import { lies } from '../daten/speicher'

export type Werkzeugaufruf = { werkzeug: string; eingabe: Record<string, unknown>; gedanke?: string }

export type Werkzeugergebnis = {
  text: string
  /** true beendet die Aufgabe. */
  beendet?: boolean
  ergebnis?: string
  rueckfrage?: string
}

/** Beschreibung der Werkzeuge, die dieser Mitarbeiter tatsächlich hat. */
export function werkzeugKatalog(mitarbeiter: Mitarbeiter, z: Zustand): string {
  const meine = z.ressourcen.filter((r) => mitarbeiter.ressourcen.includes(r.id))
  const zeilen: string[] = []

  zeilen.push('fertig – Aufgabe abschließen. Eingabe: {"ergebnis": "das fertige Arbeitsergebnis, vollständig ausformuliert"}')
  zeilen.push('rueckfrage – nur wenn du ohne Antwort nicht weiterkommst. Eingabe: {"frage": "..."}')
  zeilen.push('notiz – kurzer Zwischenstand für den Chef. Eingabe: {"text": "..."}')

  if (meine.length > 0) {
    zeilen.push('ordner_lesen – Dateiliste einer Ressource. Eingabe: {"ressource": "<Name>"}')
    zeilen.push('datei_lesen – Inhalt einer Datei. Eingabe: {"ressource": "<Name>", "datei": "<Dateiname>"}')
  }
  if (meine.some((r) => r.schreibrecht)) {
    zeilen.push('datei_schreiben – Datei anlegen oder überschreiben. Eingabe: {"ressource": "<Name>", "datei": "<Dateiname>", "inhalt": "..."}')
  }
  if (meine.some((r) => r.art === 'email')) {
    zeilen.push('email_lesen – Posteingang auflisten oder eine Mail öffnen. Eingabe: {"betreff": "<optional>"}')
    zeilen.push('email_schreiben – Antwortentwurf ablegen, wird NICHT verschickt. Eingabe: {"an": "...", "betreff": "...", "text": "..."}')
  }

  const kollegen = z.mitarbeiter.filter((m) => m.id !== mitarbeiter.id)
  if (kollegen.length > 0) {
    zeilen.push(
      `nachricht_senden – Kollegin oder Kollege ansprechen. Eingabe: {"an": "<Name>", "text": "..."} Verfügbar: ${kollegen
        .map((m) => `${m.name} (${m.rolle})`)
        .join(', ')}`,
    )
  }
  if (mitarbeiter.darfDelegieren && kollegen.length > 0) {
    zeilen.push('aufgabe_anlegen – Teilaufgabe an eine Kollegin oder einen Kollegen übergeben. Eingabe: {"an": "<Name>", "titel": "...", "auftrag": "..."}')
  }
  return zeilen.map((z2) => `- ${z2}`).join('\n')
}

function findeRessource(mitarbeiter: Mitarbeiter, z: Zustand, name: unknown): Ressource | undefined {
  const gesucht = String(name ?? '').trim().toLowerCase()
  const meine = z.ressourcen.filter((r) => mitarbeiter.ressourcen.includes(r.id))
  if (!gesucht) return meine[0]
  return (
    meine.find((r) => r.name.toLowerCase() === gesucht) ??
    meine.find((r) => r.name.toLowerCase().includes(gesucht)) ??
    meine.find((r) => r.art === gesucht)
  )
}

function findeKollege(z: Zustand, ich: string, name: unknown): Mitarbeiter | undefined {
  const gesucht = String(name ?? '').trim().toLowerCase()
  return z.mitarbeiter.find(
    (m) => m.id !== ich && (m.name.toLowerCase() === gesucht || m.rolle.toLowerCase() === gesucht || m.id === name),
  )
}

const txt = (wert: unknown, fallback = ''): string => (typeof wert === 'string' ? wert : fallback)

export function fuehreWerkzeugAus(
  mitarbeiter: Mitarbeiter,
  aufgabeId: string,
  aufruf: Werkzeugaufruf,
): Werkzeugergebnis {
  const z = lies()
  const e = aufruf.eingabe ?? {}

  switch (aufruf.werkzeug) {
    case 'fertig': {
      const ergebnis = txt(e.ergebnis) || txt(e.text) || 'Ohne Ergebnistext abgeschlossen.'
      return { text: 'Aufgabe abgeschlossen.', beendet: true, ergebnis }
    }

    case 'rueckfrage': {
      const frage = txt(e.frage) || txt(e.text) || 'Ich brauche eine Entscheidung.'
      return { text: 'Rückfrage an den Chef gestellt.', beendet: true, rueckfrage: frage }
    }

    case 'notiz': {
      sendeNachricht(mitarbeiter.id, 'chef', txt(e.text, '(leere Notiz)'), aufgabeId)
      return { text: 'Notiz ist beim Chef.' }
    }

    case 'ordner_lesen': {
      const res = findeRessource(mitarbeiter, z, e.ressource)
      if (!res) return { text: 'Auf diese Ressource hast du keinen Zugriff.' }
      if (res.dateien.length === 0) return { text: `${res.name} ist leer.` }
      return {
        text: `${res.name} enthält:\n${res.dateien.map((d) => `- ${d.name} (${d.inhalt.length} Zeichen)`).join('\n')}`,
      }
    }

    case 'datei_lesen': {
      const res = findeRessource(mitarbeiter, z, e.ressource)
      if (!res) return { text: 'Auf diese Ressource hast du keinen Zugriff.' }
      const name = txt(e.datei).toLowerCase()
      const datei = res.dateien.find((d) => d.name.toLowerCase() === name) ?? res.dateien.find((d) => d.name.toLowerCase().includes(name))
      if (!datei) return { text: `In ${res.name} gibt es keine Datei „${txt(e.datei)}“.` }
      return { text: `${datei.name}:\n${datei.inhalt.slice(0, 6000)}` }
    }

    case 'datei_schreiben': {
      const res = findeRessource(mitarbeiter, z, e.ressource)
      if (!res) return { text: 'Auf diese Ressource hast du keinen Zugriff.' }
      if (!res.schreibrecht) return { text: `${res.name} ist nur zum Lesen freigegeben.` }
      const name = txt(e.datei, 'Ohne Titel.md')
      schreibeDatei(res.id, name, txt(e.inhalt), mitarbeiter.id)
      protokolliere(`${mitarbeiter.name} hat „${name}“ in ${res.name} abgelegt.`, 'datei', mitarbeiter.id)
      return { text: `Gespeichert: ${name} in ${res.name}.` }
    }

    case 'email_lesen': {
      const res = z.ressourcen.find((r) => r.art === 'email' && mitarbeiter.ressourcen.includes(r.id))
      if (!res) return { text: 'Du hast keinen Zugriff auf ein Postfach.' }
      const betreff = txt(e.betreff).toLowerCase()
      if (betreff) {
        const mail = res.dateien.find((d) => d.name.toLowerCase().includes(betreff))
        return mail ? { text: `${mail.name}:\n${mail.inhalt.slice(0, 6000)}` } : { text: 'Keine Mail mit diesem Betreff.' }
      }
      if (res.dateien.length === 0) return { text: 'Das Postfach ist leer.' }
      return { text: `Posteingang:\n${res.dateien.map((d) => `- ${d.name}`).join('\n')}` }
    }

    case 'email_schreiben': {
      const res = z.ressourcen.find((r) => r.art === 'email' && mitarbeiter.ressourcen.includes(r.id))
      if (!res) return { text: 'Du hast keinen Zugriff auf ein Postfach.' }
      const name = `ENTWURF an ${txt(e.an, 'unbekannt')} – ${txt(e.betreff, 'ohne Betreff')}`
      schreibeDatei(res.id, name, txt(e.text), mitarbeiter.id)
      protokolliere(`${mitarbeiter.name} hat einen Mailentwurf abgelegt: ${txt(e.betreff, 'ohne Betreff')}`, 'datei', mitarbeiter.id)
      return { text: 'Entwurf liegt im Postfach. Verschickt wird er erst, wenn du das selbst tust.' }
    }

    case 'nachricht_senden': {
      const kollege = findeKollege(z, mitarbeiter.id, e.an)
      if (!kollege) return { text: 'Diese Person arbeitet nicht hier.' }
      sendeNachricht(mitarbeiter.id, kollege.id, txt(e.text), aufgabeId)
      protokolliere(`${mitarbeiter.name} → ${kollege.name}: ${txt(e.text).slice(0, 60)}`, 'nachricht', mitarbeiter.id)
      return { text: `Nachricht an ${kollege.name} ist raus. Antworten kommen als eigene Aufgabe, warte nicht darauf.` }
    }

    case 'aufgabe_anlegen': {
      if (!mitarbeiter.darfDelegieren) return { text: 'Du darfst keine Aufgaben verteilen.' }
      const kollege = findeKollege(z, mitarbeiter.id, e.an)
      if (!kollege) return { text: 'Diese Person arbeitet nicht hier.' }
      const neue = legeAufgabeAn(txt(e.titel, 'Teilaufgabe'), txt(e.auftrag), kollege.id, aufgabeId)
      return { text: `Aufgabe „${neue.titel}“ liegt jetzt bei ${kollege.name}.` }
    }

    case 'datei_loeschen': {
      const res = findeRessource(mitarbeiter, z, e.ressource)
      const datei = res?.dateien.find((d) => d.name === txt(e.datei))
      if (!res || !datei) return { text: 'Datei nicht gefunden.' }
      loescheDatei(res.id, datei.id)
      return { text: 'Gelöscht.' }
    }

    default:
      return { text: `Das Werkzeug „${aufruf.werkzeug}“ gibt es nicht. Wähle eines aus der Liste.` }
  }
}

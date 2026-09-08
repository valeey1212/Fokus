import type { Aufgabe, Mitarbeiter, Zustand } from '../typen'
import { werkzeugKatalog } from './werkzeuge'

/** Der System-Prompt eines Mitarbeiters: Rolle, Profil, Haus­regeln, Werkzeuge. */
export function baueSystemPrompt(mitarbeiter: Mitarbeiter, z: Zustand): string {
  const meine = z.ressourcen.filter((r) => mitarbeiter.ressourcen.includes(r.id))
  const ressourcenText =
    meine.length === 0
      ? 'Du hast keinen Zugriff auf Ordner oder Programme. Arbeite aus dem Auftragstext heraus.'
      : meine.map((r) => `- ${r.name} (${r.art}${r.schreibrecht ? ', schreibend' : ', nur lesen'}): ${r.beschreibung}`).join('\n')

  return `Du bist ${mitarbeiter.name}, ${mitarbeiter.rolle} bei „${z.einstellungen.firma}“, einem Einzelunternehmen.

DEIN AUFGABENPROFIL
${mitarbeiter.profil}

DEINE RESSOURCEN
${ressourcenText}

HAUSREGELN
- Du arbeitest selbstständig und lieferst ein fertiges Ergebnis, keine Absichtserklärung.
- Du erfindest keine Fakten über das Unternehmen. Was du nicht weißt, liest du in deinen Ressourcen nach oder stellst eine Rückfrage.
- Nichts wird nach außen verschickt. E-Mails legst du als Entwurf ab.
- Du antwortest auf Deutsch.

WIE DU ARBEITEST
Du antwortest ausschließlich mit einem einzigen JSON-Objekt, ohne Text davor oder danach, ohne Code-Zaun:
{"gedanke": "ein Satz, was du gerade tust", "werkzeug": "name", "eingabe": { ... }}

Verfügbare Werkzeuge:
${werkzeugKatalog(mitarbeiter, z)}

Pro Antwort genau ein Werkzeug. Du bekommst das Ergebnis zurück und machst dann weiter.
Wenn die Arbeit erledigt ist, rufe "fertig" mit dem vollständigen Ergebnis auf – das Ergebnis selbst gehört in das Feld, nicht nur eine Beschreibung davon.`
}

/** Die erste Nutzernachricht: der Auftrag. */
export function baueAuftrag(aufgabe: Aufgabe, z: Zustand): string {
  const eltern = aufgabe.vonAufgabe ? z.aufgaben.find((a) => a.id === aufgabe.vonAufgabe) : undefined
  const posteingang = z.nachrichten
    .filter((n) => n.an === aufgabe.zugewiesenAn && n.aufgabeId === aufgabe.id)
    .slice(0, 5)
    .map((n) => {
      const von = z.mitarbeiter.find((m) => m.id === n.von)?.name ?? 'Chef'
      return `- ${von}: ${n.text}`
    })

  let text = `AUFGABE: ${aufgabe.titel}\n\n${aufgabe.auftrag}`
  if (eltern) text += `\n\nHintergrund: Diese Aufgabe gehört zu „${eltern.titel}“.`
  if (posteingang.length > 0) text += `\n\nNachrichten dazu:\n${posteingang.join('\n')}`
  if (aufgabe.antwort) text += `\n\nAntwort des Chefs auf deine Rückfrage: ${aufgabe.antwort}`
  text += '\n\nFang an. Antworte nur mit dem JSON-Objekt.'
  return text
}

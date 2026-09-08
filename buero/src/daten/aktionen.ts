import type {
  Aufgabe,
  Datei,
  Ereignis,
  Mitarbeiter,
  Mitarbeiterstatus,
  Nachricht,
  Protokollzeile,
  Ressource,
  Zustand,
} from '../typen'
import { neueId } from '../utils/id'
import { jetzt } from '../utils/zeit'
import { aendere, lies } from './speicher'

/* --- Ereignisse ------------------------------------------------------- */

export function protokolliere(text: string, art: Ereignis['art'], mitarbeiterId: string | null = null) {
  aendere((z) => ({
    ...z,
    ereignisse: [
      { id: neueId('ev-'), zeit: jetzt(), text, art, mitarbeiterId },
      ...z.ereignisse,
    ].slice(0, 300),
  }))
}

/* --- Mitarbeiter ------------------------------------------------------ */

export function freierSchreibtisch(z: Zustand): number {
  const belegt = new Set(z.mitarbeiter.map((m) => m.schreibtisch))
  let i = 0
  while (belegt.has(i)) i++
  return i
}

export function stelleEin(neu: Omit<Mitarbeiter, 'id' | 'eingestelltAm' | 'schreibtisch' | 'xp' | 'erledigt' | 'status'>) {
  const mitarbeiter: Mitarbeiter = {
    ...neu,
    id: neueId('ma-'),
    eingestelltAm: jetzt(),
    schreibtisch: freierSchreibtisch(lies()),
    xp: 0,
    erledigt: 0,
    status: 'frei',
  }
  aendere((z) => ({ ...z, mitarbeiter: [...z.mitarbeiter, mitarbeiter] }))
  protokolliere(`${mitarbeiter.name} (${mitarbeiter.rolle}) hat angefangen.`, 'einstellung', mitarbeiter.id)
  return mitarbeiter
}

export function aendereMitarbeiter(id: string, teil: Partial<Mitarbeiter>) {
  aendere((z) => ({
    ...z,
    mitarbeiter: z.mitarbeiter.map((m) => (m.id === id ? { ...m, ...teil } : m)),
  }))
}

export function setzeStatus(id: string, status: Mitarbeiterstatus) {
  aendereMitarbeiter(id, { status })
}

export function entlasse(id: string) {
  const name = lies().mitarbeiter.find((m) => m.id === id)?.name ?? 'Jemand'
  aendere((z) => ({
    ...z,
    mitarbeiter: z.mitarbeiter.filter((m) => m.id !== id),
    aufgaben: z.aufgaben.map((a) =>
      a.zugewiesenAn === id && a.status !== 'erledigt' ? { ...a, zugewiesenAn: null, status: 'offen' } : a,
    ),
  }))
  protokolliere(`${name} hat das Büro verlassen. Offene Aufgaben liegen wieder frei.`, 'einstellung')
}

/** XP vergeben, Rang und Bürostufe ergeben sich daraus. */
export function gibXp(mitarbeiterId: string, xp: number, muenzen: number) {
  aendere((z) => ({
    ...z,
    mitarbeiter: z.mitarbeiter.map((m) =>
      m.id === mitarbeiterId ? { ...m, xp: m.xp + xp, erledigt: m.erledigt + 1 } : m,
    ),
    buero: {
      ...z.buero,
      xp: z.buero.xp + xp,
      muenzen: z.buero.muenzen + muenzen,
      stufe: Math.max(1, Math.floor((z.buero.xp + xp) / 200) + 1),
    },
  }))
}

/* --- Aufgaben --------------------------------------------------------- */

export function legeAufgabeAn(
  titel: string,
  auftrag: string,
  zugewiesenAn: string | null,
  vonAufgabe: string | null = null,
): Aufgabe {
  const aufgabe: Aufgabe = {
    id: neueId('auf-'),
    titel,
    auftrag,
    zugewiesenAn,
    status: 'offen',
    ergebnis: null,
    rueckfrage: null,
    antwort: null,
    protokoll: [],
    vonAufgabe,
    erstelltAm: jetzt(),
    erledigtAm: null,
  }
  aendere((z) => ({ ...z, aufgaben: [aufgabe, ...z.aufgaben] }))
  protokolliere(`Neue Aufgabe: „${titel}“`, 'aufgabe', zugewiesenAn)
  return aufgabe
}

export function aendereAufgabe(id: string, teil: Partial<Aufgabe>) {
  aendere((z) => ({ ...z, aufgaben: z.aufgaben.map((a) => (a.id === id ? { ...a, ...teil } : a)) }))
}

export function ergaenzeProtokoll(aufgabeId: string, zeile: Omit<Protokollzeile, 'zeit'>) {
  aendere((z) => ({
    ...z,
    aufgaben: z.aufgaben.map((a) =>
      a.id === aufgabeId ? { ...a, protokoll: [...a.protokoll, { ...zeile, zeit: jetzt() }] } : a,
    ),
  }))
}

export function loescheAufgabe(id: string) {
  aendere((z) => ({ ...z, aufgaben: z.aufgaben.filter((a) => a.id !== id) }))
}

/* --- Nachrichten ------------------------------------------------------ */

export function sendeNachricht(von: string, an: string, text: string, aufgabeId: string | null = null) {
  const nachricht: Nachricht = {
    id: neueId('na-'),
    von,
    an,
    text,
    zeit: jetzt(),
    aufgabeId,
    gelesen: false,
  }
  aendere((z) => ({ ...z, nachrichten: [nachricht, ...z.nachrichten].slice(0, 500) }))
  return nachricht
}

export function markiereGelesen(an: string) {
  aendere((z) => ({
    ...z,
    nachrichten: z.nachrichten.map((n) => (n.an === an ? { ...n, gelesen: true } : n)),
  }))
}

/* --- Ressourcen ------------------------------------------------------- */

export function legeRessourceAn(art: Ressource['art'], name: string, beschreibung: string) {
  const ressource: Ressource = {
    id: neueId('res-'),
    art,
    name,
    beschreibung,
    dateien: [],
    schreibrecht: true,
  }
  aendere((z) => ({ ...z, ressourcen: [...z.ressourcen, ressource] }))
  return ressource
}

export function aendereRessource(id: string, teil: Partial<Ressource>) {
  aendere((z) => ({ ...z, ressourcen: z.ressourcen.map((r) => (r.id === id ? { ...r, ...teil } : r)) }))
}

export function loescheRessource(id: string) {
  aendere((z) => ({
    ...z,
    ressourcen: z.ressourcen.filter((r) => r.id !== id),
    mitarbeiter: z.mitarbeiter.map((m) => ({ ...m, ressourcen: m.ressourcen.filter((x) => x !== id) })),
  }))
}

export function schreibeDatei(ressourceId: string, name: string, inhalt: string, vonMitarbeiter: string | null) {
  const datei: Datei = { id: neueId('dat-'), name, inhalt, geaendertAm: jetzt(), vonMitarbeiter }
  aendere((z) => ({
    ...z,
    ressourcen: z.ressourcen.map((r) => {
      if (r.id !== ressourceId) return r
      const vorhanden = r.dateien.findIndex((d) => d.name === name)
      if (vorhanden >= 0) {
        const kopie = [...r.dateien]
        kopie[vorhanden] = { ...kopie[vorhanden], inhalt, geaendertAm: datei.geaendertAm, vonMitarbeiter }
        return { ...r, dateien: kopie }
      }
      return { ...r, dateien: [datei, ...r.dateien] }
    }),
  }))
  return datei
}

export function loescheDatei(ressourceId: string, dateiId: string) {
  aendere((z) => ({
    ...z,
    ressourcen: z.ressourcen.map((r) =>
      r.id === ressourceId ? { ...r, dateien: r.dateien.filter((d) => d.id !== dateiId) } : r,
    ),
  }))
}

/* --- Möbel und Einstellungen ------------------------------------------ */

export function kaufeMoebel(id: string) {
  aendere((z) => {
    const stueck = z.moebel.find((m) => m.id === id)
    if (!stueck || stueck.gekauft || z.buero.muenzen < stueck.preis) return z
    return {
      ...z,
      moebel: z.moebel.map((m) => (m.id === id ? { ...m, gekauft: true } : m)),
      buero: { ...z.buero, muenzen: z.buero.muenzen - stueck.preis },
    }
  })
}

export function aendereEinstellungen(teil: Partial<Zustand['einstellungen']>) {
  aendere((z) => ({ ...z, einstellungen: { ...z.einstellungen, ...teil } }))
}

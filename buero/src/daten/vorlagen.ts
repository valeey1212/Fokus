import type { Mitarbeiter, Moebelstueck, Ressource, Zustand } from '../typen'
import { neueId } from '../utils/id'
import { jetzt } from '../utils/zeit'

/** Bewerbervorlagen für das Einstellungsgespräch. */
export type Rollenvorlage = {
  rolle: string
  kurz: string
  profil: string
  aussehen: number
  vorschlagRessourcen: Ressource['art'][]
}

export const ROLLENVORLAGEN: Rollenvorlage[] = [
  {
    rolle: 'Assistenz',
    kurz: 'Sortiert Post, plant Termine, hält dir den Rücken frei.',
    aussehen: 0,
    vorschlagRessourcen: ['email', 'kalender', 'notizen'],
    profil:
      'Du bist die Assistenz eines Einzelunternehmens. Du liest Eingänge, fasst sie in drei Sätzen zusammen, schlägst konkrete nächste Schritte vor und schreibst Antwortentwürfe. Du entscheidest nichts Verbindliches ohne Rückfrage. Du schreibst kurz, höflich und auf Deutsch.',
  },
  {
    rolle: 'Buchhaltung',
    kurz: 'Belege, Rechnungen, Zahlen ordnen.',
    aussehen: 1,
    vorschlagRessourcen: ['ordner', 'email'],
    profil:
      'Du bist für die vorbereitende Buchhaltung zuständig. Du ordnest Belege, erstellst Rechnungsentwürfe, prüfst Beträge und Fristen und legst Ergebnisse als Datei im Ordner ab. Du rechnest sorgfältig und weist auf Unklarheiten hin, statt sie zu raten. Du bist kein Steuerberater und sagst das, wenn es relevant wird.',
  },
  {
    rolle: 'Texter',
    kurz: 'Schreibt Website, Angebote, Social Posts.',
    aussehen: 2,
    vorschlagRessourcen: ['ordner', 'notizen'],
    profil:
      'Du schreibst Texte für das Unternehmen: Angebote, Website-Abschnitte, Beiträge. Du schreibst klar, ohne Werbefloskeln, ohne Superlative. Du lieferst immer einen fertigen Text, keine Gliederung, es sei denn, es wird ausdrücklich anders verlangt.',
  },
  {
    rolle: 'Recherche',
    kurz: 'Sammelt Fakten, vergleicht, fasst zusammen.',
    aussehen: 3,
    vorschlagRessourcen: ['ordner', 'notizen'],
    profil:
      'Du recherchierst und vergleichst. Du trennst sauber zwischen dem, was du sicher weißt, und dem, was du vermutest. Ergebnisse legst du als übersichtliche Datei im Ordner ab: Fragestellung, Befunde, offene Punkte.',
  },
  {
    rolle: 'Vertrieb',
    kurz: 'Kundenanfragen, Angebote, Nachfassen.',
    aussehen: 4,
    vorschlagRessourcen: ['email', 'ordner', 'kalender'],
    profil:
      'Du kümmerst dich um Anfragen und Angebote. Du antwortest freundlich und konkret, nennst Preise nur, wenn sie in den Unterlagen stehen, und schlägst sonst ein kurzes Gespräch vor. Du schreibst Entwürfe, verschickst nie ungefragt.',
  },
  {
    rolle: 'Projektleitung',
    kurz: 'Zerlegt Vorhaben und verteilt sie im Büro.',
    aussehen: 5,
    vorschlagRessourcen: ['notizen', 'ordner', 'kalender'],
    profil:
      'Du zerlegst größere Vorhaben in klar benannte Einzelaufgaben und verteilst sie an die passenden Kolleginnen und Kollegen. Jede Aufgabe, die du anlegst, enthält Ziel, nötigen Kontext und ein erkennbares Fertig-Kriterium. Du arbeitest nicht selbst am Inhalt, wenn jemand anderes besser passt.',
  },
  {
    rolle: 'Technik',
    kurz: 'Skripte, Automatisierung, kleine Werkzeuge.',
    aussehen: 6,
    vorschlagRessourcen: ['ordner', 'notizen'],
    profil:
      'Du bist für technische Kleinarbeit zuständig: Skripte, Vorlagen, Automatisierungen. Du lieferst lauffähigen Code mit kurzer Erklärung, wie er benutzt wird, und legst ihn als Datei ab.',
  },
  {
    rolle: 'Empfang',
    kurz: 'Erste Sichtung, verteilt an die Richtigen.',
    aussehen: 7,
    vorschlagRessourcen: ['email'],
    profil:
      'Du sichtest, was neu hereinkommt, und entscheidest, wen es betrifft. Du beantwortest nichts inhaltlich selbst, sondern fasst zusammen und gibst weiter. Kurz, sachlich, deutsch.',
  },
]

export const VORNAMEN = [
  'Mara', 'Jonas', 'Elif', 'Nils', 'Sara', 'Tom', 'Lena', 'Kai',
  'Ida', 'Bo', 'Nora', 'Ruben', 'Emil', 'Alva', 'Timo', 'Juna',
]

function standardRessourcen(): Ressource[] {
  return [
    {
      id: 'res-posteingang',
      art: 'email',
      name: 'Posteingang',
      beschreibung: 'E-Mails des Unternehmens. Entwürfe landen hier, verschickt wird nur von dir.',
      schreibrecht: true,
      dateien: [],
    },
    {
      id: 'res-unterlagen',
      art: 'ordner',
      name: 'Unterlagen',
      beschreibung: 'Allgemeiner Firmenordner: Angebote, Texte, Vorlagen.',
      schreibrecht: true,
      dateien: [],
    },
    {
      id: 'res-notizen',
      art: 'notizen',
      name: 'Notizen',
      beschreibung: 'Kurze Merkzettel für das ganze Büro.',
      schreibrecht: true,
      dateien: [],
    },
    {
      id: 'res-kalender',
      art: 'kalender',
      name: 'Kalender',
      beschreibung: 'Termine als einfache Textzeilen.',
      schreibrecht: true,
      dateien: [],
    },
  ]
}

function standardMoebel(): Moebelstueck[] {
  return [
    { id: 'm-pflanze', name: 'Monstera', preis: 20, x: 4, y: 60, gekauft: false },
    { id: 'm-kaffee', name: 'Kaffeemaschine', preis: 40, x: 6, y: 108, gekauft: false },
    { id: 'm-regal', name: 'Aktenregal', preis: 60, x: 212, y: 140, gekauft: false },
    { id: 'm-sofa', name: 'Sofa-Ecke', preis: 90, x: 208, y: 60, gekauft: false },
    { id: 'm-whiteboard', name: 'Whiteboard', preis: 70, x: 106, y: 12, gekauft: false },
    { id: 'm-teppich', name: 'Teppich', preis: 50, x: 4, y: 150, gekauft: false },
  ]
}

export function ersterMitarbeiter(): Mitarbeiter {
  const vorlage = ROLLENVORLAGEN[0]
  return {
    id: neueId('ma-'),
    name: 'Mara',
    rolle: vorlage.rolle,
    aussehen: vorlage.aussehen,
    profil: vorlage.profil,
    verbindung: { modus: 'api', modell: 'claude-sonnet-5' },
    ressourcen: ['res-posteingang', 'res-notizen', 'res-kalender'],
    darfDelegieren: false,
    status: 'frei',
    xp: 0,
    erledigt: 0,
    schreibtisch: 0,
    eingestelltAm: jetzt(),
  }
}

export function startZustand(): Zustand {
  return {
    version: 1,
    mitarbeiter: [ersterMitarbeiter()],
    aufgaben: [],
    ressourcen: standardRessourcen(),
    nachrichten: [],
    ereignisse: [
      {
        id: neueId('ev-'),
        zeit: jetzt(),
        text: 'Büro eröffnet. Mara hat als Erste angefangen.',
        mitarbeiterId: null,
        art: 'einstellung',
      },
    ],
    moebel: standardMoebel(),
    einstellungen: {
      firma: 'Mein Büro',
      anthropicSchluessel: '',
      freierSchluessel: '',
      freieBasisUrl: 'https://openrouter.ai/api/v1',
      freiesStandardmodell: 'meta-llama/llama-3.3-70b-instruct:free',
      brueckeUrl: 'http://localhost:4179',
      ton: true,
      gleichzeitig: 2,
      maxSchritte: 12,
    },
    buero: { muenzen: 60, stufe: 1, xp: 0 },
  }
}

// Datenmodell des KI-Agenten-Büros. Alles wird lokal in IndexedDB gehalten.

export type Verbindungsmodus = 'abo' | 'api' | 'frei'

/** Wie ein einzelner Mitarbeiter an ein Modell angeschlossen ist. */
export type Verbindung = {
  modus: Verbindungsmodus
  /** Modell-Kennung, z. B. "claude-sonnet-5" oder "meta-llama/llama-3.3-70b-instruct:free". */
  modell: string
  /** Nur bei "api"/"frei": eigener Schlüssel. Leer heißt: Schlüssel aus den Einstellungen. */
  schluessel?: string
  /** Nur bei "frei": OpenAI-kompatibler Endpunkt. Leer heißt: Standard aus den Einstellungen. */
  basisUrl?: string
}

export type Werkzeugname =
  | 'ordner_lesen'
  | 'datei_lesen'
  | 'datei_schreiben'
  | 'email_lesen'
  | 'email_schreiben'
  | 'nachricht_senden'
  | 'aufgabe_anlegen'
  | 'notiz'
  | 'fertig'
  | 'rueckfrage'

export type Rang = 'Praktikum' | 'Junior' | 'Profi' | 'Senior' | 'Leitung'

export type Mitarbeiterstatus = 'frei' | 'arbeitet' | 'wartet' | 'pause'

export type Mitarbeiter = {
  id: string
  name: string
  rolle: string
  /** Index in die Sprite-Palette (Aussehen). */
  aussehen: number
  /** Aufgabenprofil = System-Prompt in Alltagssprache. */
  profil: string
  verbindung: Verbindung
  /** Ressourcen-IDs, auf die der Mitarbeiter zugreifen darf. */
  ressourcen: string[]
  /** Kollegen-IDs, denen er Aufgaben geben darf. Leer = allen schreiben, niemandem befehlen. */
  darfDelegieren: boolean
  status: Mitarbeiterstatus
  xp: number
  erledigt: number
  schreibtisch: number
  eingestelltAm: string
}

export type Aufgabenstatus = 'offen' | 'laeuft' | 'rueckfrage' | 'erledigt' | 'abgebrochen'

export type Protokollzeile = {
  zeit: string
  art: 'gedanke' | 'werkzeug' | 'ergebnis' | 'fehler' | 'system'
  text: string
}

export type Aufgabe = {
  id: string
  titel: string
  auftrag: string
  zugewiesenAn: string | null
  status: Aufgabenstatus
  ergebnis: string | null
  rueckfrage: string | null
  /** Antwort des Chefs auf eine Rückfrage. */
  antwort: string | null
  protokoll: Protokollzeile[]
  vonAufgabe: string | null
  erstelltAm: string
  erledigtAm: string | null
}

export type Ressourcenart = 'ordner' | 'email' | 'kalender' | 'notizen'

export type Datei = {
  id: string
  name: string
  inhalt: string
  geaendertAm: string
  vonMitarbeiter: string | null
}

export type Ressource = {
  id: string
  art: Ressourcenart
  name: string
  beschreibung: string
  dateien: Datei[]
  /** true = Mitarbeiter dürfen schreiben, false = nur lesen. */
  schreibrecht: boolean
}

export type Nachricht = {
  id: string
  von: string // Mitarbeiter-ID oder 'chef'
  an: string // Mitarbeiter-ID oder 'chef'
  text: string
  zeit: string
  aufgabeId: string | null
  gelesen: boolean
}

export type Ereignis = {
  id: string
  zeit: string
  text: string
  mitarbeiterId: string | null
  art: 'einstellung' | 'aufgabe' | 'nachricht' | 'datei' | 'stufe' | 'fehler' | 'kauf'
}

export type Moebelstueck = {
  id: string
  name: string
  preis: number
  /** Position im Büro, in Bildpunkten des Raums (256 x 190). */
  x: number
  y: number
  gekauft: boolean
}

export type Einstellungen = {
  firma: string
  /** Gemeinsamer Anthropic-Schlüssel für den Modus "api". */
  anthropicSchluessel: string
  /** Gemeinsamer Schlüssel für kostenlose, OpenAI-kompatible Modelle. */
  freierSchluessel: string
  freieBasisUrl: string
  freiesStandardmodell: string
  /** Adresse der lokalen Brücke für den Abo-Modus. */
  brueckeUrl: string
  ton: boolean
  /** Wie viele Agenten gleichzeitig arbeiten dürfen. */
  gleichzeitig: number
  /** Sicherheitsnetz: maximale Werkzeugschritte pro Aufgabe. */
  maxSchritte: number
}

export type Buerostand = {
  muenzen: number
  stufe: number
  xp: number
}

export type Zustand = {
  version: number
  mitarbeiter: Mitarbeiter[]
  aufgaben: Aufgabe[]
  ressourcen: Ressource[]
  nachrichten: Nachricht[]
  ereignisse: Ereignis[]
  moebel: Moebelstueck[]
  einstellungen: Einstellungen
  buero: Buerostand
}

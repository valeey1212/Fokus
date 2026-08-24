// Zentrales Datenmodell der App. Alles ISO-Datum als string, damit es sich
// verlustfrei nach IndexedDB und in den JSON-Export schreiben lässt.

export type Spalte = 'ablage' | 'naechstes' | 'aktiv' | 'fertig'

export type Keeper = {
  id: string
  inhalt: string
  typ: 'text' | 'audio' | 'link' | 'foto'
  erstelltAm: string
  status: 'offen' | 'sortiert'
  ziel?: 'board' | 'todo' | 'einkauf' | 'ablage'
  zielId?: string
}

export type Schritt = {
  id: string
  text: string
  erledigtAm: string | null
}

export type Karte = {
  id: string
  titel: string
  fertigWenn: string
  spalte: Spalte
  schritte: Schritt[]
  heuteBis?: string
  aktivSeit?: string
  wunschtermin: string | null
  frist: string | null
  letzteSessionAm: string | null
  uebergangen: number
  erstelltAm: string
  abgeschlossenAm: string | null
  // Zeitpunkt der letzten "Aktiv lassen"-Bestätigung bei der 7-Tage-Erneuerung.
  // Nicht im ursprünglichen Datenmodell, aber nötig, damit die Frage nach einem
  // "Aktiv lassen" wirklich erst in 7 Tagen wiederkommt, ohne letzteSessionAm
  // zu verfälschen (das bleibt der Wahrheit über echte Sessions vorbehalten).
  erneuerungBestaetigtAm: string | null
}

export type Eintrag = {
  id: string
  listenTyp: 'todo' | 'einkauf'
  text: string
  erledigt: boolean
  bereich?: string
  faelligAm?: string
  wiederholung?: 'taeglich' | 'woechentlich' | 'monatlich'
}

export type Stammartikel = {
  id: string
  text: string
  bereich: string
  haeufigkeit: number
}

export type Session = {
  id: string
  karteId: string
  start: string
  dauerMin: number
  abgeschlossen: boolean
  strikt: boolean
}

export type Einstellungen = {
  plaetze: 1 | 2 | 3
  dauerMin: number
  strikt: boolean
  bereiche: string[]
}

export type Zustand = {
  keeper: Keeper[]
  karten: Karte[]
  eintraege: Eintrag[]
  stammartikel: Stammartikel[]
  sessions: Session[]
  einstellungen: Einstellungen
}

export const ANFANGSZUSTAND: Zustand = {
  keeper: [],
  karten: [],
  eintraege: [],
  stammartikel: [],
  sessions: [],
  einstellungen: {
    plaetze: 3,
    dauerMin: 25,
    strikt: false,
    bereiche: [],
  },
}

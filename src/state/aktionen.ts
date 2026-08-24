import type { Karte, Keeper, Session, Zustand } from '../types'

export type Aktion =
  | { typ: 'ZUSTAND_ERSETZT'; zustand: Zustand }
  | { typ: 'KEEPER_HINZUGEFUEGT'; inhalt: string }
  | { typ: 'KEEPER_SORTIERT'; id: string; ziel: NonNullable<Keeper['ziel']>; zielId?: string }
  | { typ: 'KEEPER_GELOESCHT'; id: string }
  | { typ: 'KARTE_ANGELEGT'; karte: Karte }
  | { typ: 'KARTE_AKTUALISIERT'; id: string; patch: Partial<Karte> }
  | { typ: 'KARTE_GELOESCHT'; id: string }
  | { typ: 'KARTE_AKTIVIERT'; id: string; nurHeute?: boolean }
  | {
      typ: 'KARTE_GETAUSCHT'
      hineinId: string
      hinausId: string
      hinausWohin: 'naechstes' | 'ablage'
      nurHeute?: boolean
    }
  | { typ: 'KARTE_GEPARKT'; id: string }
  | { typ: 'KARTE_IN_NAECHSTES'; id: string }
  | { typ: 'KARTE_ABGESCHLOSSEN'; id: string }
  | { typ: 'SCHRITT_HINZUGEFUEGT'; karteId: string; text: string }
  | { typ: 'SCHRITT_UMGESCHALTET'; karteId: string; schrittId: string }
  | { typ: 'HEUTE_PLATZ_ABGELAUFEN'; id: string }
  | { typ: 'SESSION_GESTARTET'; session: Session }
  | { typ: 'SESSION_BEENDET'; sessionId: string; karteId: string; abgeschlossen: boolean }

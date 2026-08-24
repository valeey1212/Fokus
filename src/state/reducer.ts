import type { Karte, Zustand } from '../types'
import { heuteEndeIso } from '../utils/datum'
import type { Aktion } from './aktionen'

const MAX_SCHRITTE = 7

function karteAendern(zustand: Zustand, id: string, aenderung: (karte: Karte) => Karte): Zustand {
  return {
    ...zustand,
    karten: zustand.karten.map((k) => (k.id === id ? aenderung(k) : k)),
  }
}

export function reducer(zustand: Zustand, aktion: Aktion): Zustand {
  switch (aktion.typ) {
    case 'ZUSTAND_ERSETZT':
      return aktion.zustand

    case 'KEEPER_HINZUGEFUEGT': {
      const inhalt = aktion.inhalt.trim()
      if (!inhalt) return zustand
      return {
        ...zustand,
        keeper: [
          {
            id: crypto.randomUUID(),
            inhalt,
            typ: 'text',
            erstelltAm: new Date().toISOString(),
            status: 'offen',
          },
          ...zustand.keeper,
        ],
      }
    }

    case 'KEEPER_SORTIERT':
      return {
        ...zustand,
        keeper: zustand.keeper.map((k) =>
          k.id === aktion.id ? { ...k, status: 'sortiert', ziel: aktion.ziel, zielId: aktion.zielId } : k,
        ),
      }

    case 'KEEPER_GELOESCHT':
      return { ...zustand, keeper: zustand.keeper.filter((k) => k.id !== aktion.id) }

    case 'KARTE_ANGELEGT':
      return { ...zustand, karten: [aktion.karte, ...zustand.karten] }

    case 'KARTE_AKTUALISIERT':
      return karteAendern(zustand, aktion.id, (k) => ({ ...k, ...aktion.patch }))

    case 'KARTE_GELOESCHT':
      return { ...zustand, karten: zustand.karten.filter((k) => k.id !== aktion.id) }

    case 'KARTE_AKTIVIERT':
      return karteAendern(zustand, aktion.id, (k) => ({
        ...k,
        spalte: 'aktiv',
        aktivSeit: new Date().toISOString(),
        heuteBis: aktion.nurHeute ? heuteEndeIso() : undefined,
        erneuerungBestaetigtAm: null,
      }))

    case 'KARTE_GETAUSCHT': {
      let z = karteAendern(zustand, aktion.hinausId, (k) => ({
        ...k,
        spalte: aktion.hinausWohin,
        aktivSeit: undefined,
        heuteBis: undefined,
      }))
      z = karteAendern(z, aktion.hineinId, (k) => ({
        ...k,
        spalte: 'aktiv',
        aktivSeit: new Date().toISOString(),
        heuteBis: aktion.nurHeute ? heuteEndeIso() : undefined,
        erneuerungBestaetigtAm: null,
      }))
      return z
    }

    case 'KARTE_GEPARKT':
      return karteAendern(zustand, aktion.id, (k) => ({
        ...k,
        spalte: 'ablage',
        aktivSeit: undefined,
        heuteBis: undefined,
      }))

    case 'KARTE_IN_NAECHSTES':
      return karteAendern(zustand, aktion.id, (k) => ({
        ...k,
        spalte: 'naechstes',
        aktivSeit: undefined,
        heuteBis: undefined,
      }))

    case 'KARTE_ABGESCHLOSSEN':
      return karteAendern(zustand, aktion.id, (k) => ({
        ...k,
        spalte: 'fertig',
        abgeschlossenAm: new Date().toISOString(),
        aktivSeit: undefined,
        heuteBis: undefined,
      }))

    case 'SCHRITT_HINZUGEFUEGT':
      return karteAendern(zustand, aktion.karteId, (k) => {
        if (k.schritte.length >= MAX_SCHRITTE) return k
        const text = aktion.text.trim()
        if (!text) return k
        return {
          ...k,
          schritte: [...k.schritte, { id: crypto.randomUUID(), text, erledigtAm: null }],
        }
      })

    case 'SCHRITT_UMGESCHALTET':
      return karteAendern(zustand, aktion.karteId, (k) => ({
        ...k,
        schritte: k.schritte.map((s) =>
          s.id === aktion.schrittId ? { ...s, erledigtAm: s.erledigtAm ? null : new Date().toISOString() } : s,
        ),
      }))

    case 'HEUTE_PLATZ_ABGELAUFEN':
      return karteAendern(zustand, aktion.id, (k) => ({
        ...k,
        spalte: 'naechstes',
        aktivSeit: undefined,
        heuteBis: undefined,
      }))

    case 'SESSION_GESTARTET': {
      let z: Zustand = { ...zustand, sessions: [aktion.session, ...zustand.sessions] }
      z = karteAendern(z, aktion.session.karteId, (k) => ({ ...k, uebergangen: 0 }))
      return z
    }

    case 'SESSION_BEENDET': {
      let z: Zustand = {
        ...zustand,
        sessions: zustand.sessions.map((s) =>
          s.id === aktion.sessionId ? { ...s, abgeschlossen: aktion.abgeschlossen } : s,
        ),
      }
      z = karteAendern(z, aktion.karteId, (k) => ({ ...k, letzteSessionAm: new Date().toISOString() }))
      return z
    }

    default:
      return zustand
  }
}

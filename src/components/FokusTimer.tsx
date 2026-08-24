import { useEffect, useRef, useState } from 'react'
import { neueId } from '../utils/id'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import type { Session } from '../types'
import './FokusTimer.css'

type Ansicht = 'timer' | 'keeper' | 'frage' | 'abschluss-frage' | 'abbruch'

export function FokusTimer({ karteId }: { karteId: string }) {
  const { zustand, dispatch } = useZustand()
  const { schliesse, oeffne } = useUi()
  const karte = zustand.karten.find((k) => k.id === karteId)

  const dauerMs = zustand.einstellungen.dauerMin * 60_000
  const startRef = useRef(Date.now())
  const sessionIdRef = useRef(neueId())
  const [restMs, setRestMs] = useState(dauerMs)
  const [ansicht, setAnsicht] = useState<Ansicht>('timer')
  const [keeperInhalt, setKeeperInhalt] = useState('')
  const beendetRef = useRef(false)
  const gestartetRef = useRef(false)

  useEffect(() => {
    // Schutz gegen doppeltes Auslösen durch React StrictMode im Dev-Modus
    // (Effekt ohne Cleanup wird dort testweise zweimal ausgeführt).
    if (gestartetRef.current) return
    gestartetRef.current = true
    const session: Session = {
      id: sessionIdRef.current,
      karteId,
      start: new Date(startRef.current).toISOString(),
      dauerMin: zustand.einstellungen.dauerMin,
      abgeschlossen: false,
      strikt: zustand.einstellungen.strikt,
    }
    dispatch({ typ: 'SESSION_GESTARTET', session })
    // Nur beim Start der Session ausführen, nicht bei jeder Zustandsänderung.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const intervall = setInterval(() => {
      const rest = dauerMs - (Date.now() - startRef.current)
      setRestMs(rest)
      if (rest <= 0) {
        clearInterval(intervall)
        beendenMitErgebnis(true)
      }
    }, 1000)
    return () => clearInterval(intervall)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    if ('wakeLock' in navigator) {
      navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {})
    }
    return () => {
      lock?.release().catch(() => {})
    }
  }, [])

  useEffect(() => {
    if (!zustand.einstellungen.strikt) return
    function beiSichtbarkeitswechsel() {
      if (document.hidden) beendenMitErgebnis(false)
    }
    document.addEventListener('visibilitychange', beiSichtbarkeitswechsel)
    return () => document.removeEventListener('visibilitychange', beiSichtbarkeitswechsel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zustand.einstellungen.strikt])

  function beendenMitErgebnis(abgeschlossen: boolean) {
    if (beendetRef.current) return
    beendetRef.current = true
    dispatch({ typ: 'SESSION_BEENDET', sessionId: sessionIdRef.current, karteId, abgeschlossen })
    setAnsicht(abgeschlossen ? 'frage' : 'abbruch')
  }

  function abbrechen() {
    beendenMitErgebnis(false)
  }

  useEffect(() => {
    if (ansicht !== 'abbruch') return
    const timeout = setTimeout(() => schliesse(), 1300)
    return () => clearTimeout(timeout)
  }, [ansicht, schliesse])

  if (!karte) return null

  const aktuellerSchritt = karte.schritte.find((s) => !s.erledigtAm)
  const restSek = Math.max(0, Math.round(restMs / 1000))
  const minuten = String(Math.floor(restSek / 60)).padStart(2, '0')
  const sekunden = String(restSek % 60).padStart(2, '0')

  function schrittErledigt() {
    if (aktuellerSchritt) {
      dispatch({ typ: 'SCHRITT_UMGESCHALTET', karteId, schrittId: aktuellerSchritt.id })
      const alleAnderenErledigt = karte!.schritte
        .filter((s) => s.id !== aktuellerSchritt.id)
        .every((s) => s.erledigtAm)
      if (alleAnderenErledigt) {
        setAnsicht('abschluss-frage')
        return
      }
    }
    schliesse()
  }

  function naechstenSchrittAendern() {
    schliesse()
    oeffne({ art: 'kartendetail', karteId })
  }

  function karteAbschliessen() {
    dispatch({ typ: 'KARTE_ABGESCHLOSSEN', id: karteId })
    schliesse()
  }

  function keeperSpeichern() {
    if (keeperInhalt.trim()) {
      dispatch({ typ: 'KEEPER_HINZUGEFUEGT', inhalt: keeperInhalt })
    }
    setKeeperInhalt('')
    setAnsicht('timer')
  }

  return (
    <div className="vollbild fokus-timer">
      {ansicht === 'timer' && (
        <>
          <div className="fokus-timer-kopf">
            <button className="button-text" onClick={abbrechen}>
              Beenden
            </button>
          </div>
          <div className="fokus-timer-mitte">
            <p className="fokus-timer-titel">{karte.titel}</p>
            {aktuellerSchritt && <p className="fokus-timer-schritt">{aktuellerSchritt.text}</p>}
            <p className="mono fokus-timer-zeit">
              {minuten}:{sekunden}
            </p>
          </div>
          <div className="fokus-timer-fuss">
            <button className="button-sekundaer" onClick={() => setAnsicht('keeper')}>
              Gedanke festhalten
            </button>
          </div>
        </>
      )}

      {ansicht === 'keeper' && (
        <div className="fokus-timer-keeper">
          <p className="mono fokus-timer-zeit-klein">
            {minuten}:{sekunden}
          </p>
          <textarea
            autoFocus
            className="fokus-timer-keeper-feld"
            placeholder="Was geht dir gerade durch den Kopf?"
            value={keeperInhalt}
            onChange={(e) => setKeeperInhalt(e.target.value)}
          />
          <div className="fokus-timer-keeper-fuss">
            <button className="button-text" onClick={() => setAnsicht('timer')}>
              Zurück zum Timer
            </button>
            <button className="button-primaer" onClick={keeperSpeichern} disabled={!keeperInhalt.trim()}>
              Speichern
            </button>
          </div>
        </div>
      )}

      {ansicht === 'frage' && (
        <div className="fokus-timer-frage">
          <p className="fokus-timer-frage-titel">Schritt erledigt?</p>
          <button className="button-primaer" onClick={schrittErledigt}>
            Schritt erledigt
          </button>
          <button className="button-sekundaer" onClick={naechstenSchrittAendern}>
            Nächsten Schritt ändern
          </button>
          <button className="button-sekundaer" onClick={karteAbschliessen}>
            Karte ist fertig
          </button>
        </div>
      )}

      {ansicht === 'abschluss-frage' && (
        <div className="fokus-timer-frage">
          <p className="fokus-timer-frage-titel">Alle Schritte erledigt.</p>
          {karte.fertigWenn && <p className="fokus-timer-frage-hinweis">Fertig wenn: {karte.fertigWenn}</p>}
          <button className="button-primaer" onClick={karteAbschliessen}>
            Karte abschließen
          </button>
          <button className="button-sekundaer" onClick={schliesse}>
            Noch nicht
          </button>
        </div>
      )}

      {ansicht === 'abbruch' && (
        <div className="fokus-timer-abbruch">
          <p>Ok. Weiter, wenn du magst.</p>
        </div>
      )}
    </div>
  )
}

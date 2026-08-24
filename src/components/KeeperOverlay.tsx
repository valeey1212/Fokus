import { useEffect, useRef, useState } from 'react'
import { useZustand } from '../state/ZustandContext'
import { useUi } from '../state/UiContext'
import './KeeperOverlay.css'

export function KeeperOverlay() {
  const { dispatch } = useZustand()
  const { schliesse } = useUi()
  const [inhalt, setInhalt] = useState('')
  const feldRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    feldRef.current?.focus()
  }, [])

  function speichern() {
    if (inhalt.trim()) {
      dispatch({ typ: 'KEEPER_HINZUGEFUEGT', inhalt })
    }
    schliesse()
  }

  return (
    <div className="vollbild keeper-overlay">
      <div className="keeper-overlay-kopf">
        <button className="button-text" onClick={schliesse}>
          Abbrechen
        </button>
      </div>
      <textarea
        ref={feldRef}
        className="keeper-overlay-feld"
        placeholder="Was geht dir gerade durch den Kopf?"
        value={inhalt}
        onChange={(e) => setInhalt(e.target.value)}
      />
      <div className="keeper-overlay-fuss">
        <button className="button-primaer" onClick={speichern} disabled={!inhalt.trim()}>
          Speichern
        </button>
      </div>
    </div>
  )
}

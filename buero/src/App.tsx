import { useState } from 'react'
import './App.css'
import { useGeladen, useZustand } from './komponenten/useZustand'
import { Buero } from './screens/Buero'
import { Aufgaben } from './screens/Aufgaben'
import { Postfach } from './screens/Postfach'
import { Ressourcen } from './screens/Ressourcen'
import { Einstellungen } from './screens/Einstellungen'

type Reiter = 'buero' | 'aufgaben' | 'postfach' | 'ordner' | 'einstellungen'

const REITER: { id: Reiter; text: string }[] = [
  { id: 'buero', text: 'Büro' },
  { id: 'aufgaben', text: 'Aufgaben' },
  { id: 'postfach', text: 'Postfach' },
  { id: 'ordner', text: 'Ordner' },
  { id: 'einstellungen', text: 'Setup' },
]

export function App() {
  const geladen = useGeladen()
  const zustand = useZustand()
  const [reiter, setReiter] = useState<Reiter>('buero')

  if (!geladen) {
    return (
      <div className="ladebild">
        <p>Büro wird aufgeschlossen …</p>
      </div>
    )
  }

  const ungelesen = zustand.nachrichten.filter((n) => n.an === 'chef' && !n.gelesen).length
  const rueckfragen = zustand.aufgaben.filter((a) => a.status === 'rueckfrage').length

  return (
    <div className="huelle">
      <main className="inhalt">
        {reiter === 'buero' && <Buero zustand={zustand} zuAufgaben={() => setReiter('aufgaben')} />}
        {reiter === 'aufgaben' && <Aufgaben zustand={zustand} />}
        {reiter === 'postfach' && <Postfach zustand={zustand} />}
        {reiter === 'ordner' && <Ressourcen zustand={zustand} />}
        {reiter === 'einstellungen' && <Einstellungen zustand={zustand} />}
      </main>

      <nav className="navigation">
        {REITER.map((r) => (
          <button
            key={r.id}
            type="button"
            className={reiter === r.id ? 'nav-knopf aktiv' : 'nav-knopf'}
            onClick={() => setReiter(r.id)}
          >
            {r.text}
            {r.id === 'postfach' && ungelesen > 0 && <i className="punkt" />}
            {r.id === 'aufgaben' && rueckfragen > 0 && <i className="punkt" />}
          </button>
        ))}
      </nav>
    </div>
  )
}

import { useUi } from '../state/UiContext'
import type { Tab } from '../state/UiContext'
import './UntereNavigation.css'

const EINTRAEGE: { tab: Tab; label: string }[] = [
  { tab: 'jetzt', label: 'Jetzt' },
  { tab: 'board', label: 'Board' },
  { tab: 'listen', label: 'Listen' },
  { tab: 'ablage', label: 'Ablage' },
]

export function UntereNavigation() {
  const { tab, setTab } = useUi()
  return (
    <nav className="untere-navigation">
      {EINTRAEGE.map((e) => (
        <button
          key={e.tab}
          className={`nav-eintrag ${tab === e.tab ? 'nav-eintrag-aktiv' : ''}`}
          onClick={() => setTab(e.tab)}
        >
          {e.label}
        </button>
      ))}
    </nav>
  )
}

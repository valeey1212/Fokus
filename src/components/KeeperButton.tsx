import { useUi } from '../state/UiContext'
import './KeeperButton.css'

export function KeeperButton() {
  const { oeffne } = useUi()
  return (
    <button className="keeper-button" onClick={() => oeffne({ art: 'keeper' })} aria-label="Gedanke festhalten">
      +
    </button>
  )
}

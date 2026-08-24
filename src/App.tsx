import { useZustand } from './state/ZustandContext'
import { UiProvider, useUi } from './state/UiContext'
import { UntereNavigation } from './components/UntereNavigation'
import { KeeperButton } from './components/KeeperButton'
import { KeeperOverlay } from './components/KeeperOverlay'
import { SortierRitual } from './components/SortierRitual'
import { KartenAssistent } from './components/KartenAssistent'
import { Kartendetail } from './components/Kartendetail'
import { TauschDialog } from './components/TauschDialog'
import { FokusTimer } from './components/FokusTimer'
import { EinstellungenOverlay } from './components/EinstellungenOverlay'
import { Jetzt } from './screens/Jetzt'
import { Board } from './screens/Board'
import { Listen } from './screens/Listen'
import { Ablage } from './screens/Ablage'

function AppInhalt() {
  const { geladen } = useZustand()
  const { tab, overlays } = useUi()

  if (!geladen) return null

  return (
    <>
      {tab === 'jetzt' && <Jetzt />}
      {tab === 'board' && <Board />}
      {tab === 'listen' && <Listen />}
      {tab === 'ablage' && <Ablage />}

      <KeeperButton />
      <UntereNavigation />

      {overlays.map((overlay, i) => {
        switch (overlay.art) {
          case 'keeper':
            return <KeeperOverlay key={i} />
          case 'sortier':
            return <SortierRitual key={i} />
          case 'kartenAssistent':
            return (
              <KartenAssistent
                key={i}
                vorbelegterTitel={overlay.vorbelegterTitel}
                keeperId={overlay.keeperId}
              />
            )
          case 'kartendetail':
            return <Kartendetail key={i} karteId={overlay.karteId} />
          case 'fokus':
            return <FokusTimer key={i} karteId={overlay.karteId} />
          case 'tausch':
            return <TauschDialog key={i} karteId={overlay.karteId} />
          case 'einstellungen':
            return <EinstellungenOverlay key={i} />
          default:
            return null
        }
      })}
    </>
  )
}

function App() {
  return (
    <UiProvider>
      <AppInhalt />
    </UiProvider>
  )
}

export default App

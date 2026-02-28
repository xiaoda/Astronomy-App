import { useState } from 'react'

import './App.css'
import MeteorTrail from '../features/meteor/MeteorTrail'
import useMeteorGestures from '../features/meteor/useMeteorGestures'
import useBackgroundMusic from '../features/music/useBackgroundMusic'
import useQuoteRotation from '../features/quotes/useQuoteRotation'
import SettingsPanel from '../features/settings/SettingsPanel'
import StarfieldCanvas from '../features/starfield/StarfieldCanvas'
import WelcomePanel from '../features/welcome/WelcomePanel'
import { useDevFpsMonitor } from '../shared/hooks/useDevFpsMonitor'

function App() {
  const isDevMode = import.meta.env.DEV
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showQuote, setShowQuote] = useState(true)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)
  const fpsSnapshot = useDevFpsMonitor(isDevMode)

  const { currentQuote, quoteRevision, switchQuote } = useQuoteRotation(showQuote)
  const { meteor, clearMeteor, gestureHandlers } = useMeteorGestures({
    canTapTriggerAction: showQuote,
    onTap: switchQuote,
  })

  useBackgroundMusic(isMusicEnabled)

  return (
    <main className="app-shell" aria-label="天文静谧体验" {...gestureHandlers}>
      <StarfieldCanvas />
      <div className="nebula-layer" aria-hidden="true" />
      <MeteorTrail meteor={meteor} onDone={clearMeteor} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        showQuote={showQuote}
        isMusicEnabled={isMusicEnabled}
        onToggleOpen={() => setIsSettingsOpen((current) => !current)}
        onShowQuoteChange={setShowQuote}
        onMusicEnabledChange={setIsMusicEnabled}
      />
      {isDevMode && fpsSnapshot ? (
        <div className="fps-monitor" aria-label="帧率监视器">
          FPS {fpsSnapshot.fps} | {fpsSnapshot.frameMs}ms
        </div>
      ) : null}
      <WelcomePanel
        showQuote={showQuote}
        currentQuote={currentQuote}
        quoteRevision={quoteRevision}
      />
    </main>
  )
}

export default App

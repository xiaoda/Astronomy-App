import { useState } from 'react'

import './App.css'
import MeteorTrail, { useMeteorGestures } from '../features/meteor'
import { useBackgroundMusic } from '../features/music'
import { useQuoteRotation } from '../features/quotes'
import SettingsPanel from '../features/settings'
import StarfieldCanvas from '../features/starfield'
import WelcomePanel from '../features/welcome'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showQuote, setShowQuote] = useState(true)
  const [isMusicEnabled, setIsMusicEnabled] = useState(true)

  const { currentQuote, quoteRevision, switchQuote } = useQuoteRotation(showQuote)
  const { meteor, clearMeteor, gestureHandlers } = useMeteorGestures({
    canTapTriggerAction: showQuote,
    onTap: switchQuote,
  })

  const { isAwaitingUserGesture } = useBackgroundMusic(isMusicEnabled)

  return (
    <main className="app-shell" aria-label="天文静谧体验" {...gestureHandlers}>
      <StarfieldCanvas />
      <div className="nebula-layer" aria-hidden="true" />
      <MeteorTrail meteor={meteor} onDone={clearMeteor} />
      {isAwaitingUserGesture ? (
        <div className="music-unlock-hint" aria-live="polite">
          轻点任意位置，开启背景音乐
        </div>
      ) : null}
      <SettingsPanel
        isOpen={isSettingsOpen}
        showQuote={showQuote}
        isMusicEnabled={isMusicEnabled}
        onToggleOpen={() => setIsSettingsOpen((current) => !current)}
        onShowQuoteChange={setShowQuote}
        onMusicEnabledChange={setIsMusicEnabled}
      />
      <WelcomePanel
        showQuote={showQuote}
        currentQuote={currentQuote}
        quoteRevision={quoteRevision}
      />
    </main>
  )
}

export default App

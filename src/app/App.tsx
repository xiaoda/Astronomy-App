import type { MouseEventHandler, PointerEventHandler } from 'react'
import { useState } from 'react'

import './App.css'
import MeteorTrail, { useMeteorGestures } from '../features/meteor'
import { useBackgroundMusic } from '../features/music'
import { useQuoteRotation } from '../features/quotes'
import SettingsPanel from '../features/settings'
import StarfieldCanvas from '../features/starfield'
import WelcomePanel from '../features/welcome'

const stopPointerPropagation: PointerEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

const stopClickPropagation: MouseEventHandler<HTMLElement> = (event) => {
  event.stopPropagation()
}

const noop = () => {}

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showQuote, setShowQuote] = useState(true)
  const [isMusicEnabled, setIsMusicEnabled] = useState(false)

  const { currentQuote, quoteRevision } = useQuoteRotation(showQuote)
  const { meteor, clearMeteor } = useMeteorGestures({
    canTapTriggerAction: false,
    onTap: noop,
  })
  const { shouldShowUnlockButton, unlockAudio } = useBackgroundMusic(isMusicEnabled)

  const handleMusicEnabledChange = (nextValue: boolean) => {
    setIsMusicEnabled(nextValue)

    if (nextValue) {
      void unlockAudio(true)
    }
  }

  return (
    <main className="app-shell" aria-label="天文静谧体验" onClick={() => setIsSettingsOpen(false)}>
      <StarfieldCanvas />
      <div className="nebula-layer" aria-hidden="true" />
      <MeteorTrail meteor={meteor} onDone={clearMeteor} />
      {shouldShowUnlockButton ? (
        <button
          type="button"
          className="music-unlock-hint"
          aria-label="开启背景音乐"
          onPointerDown={stopPointerPropagation}
          onPointerUp={stopPointerPropagation}
          onPointerMove={stopPointerPropagation}
          onPointerCancel={stopPointerPropagation}
          onClick={(event) => {
            stopClickPropagation(event)
            setIsMusicEnabled(true)
            void unlockAudio(true)
          }}
        >
          点击开启背景音乐
        </button>
      ) : null}
      <SettingsPanel
        isOpen={isSettingsOpen}
        showQuote={showQuote}
        isMusicEnabled={isMusicEnabled}
        onToggleOpen={() => setIsSettingsOpen((current) => !current)}
        onRequestClose={() => setIsSettingsOpen(false)}
        onShowQuoteChange={setShowQuote}
        onMusicEnabledChange={handleMusicEnabledChange}
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

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PointerEventHandler } from 'react'

import './App.css'
import StarfieldCanvas from '../features/starfield/StarfieldCanvas'
import MeteorTrail, { type MeteorState } from '../features/meteor/MeteorTrail'
import quotePool, { getInitialQuoteIndex, getNextQuoteIndex } from '../features/quotes/quotePool'
import SettingsPanel from '../features/settings/SettingsPanel'

const LONG_PRESS_DURATION_MS = 1000
const TAP_MAX_DURATION_MS = 280
const TAP_COOLDOWN_MS = 260
const METEOR_COOLDOWN_MS = 1000
const MOVE_CANCEL_THRESHOLD_PX = 18
const QUOTE_SWITCH_INTERVAL_MS = 4400

const createMeteorState = (id: number): MeteorState => {
  const deltaX = -(260 + Math.random() * 220)
  const deltaY = 140 + Math.random() * 160

  return {
    id,
    startXPercent: 58 + Math.random() * 34,
    startYPercent: 8 + Math.random() * 22,
    deltaX,
    deltaY,
    angleDeg: (Math.atan2(deltaY, deltaX) * 180) / Math.PI,
    length: 120 + Math.random() * 120,
    durationMs: 900 + Math.random() * 350,
  }
}

function App() {
  const [quoteIndex, setQuoteIndex] = useState(() => getInitialQuoteIndex())
  const [quoteRevision, setQuoteRevision] = useState(0)
  const [meteor, setMeteor] = useState<MeteorState | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showQuote, setShowQuote] = useState(true)

  const pointerIdRef = useRef<number | null>(null)
  const pressStartedAtRef = useRef(0)
  const pointerStartRef = useRef({ x: 0, y: 0 })
  const longPressTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)
  const lastTapAtRef = useRef(0)
  const lastMeteorAtRef = useRef(0)
  const meteorIdRef = useRef(0)

  const switchQuote = useCallback(() => {
    setQuoteIndex((currentIndex) => getNextQuoteIndex(currentIndex))
    setQuoteRevision((current) => current + 1)
  }, [])

  useEffect(() => {
    if (!showQuote) {
      return
    }

    const timerId = window.setInterval(() => {
      switchQuote()
    }, QUOTE_SWITCH_INTERVAL_MS)

    return () => {
      window.clearInterval(timerId)
    }
  }, [showQuote, switchQuote])

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current)
      longPressTimerRef.current = null
    }
  }

  const resetGesture = () => {
    clearLongPressTimer()
    pointerIdRef.current = null
    longPressTriggeredRef.current = false
    pressStartedAtRef.current = 0
  }

  const triggerMeteor = (now: number) => {
    if (now - lastMeteorAtRef.current < METEOR_COOLDOWN_MS) {
      return false
    }

    lastMeteorAtRef.current = now
    meteorIdRef.current += 1
    setMeteor(createMeteorState(meteorIdRef.current))
    return true
  }

  const handlePointerDown: PointerEventHandler<HTMLElement> = (event) => {
    if (pointerIdRef.current !== null) {
      return
    }

    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    pointerIdRef.current = event.pointerId
    pressStartedAtRef.current = performance.now()
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    longPressTriggeredRef.current = false

    event.currentTarget.setPointerCapture(event.pointerId)

    longPressTimerRef.current = window.setTimeout(() => {
      if (pointerIdRef.current !== event.pointerId) {
        return
      }

      longPressTriggeredRef.current = triggerMeteor(performance.now())
    }, LONG_PRESS_DURATION_MS)
  }

  const handlePointerMove: PointerEventHandler<HTMLElement> = (event) => {
    if (pointerIdRef.current !== event.pointerId || longPressTimerRef.current === null) {
      return
    }

    const moveX = Math.abs(event.clientX - pointerStartRef.current.x)
    const moveY = Math.abs(event.clientY - pointerStartRef.current.y)

    if (moveX > MOVE_CANCEL_THRESHOLD_PX || moveY > MOVE_CANCEL_THRESHOLD_PX) {
      clearLongPressTimer()
    }
  }

  const handlePointerUp: PointerEventHandler<HTMLElement> = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return
    }

    const now = performance.now()
    const duration = now - pressStartedAtRef.current
    const isTap = !longPressTriggeredRef.current && duration <= TAP_MAX_DURATION_MS

    clearLongPressTimer()

    if (isTap && showQuote && now - lastTapAtRef.current >= TAP_COOLDOWN_MS) {
      lastTapAtRef.current = now
      switchQuote()
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    resetGesture()
  }

  const handlePointerCancel: PointerEventHandler<HTMLElement> = (event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    resetGesture()
  }

  const currentQuote = quotePool[quoteIndex] ?? '你不需要赶路，先看一会儿星光。'

  return (
    <main
      className="app-shell"
      aria-label="Astronomy calm experience"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <StarfieldCanvas />
      <div className="nebula-layer" aria-hidden="true" />
      <MeteorTrail meteor={meteor} onDone={() => setMeteor(null)} />
      <SettingsPanel
        isOpen={isSettingsOpen}
        showQuote={showQuote}
        onToggleOpen={() => setIsSettingsOpen((current) => !current)}
        onShowQuoteChange={setShowQuote}
      />
      <section className="welcome-panel">
        <h1 className="welcome-title">Astronomy App</h1>
        {showQuote ? (
          <>
            <p key={quoteRevision} className="welcome-copy quote-fade">
              {currentQuote}
            </p>
            <p className="gesture-hint">轻触切换文案 · 长按 1 秒触发流星</p>
          </>
        ) : null}
      </section>
    </main>
  )
}

export default App

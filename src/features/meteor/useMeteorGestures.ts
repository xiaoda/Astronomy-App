import { useEffect, useRef, useState } from 'react'

import type { MeteorState } from './MeteorTrail'

const LONG_PRESS_DURATION_MS = 1000
const TAP_MAX_DURATION_MS = 280
const TAP_COOLDOWN_MS = 260
const METEOR_COOLDOWN_MS = 1000
const MOVE_CANCEL_THRESHOLD_PX = 18
const INTERACTIVE_TARGET_SELECTOR = '.settings-root, .music-unlock-hint'

type UseMeteorGesturesOptions = {
  canTapTriggerAction: boolean
  onTap: () => void
}

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

function useMeteorGestures({ canTapTriggerAction, onTap }: UseMeteorGesturesOptions) {
  const [meteor, setMeteor] = useState<MeteorState | null>(null)
  const pointerIdRef = useRef<number | null>(null)
  const pressStartedAtRef = useRef(0)
  const pointerStartRef = useRef({ x: 0, y: 0 })
  const longPressTimerRef = useRef<number | null>(null)
  const longPressTriggeredRef = useRef(false)
  const lastTapAtRef = useRef(0)
  const lastMeteorAtRef = useRef(0)
  const meteorIdRef = useRef(0)

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

  useEffect(() => {
    const isInteractiveTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        return false
      }

      return target.closest(INTERACTIVE_TARGET_SELECTOR) !== null
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (pointerIdRef.current !== null || isInteractiveTarget(event.target)) {
        return
      }

      if (event.pointerType === 'mouse' && event.button !== 0) {
        return
      }

      pointerIdRef.current = event.pointerId
      pressStartedAtRef.current = performance.now()
      pointerStartRef.current = { x: event.clientX, y: event.clientY }
      longPressTriggeredRef.current = false

      longPressTimerRef.current = window.setTimeout(() => {
        if (pointerIdRef.current !== event.pointerId) {
          return
        }

        longPressTriggeredRef.current = triggerMeteor(performance.now())
      }, LONG_PRESS_DURATION_MS)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId || longPressTimerRef.current === null) {
        return
      }

      const moveX = Math.abs(event.clientX - pointerStartRef.current.x)
      const moveY = Math.abs(event.clientY - pointerStartRef.current.y)

      if (moveX > MOVE_CANCEL_THRESHOLD_PX || moveY > MOVE_CANCEL_THRESHOLD_PX) {
        clearLongPressTimer()
      }
    }

    const handlePointerUp = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return
      }

      const now = performance.now()
      const duration = now - pressStartedAtRef.current
      const isTap = !longPressTriggeredRef.current && duration <= TAP_MAX_DURATION_MS

      clearLongPressTimer()

      if (isTap && canTapTriggerAction && now - lastTapAtRef.current >= TAP_COOLDOWN_MS) {
        lastTapAtRef.current = now
        onTap()
      }

      resetGesture()
    }

    const handlePointerCancel = (event: PointerEvent) => {
      if (pointerIdRef.current !== event.pointerId) {
        return
      }

      resetGesture()
    }

    window.addEventListener('pointerdown', handlePointerDown, true)
    window.addEventListener('pointermove', handlePointerMove, true)
    window.addEventListener('pointerup', handlePointerUp, true)
    window.addEventListener('pointercancel', handlePointerCancel, true)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown, true)
      window.removeEventListener('pointermove', handlePointerMove, true)
      window.removeEventListener('pointerup', handlePointerUp, true)
      window.removeEventListener('pointercancel', handlePointerCancel, true)
      clearLongPressTimer()
    }
  }, [canTapTriggerAction, onTap])

  return {
    meteor,
    clearMeteor: () => setMeteor(null),
  }
}

export default useMeteorGestures

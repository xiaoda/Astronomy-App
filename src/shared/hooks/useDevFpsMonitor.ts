import { useEffect, useState } from 'react'

type FpsSnapshot = {
  fps: number
  frameMs: number
}

const SAMPLE_WINDOW_MS = 900

export const useDevFpsMonitor = (enabled: boolean): FpsSnapshot | null => {
  const [snapshot, setSnapshot] = useState<FpsSnapshot | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let frameCount = 0
    let frameId = 0
    let sampleStart = performance.now()

    const tick = (now: number) => {
      frameCount += 1

      const sampleElapsed = now - sampleStart

      if (sampleElapsed >= SAMPLE_WINDOW_MS) {
        const fps = Math.round((frameCount * 1000) / sampleElapsed)
        const frameMs = Number((sampleElapsed / frameCount).toFixed(1))
        setSnapshot({ fps, frameMs })
        frameCount = 0
        sampleStart = now
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [enabled])

  return snapshot
}

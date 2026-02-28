import { useEffect, useRef } from 'react'

import './StarfieldCanvas.css'
import { createStarfieldEngine } from './starfieldEngine'

function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvasElement = canvasRef.current

    if (!canvasElement) {
      return
    }

    const starfieldEngine = createStarfieldEngine(canvasElement)
    starfieldEngine.start()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        starfieldEngine.stop()
        return
      }

      starfieldEngine.start()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      starfieldEngine.stop()
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />
}

export default StarfieldCanvas

import { useEffect, useRef } from 'react'

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

    return () => {
      starfieldEngine.stop()
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield-canvas" aria-hidden="true" />
}

export default StarfieldCanvas

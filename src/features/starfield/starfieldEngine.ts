type StarLayerConfig = {
  ratio: number
  sizeRange: readonly [number, number]
  alphaRange: readonly [number, number]
  twinkleSpeedRange: readonly [number, number]
  twinkleAmplitudeRange: readonly [number, number]
  driftRange: readonly [number, number]
}

type Star = {
  x: number
  y: number
  size: number
  baseAlpha: number
  twinkleSpeed: number
  twinkleAmplitude: number
  twinklePhase: number
  driftRadius: number
  driftPhase: number
}

type StarfieldEngine = {
  start: () => void
  stop: () => void
}

const LOOP_DURATION_MS = 90_000
const STAR_DENSITY = 0.000085
const MIN_STARS = 120
const MAX_STARS = 420

const LAYERS: readonly StarLayerConfig[] = [
  {
    ratio: 0.5,
    sizeRange: [0.5, 1.2],
    alphaRange: [0.2, 0.52],
    twinkleSpeedRange: [0.25, 0.5],
    twinkleAmplitudeRange: [0.03, 0.09],
    driftRange: [0.2, 0.8],
  },
  {
    ratio: 0.33,
    sizeRange: [0.8, 1.7],
    alphaRange: [0.35, 0.72],
    twinkleSpeedRange: [0.35, 0.62],
    twinkleAmplitudeRange: [0.06, 0.14],
    driftRange: [0.6, 1.6],
  },
  {
    ratio: 0.17,
    sizeRange: [1.1, 2.2],
    alphaRange: [0.46, 0.9],
    twinkleSpeedRange: [0.4, 0.75],
    twinkleAmplitudeRange: [0.08, 0.18],
    driftRange: [1.2, 2.2],
  },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const wrap = (value: number, max: number) => {
  if (value < 0) {
    return value + max
  }

  if (value > max) {
    return value - max
  }

  return value
}

const buildStars = (width: number, height: number): Star[] => {
  const area = width * height
  const totalStars = clamp(Math.round(area * STAR_DENSITY), MIN_STARS, MAX_STARS)
  const stars: Star[] = []

  LAYERS.forEach((layer, layerIndex) => {
    const count =
      layerIndex === LAYERS.length - 1
        ? totalStars - stars.length
        : Math.round(totalStars * layer.ratio)

    for (let index = 0; index < count; index += 1) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: randomBetween(layer.sizeRange[0], layer.sizeRange[1]),
        baseAlpha: randomBetween(layer.alphaRange[0], layer.alphaRange[1]),
        twinkleSpeed: randomBetween(layer.twinkleSpeedRange[0], layer.twinkleSpeedRange[1]),
        twinkleAmplitude: randomBetween(
          layer.twinkleAmplitudeRange[0],
          layer.twinkleAmplitudeRange[1],
        ),
        twinklePhase: Math.random() * Math.PI * 2,
        driftRadius: randomBetween(layer.driftRange[0], layer.driftRange[1]),
        driftPhase: Math.random() * Math.PI * 2,
      })
    }
  })

  return stars
}

export const createStarfieldEngine = (canvas: HTMLCanvasElement): StarfieldEngine => {
  const context = canvas.getContext('2d')

  if (!context) {
    return {
      start: () => undefined,
      stop: () => undefined,
    }
  }

  let width = 1
  let height = 1
  let stars: Star[] = []
  let animationFrameId = 0
  let startTime = 0
  let resizeObserver: ResizeObserver | null = null

  const resize = () => {
    const { width: nextWidth, height: nextHeight } = canvas.getBoundingClientRect()

    if (!nextWidth || !nextHeight) {
      return
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)

    width = nextWidth
    height = nextHeight
    canvas.width = Math.floor(nextWidth * pixelRatio)
    canvas.height = Math.floor(nextHeight * pixelRatio)

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    stars = buildStars(width, height)
  }

  const render = (timestamp: number) => {
    if (!startTime) {
      startTime = timestamp
    }

    const elapsedSeconds = (timestamp - startTime) / 1000
    const loopProgress = ((timestamp - startTime) % LOOP_DURATION_MS) / LOOP_DURATION_MS
    const driftCycle = loopProgress * Math.PI * 2

    context.clearRect(0, 0, width, height)

    for (const star of stars) {
      const twinkle =
        Math.sin(elapsedSeconds * star.twinkleSpeed + star.twinklePhase) * star.twinkleAmplitude
      const alpha = clamp(star.baseAlpha + twinkle, 0.08, 1)

      const x = wrap(star.x + Math.cos(driftCycle + star.driftPhase) * star.driftRadius, width)
      const y = wrap(
        star.y + Math.sin(driftCycle + star.driftPhase * 0.85) * star.driftRadius * 0.6,
        height,
      )

      context.globalAlpha = alpha
      context.fillStyle = '#ffffff'
      context.beginPath()
      context.arc(x, y, star.size, 0, Math.PI * 2)
      context.fill()
    }

    context.globalAlpha = 1
    animationFrameId = window.requestAnimationFrame(render)
  }

  const start = () => {
    resize()

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(canvas)
    } else {
      window.addEventListener('resize', resize)
    }

    animationFrameId = window.requestAnimationFrame(render)
  }

  const stop = () => {
    window.cancelAnimationFrame(animationFrameId)

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    } else {
      window.removeEventListener('resize', resize)
    }
  }

  return { start, stop }
}

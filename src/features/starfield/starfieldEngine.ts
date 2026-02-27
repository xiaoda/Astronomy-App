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

type RenderProfile = {
  density: number
  minStars: number
  maxStars: number
  maxPixelRatio: number
  targetFps: number
}

const LOOP_DURATION_MS = 90_000
const DEFAULT_DENSITY = 0.00006
const DEFAULT_MIN_STARS = 80
const DEFAULT_MAX_STARS = 260

const LAYERS: readonly StarLayerConfig[] = [
  {
    ratio: 0.5,
    sizeRange: [0.8, 1.8],
    alphaRange: [0.22, 0.62],
    twinkleSpeedRange: [0.8, 1.5],
    twinkleAmplitudeRange: [0.1, 0.22],
    driftRange: [14, 30],
  },
  {
    ratio: 0.33,
    sizeRange: [1.1, 2.3],
    alphaRange: [0.35, 0.8],
    twinkleSpeedRange: [1, 1.8],
    twinkleAmplitudeRange: [0.2, 0.35],
    driftRange: [24, 46],
  },
  {
    ratio: 0.17,
    sizeRange: [1.6, 3.6],
    alphaRange: [0.5, 1],
    twinkleSpeedRange: [1.2, 2.2],
    twinkleAmplitudeRange: [0.28, 0.45],
    driftRange: [40, 72],
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

const resolveRenderProfile = (): RenderProfile => {
  const cpuCores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const isLowPowerDevice = cpuCores <= 4 || memory <= 4

  if (isLowPowerDevice) {
    return {
      density: 0.000042,
      minStars: 56,
      maxStars: 160,
      maxPixelRatio: 1,
      targetFps: 24,
    }
  }

  return {
    density: DEFAULT_DENSITY,
    minStars: DEFAULT_MIN_STARS,
    maxStars: DEFAULT_MAX_STARS,
    maxPixelRatio: 1.35,
    targetFps: 30,
  }
}

const buildStars = (width: number, height: number, profile: RenderProfile): Star[] => {
  const area = width * height
  const totalStars = clamp(Math.round(area * profile.density), profile.minStars, profile.maxStars)
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
  const renderProfile = resolveRenderProfile()
  const frameIntervalMs = 1000 / renderProfile.targetFps

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
  let lastFrameTime = 0
  let isRunning = false
  let resizeObserver: ResizeObserver | null = null

  const resize = () => {
    const { width: nextWidth, height: nextHeight } = canvas.getBoundingClientRect()

    if (!nextWidth || !nextHeight) {
      return
    }

    const pixelRatio = Math.min(window.devicePixelRatio || 1, renderProfile.maxPixelRatio)

    width = nextWidth
    height = nextHeight
    canvas.width = Math.floor(nextWidth * pixelRatio)
    canvas.height = Math.floor(nextHeight * pixelRatio)

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    stars = buildStars(width, height, renderProfile)
  }

  const render = (timestamp: number) => {
    if (!startTime) {
      startTime = timestamp
    }

    if (lastFrameTime && timestamp - lastFrameTime < frameIntervalMs) {
      animationFrameId = window.requestAnimationFrame(render)
      return
    }

    lastFrameTime = timestamp

    const elapsedSeconds = (timestamp - startTime) / 1000
    const loopProgress = ((timestamp - startTime) % LOOP_DURATION_MS) / LOOP_DURATION_MS
    const driftCycle = loopProgress * Math.PI * 2
    const cycleEnvelope = 0.72 + Math.sin(driftCycle) * 0.28
    const globalOffsetX = Math.sin(driftCycle) * 52
    const globalOffsetY = Math.cos(driftCycle * 0.8) * 34

    context.clearRect(0, 0, width, height)
    context.fillStyle = '#ffffff'

    for (const star of stars) {
      const twinkle =
        Math.sin(elapsedSeconds * star.twinkleSpeed + star.twinklePhase) * star.twinkleAmplitude
      const alpha = clamp((star.baseAlpha + twinkle) * cycleEnvelope, 0.08, 1)

      const x = wrap(
        star.x + Math.cos(driftCycle + star.driftPhase) * star.driftRadius + globalOffsetX,
        width,
      )
      const y = wrap(
        star.y +
          Math.sin(driftCycle + star.driftPhase * 0.85) * star.driftRadius * 0.95 +
          globalOffsetY,
        height,
      )

      context.globalAlpha = alpha

      if (star.size <= 1.4) {
        context.fillRect(x, y, star.size, star.size)
      } else {
        context.beginPath()
        context.arc(x, y, star.size, 0, Math.PI * 2)
        context.fill()
      }
    }

    context.globalAlpha = 1
    animationFrameId = window.requestAnimationFrame(render)
  }

  const start = () => {
    if (isRunning) {
      return
    }

    isRunning = true
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
    if (!isRunning) {
      return
    }

    isRunning = false
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

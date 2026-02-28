type StarLayerConfig = {
  ratio: number
  sizeRange: readonly [number, number]
  alphaRange: readonly [number, number]
  twinkleSpeedRange: readonly [number, number]
  twinkleAmplitudeRange: readonly [number, number]
  driftRange: readonly [number, number]
}

type StarfieldEngine = {
  start: () => void
  stop: () => void
}

type RenderProfile = {
  tier: 'conserve' | 'balanced' | 'high'
  density: number
  minStars: number
  maxStars: number
  maxPixelRatio: number
  targetFps: number
}

type StarBuffer = {
  count: number
  x: Float32Array
  y: Float32Array
  size: Float32Array
  baseAlpha: Float32Array
  twinkleSpeed: Float32Array
  twinkleAmplitude: Float32Array
  twinklePhase: Float32Array
  driftRadius: Float32Array
  driftPhase: Float32Array
}

const LOOP_DURATION_MS = 90_000
const TOUCH_VIEWPORT_MAX = 920
const DEFAULT_DENSITY = 0.00005
const DEFAULT_MIN_STARS = 72
const DEFAULT_MAX_STARS = 230

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

const isTouchDevice = () =>
  typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

const wrap = (value: number, max: number) => ((value % max) + max) % max

const resolveRenderProfile = (viewportWidth: number, viewportHeight: number): RenderProfile => {
  const cpuCores = navigator.hardwareConcurrency ?? 4
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4
  const minViewportEdge = Math.min(viewportWidth, viewportHeight)
  const mobileLikeViewport = minViewportEdge <= TOUCH_VIEWPORT_MAX && isTouchDevice()
  const isLowPowerDevice = cpuCores <= 4 || memory <= 4

  if (isLowPowerDevice) {
    return {
      tier: 'conserve',
      density: 0.000024,
      minStars: 36,
      maxStars: 120,
      maxPixelRatio: 1,
      targetFps: 30,
    }
  }

  if (mobileLikeViewport) {
    return {
      tier: 'balanced',
      density: 0.000035,
      minStars: 48,
      maxStars: 170,
      maxPixelRatio: 1.15,
      targetFps: 45,
    }
  }

  return {
    tier: 'high',
    density: DEFAULT_DENSITY,
    minStars: DEFAULT_MIN_STARS,
    maxStars: DEFAULT_MAX_STARS,
    maxPixelRatio: 1.35,
    targetFps: 60,
  }
}

const buildStars = (width: number, height: number, profile: RenderProfile): StarBuffer => {
  const area = width * height
  const totalStars = clamp(Math.round(area * profile.density), profile.minStars, profile.maxStars)
  const starsByTierFactor =
    profile.tier === 'conserve' ? 0.95 : profile.tier === 'balanced' ? 1 : 1.04
  const starCount = clamp(
    Math.round(totalStars * starsByTierFactor),
    profile.minStars,
    profile.maxStars,
  )

  const x = new Float32Array(starCount)
  const y = new Float32Array(starCount)
  const size = new Float32Array(starCount)
  const baseAlpha = new Float32Array(starCount)
  const twinkleSpeed = new Float32Array(starCount)
  const twinkleAmplitude = new Float32Array(starCount)
  const twinklePhase = new Float32Array(starCount)
  const driftRadius = new Float32Array(starCount)
  const driftPhase = new Float32Array(starCount)
  let cursor = 0

  LAYERS.forEach((layer, layerIndex) => {
    const count =
      layerIndex === LAYERS.length - 1 ? starCount - cursor : Math.round(starCount * layer.ratio)

    for (let index = 0; index < count; index += 1) {
      x[cursor] = Math.random() * width
      y[cursor] = Math.random() * height
      size[cursor] = randomBetween(layer.sizeRange[0], layer.sizeRange[1])
      baseAlpha[cursor] = randomBetween(layer.alphaRange[0], layer.alphaRange[1])
      twinkleSpeed[cursor] = randomBetween(layer.twinkleSpeedRange[0], layer.twinkleSpeedRange[1])
      twinkleAmplitude[cursor] = randomBetween(
        layer.twinkleAmplitudeRange[0],
        layer.twinkleAmplitudeRange[1],
      )
      twinklePhase[cursor] = Math.random() * Math.PI * 2
      driftRadius[cursor] = randomBetween(layer.driftRange[0], layer.driftRange[1])
      driftPhase[cursor] = Math.random() * Math.PI * 2
      cursor += 1
    }
  })

  return {
    count: cursor,
    x,
    y,
    size,
    baseAlpha,
    twinkleSpeed,
    twinkleAmplitude,
    twinklePhase,
    driftRadius,
    driftPhase,
  }
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
  let renderProfile = resolveRenderProfile(window.innerWidth, window.innerHeight)
  let frameIntervalMs = 1000 / renderProfile.targetFps
  let stars: StarBuffer = buildStars(1, 1, renderProfile)
  let animationFrameId = 0
  let startTime = 0
  let lastFrameTime = 0
  let isRunning = false
  let resizeObserver: ResizeObserver | null = null

  const drawStar = (x: number, y: number, starSize: number) => {
    if (starSize <= 1.4) {
      context.fillRect(x, y, starSize, starSize)
      return
    }

    context.beginPath()
    context.arc(x, y, starSize, 0, Math.PI * 2)
    context.fill()
  }

  const resize = () => {
    const { width: nextWidth, height: nextHeight } = canvas.getBoundingClientRect()

    if (!nextWidth || !nextHeight) {
      return
    }

    const nextProfile = resolveRenderProfile(nextWidth, nextHeight)
    renderProfile = nextProfile
    frameIntervalMs = 1000 / renderProfile.targetFps

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
    const sinDriftCycle = Math.sin(driftCycle)
    const cycleEnvelope = 0.72 + Math.sin(driftCycle) * 0.28
    const globalOffsetX = sinDriftCycle * 52
    const globalOffsetY = Math.cos(driftCycle * 0.8) * 34

    context.clearRect(0, 0, width, height)
    context.fillStyle = '#ffffff'

    const {
      count,
      x,
      y,
      size,
      baseAlpha,
      twinkleSpeed,
      twinkleAmplitude,
      twinklePhase,
      driftRadius,
      driftPhase,
    } = stars

    for (let index = 0; index < count; index += 1) {
      const twinkle =
        Math.sin(elapsedSeconds * twinkleSpeed[index] + twinklePhase[index]) *
        twinkleAmplitude[index]
      const alpha = clamp((baseAlpha[index] + twinkle) * cycleEnvelope, 0.08, 1)
      const driftPhaseValue = driftPhase[index]

      const rawStarX =
        x[index] + Math.cos(driftCycle + driftPhaseValue) * driftRadius[index] + globalOffsetX
      const rawStarY =
        y[index] +
        Math.sin(driftCycle + driftPhaseValue * 0.85) * driftRadius[index] * 0.95 +
        globalOffsetY
      const starX = wrap(rawStarX, width)
      const starY = wrap(rawStarY, height)
      const starSize = size[index]
      const overflowPadding = starSize + 2
      const xOffsets = [0]
      const yOffsets = [0]

      if (starX < overflowPadding) {
        xOffsets.push(width)
      } else if (starX > width - overflowPadding) {
        xOffsets.push(-width)
      }

      if (starY < overflowPadding) {
        yOffsets.push(height)
      } else if (starY > height - overflowPadding) {
        yOffsets.push(-height)
      }

      context.globalAlpha = alpha

      for (const xOffset of xOffsets) {
        for (const yOffset of yOffsets) {
          drawStar(starX + xOffset, starY + yOffset, starSize)
        }
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
    startTime = 0
    lastFrameTime = 0
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

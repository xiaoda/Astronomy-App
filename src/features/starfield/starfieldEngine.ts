type StarLayerConfig = {
  ratio: number
  sizeRange: readonly [number, number]
  alphaRange: readonly [number, number]
  twinkleSpeedRange: readonly [number, number]
  twinkleAmplitudeRange: readonly [number, number]
  driftRange: readonly [number, number]
  driftSpeedRange: readonly [number, number]
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
  anchorX: Float32Array
  anchorY: Float32Array
  size: Float32Array
  baseAlpha: Float32Array
  twinkleSpeed: Float32Array
  twinkleAmplitude: Float32Array
  twinklePhase: Float32Array
  driftRadius: Float32Array
  driftPhase: Float32Array
  driftSpeed: Float32Array
}

type AmbientMeteor = {
  startTime: number
  duration: number
  startX: number
  startY: number
  deltaX: number
  deltaY: number
  length: number
  lineWidth: number
  maxAlpha: number
  glowRadius: number
}

const TOUCH_VIEWPORT_MAX = 920
const DEFAULT_DENSITY = 0.00004
const DEFAULT_MIN_STARS = 56
const DEFAULT_MAX_STARS = 180
const DRIFT_SPEED_MULTIPLIER = 1.8

const LAYERS: readonly StarLayerConfig[] = [
  {
    ratio: 0.5,
    sizeRange: [0.8, 1.8],
    alphaRange: [0.22, 0.62],
    twinkleSpeedRange: [0.8, 1.5],
    twinkleAmplitudeRange: [0.1, 0.22],
    driftRange: [4, 10],
    driftSpeedRange: [0.18 * DRIFT_SPEED_MULTIPLIER, 0.3 * DRIFT_SPEED_MULTIPLIER],
  },
  {
    ratio: 0.33,
    sizeRange: [1.1, 2.3],
    alphaRange: [0.35, 0.8],
    twinkleSpeedRange: [1, 1.8],
    twinkleAmplitudeRange: [0.2, 0.35],
    driftRange: [7, 15],
    driftSpeedRange: [0.12 * DRIFT_SPEED_MULTIPLIER, 0.22 * DRIFT_SPEED_MULTIPLIER],
  },
  {
    ratio: 0.17,
    sizeRange: [1.6, 3.6],
    alphaRange: [0.5, 1],
    twinkleSpeedRange: [1.2, 2.2],
    twinkleAmplitudeRange: [0.28, 0.45],
    driftRange: [10, 20],
    driftSpeedRange: [0.07 * DRIFT_SPEED_MULTIPLIER, 0.13 * DRIFT_SPEED_MULTIPLIER],
  },
]

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)

const easeOutCubic = (progress: number) => 1 - (1 - progress) ** 3

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
      density: 0.000018,
      minStars: 28,
      maxStars: 90,
      maxPixelRatio: 1,
      targetFps: 30,
    }
  }

  if (mobileLikeViewport) {
    return {
      tier: 'balanced',
      density: 0.000028,
      minStars: 38,
      maxStars: 130,
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

const resolveStarCount = (width: number, height: number, profile: RenderProfile) => {
  const area = width * height
  const totalStars = clamp(Math.round(area * profile.density), profile.minStars, profile.maxStars)
  const starsByTierFactor =
    profile.tier === 'conserve' ? 0.95 : profile.tier === 'balanced' ? 1 : 1.04
  return clamp(
    Math.round(totalStars * starsByTierFactor),
    profile.minStars,
    profile.maxStars,
  )
}

const createStarBuffer = (starCount: number): StarBuffer => ({
  count: starCount,
  anchorX: new Float32Array(starCount),
  anchorY: new Float32Array(starCount),
  size: new Float32Array(starCount),
  baseAlpha: new Float32Array(starCount),
  twinkleSpeed: new Float32Array(starCount),
  twinkleAmplitude: new Float32Array(starCount),
  twinklePhase: new Float32Array(starCount),
  driftRadius: new Float32Array(starCount),
  driftPhase: new Float32Array(starCount),
  driftSpeed: new Float32Array(starCount),
})

const resolveLayerForIndex = (index: number, starCount: number) => {
  const progress = starCount <= 1 ? 0 : index / starCount
  let ratioCursor = 0

  for (const layer of LAYERS) {
    ratioCursor += layer.ratio

    if (progress < ratioCursor) {
      return layer
    }
  }

  return LAYERS[LAYERS.length - 1]
}

const fillStar = (buffer: StarBuffer, index: number) => {
  const layer = resolveLayerForIndex(index, buffer.count)

  buffer.anchorX[index] = Math.random()
  buffer.anchorY[index] = Math.random()
  buffer.size[index] = randomBetween(layer.sizeRange[0], layer.sizeRange[1])
  buffer.baseAlpha[index] = randomBetween(layer.alphaRange[0], layer.alphaRange[1])
  buffer.twinkleSpeed[index] = randomBetween(layer.twinkleSpeedRange[0], layer.twinkleSpeedRange[1])
  buffer.twinkleAmplitude[index] = randomBetween(
    layer.twinkleAmplitudeRange[0],
    layer.twinkleAmplitudeRange[1],
  )
  buffer.twinklePhase[index] = Math.random() * Math.PI * 2
  buffer.driftRadius[index] = randomBetween(layer.driftRange[0], layer.driftRange[1])
  buffer.driftPhase[index] = Math.random() * Math.PI * 2
  buffer.driftSpeed[index] = randomBetween(layer.driftSpeedRange[0], layer.driftSpeedRange[1])
}

const buildStars = (width: number, height: number, profile: RenderProfile): StarBuffer => {
  const starCount = resolveStarCount(width, height, profile)
  const stars = createStarBuffer(starCount)

  for (let index = 0; index < starCount; index += 1) {
    fillStar(stars, index)
  }

  return stars
}

const resizeStarBuffer = (stars: StarBuffer, nextCount: number): StarBuffer => {
  if (stars.count === nextCount) {
    return stars
  }

  const nextStars = createStarBuffer(nextCount)
  const preservedCount = Math.min(stars.count, nextCount)

  if (preservedCount > 0) {
    nextStars.anchorX.set(stars.anchorX.subarray(0, preservedCount))
    nextStars.anchorY.set(stars.anchorY.subarray(0, preservedCount))
    nextStars.size.set(stars.size.subarray(0, preservedCount))
    nextStars.baseAlpha.set(stars.baseAlpha.subarray(0, preservedCount))
    nextStars.twinkleSpeed.set(stars.twinkleSpeed.subarray(0, preservedCount))
    nextStars.twinkleAmplitude.set(stars.twinkleAmplitude.subarray(0, preservedCount))
    nextStars.twinklePhase.set(stars.twinklePhase.subarray(0, preservedCount))
    nextStars.driftRadius.set(stars.driftRadius.subarray(0, preservedCount))
    nextStars.driftPhase.set(stars.driftPhase.subarray(0, preservedCount))
    nextStars.driftSpeed.set(stars.driftSpeed.subarray(0, preservedCount))
  }

  for (let index = preservedCount; index < nextCount; index += 1) {
    fillStar(nextStars, index)
  }

  return nextStars
}

const resolveAmbientMeteorDelay = (profile: RenderProfile) => {
  if (profile.tier === 'conserve') {
    return randomBetween(18, 28)
  }

  if (profile.tier === 'balanced') {
    return randomBetween(14, 24)
  }

  return randomBetween(11, 20)
}

const createAmbientMeteor = (
  elapsedSeconds: number,
  width: number,
  height: number,
): AmbientMeteor => {
  const travelsRightToLeft = Math.random() > 0.28
  const startX = travelsRightToLeft
    ? randomBetween(width * 0.64, width * 0.92)
    : randomBetween(width * 0.08, width * 0.36)
  const deltaX = travelsRightToLeft
    ? -randomBetween(width * 0.18, width * 0.3)
    : randomBetween(width * 0.18, width * 0.3)
  const startY = randomBetween(height * 0.12, height * 0.38)
  const deltaY = randomBetween(height * 0.08, height * 0.18)

  return {
    startTime: elapsedSeconds,
    duration: randomBetween(1.2, 1.9),
    startX,
    startY,
    deltaX,
    deltaY,
    length: randomBetween(42, 88),
    lineWidth: randomBetween(1.1, 1.8),
    maxAlpha: randomBetween(0.24, 0.4),
    glowRadius: randomBetween(1.4, 2.4),
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
  let ambientMeteor: AmbientMeteor | null = null
  let nextAmbientMeteorAt = 0

  const drawStar = (x: number, y: number, starSize: number) => {
    if (starSize <= 1.4) {
      context.fillRect(x, y, starSize, starSize)
      return
    }

    context.beginPath()
    context.arc(x, y, starSize, 0, Math.PI * 2)
    context.fill()
  }

  const scheduleNextAmbientMeteor = (elapsedSeconds: number) => {
    nextAmbientMeteorAt = elapsedSeconds + resolveAmbientMeteorDelay(renderProfile)
  }

  const drawAmbientMeteor = (elapsedSeconds: number) => {
    if (!ambientMeteor) {
      return
    }

    const progress = clamp(
      (elapsedSeconds - ambientMeteor.startTime) / ambientMeteor.duration,
      0,
      1,
    )

    if (progress >= 1) {
      ambientMeteor = null
      scheduleNextAmbientMeteor(elapsedSeconds)
      return
    }

    const easedProgress = easeOutCubic(progress)
    const headX = ambientMeteor.startX + ambientMeteor.deltaX * easedProgress
    const headY = ambientMeteor.startY + ambientMeteor.deltaY * easedProgress
    const travelDistance = Math.hypot(ambientMeteor.deltaX, ambientMeteor.deltaY) || 1
    const directionX = ambientMeteor.deltaX / travelDistance
    const directionY = ambientMeteor.deltaY / travelDistance
    const tailX = headX - directionX * ambientMeteor.length
    const tailY = headY - directionY * ambientMeteor.length
    const alpha = Math.sin(progress * Math.PI) * ambientMeteor.maxAlpha
    const meteorGradient = context.createLinearGradient(headX, headY, tailX, tailY)

    meteorGradient.addColorStop(0, `rgba(245, 251, 255, ${alpha})`)
    meteorGradient.addColorStop(0.24, `rgba(189, 224, 255, ${alpha * 0.88})`)
    meteorGradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    context.save()
    context.lineCap = 'round'
    context.lineWidth = ambientMeteor.lineWidth
    context.strokeStyle = meteorGradient
    context.shadowBlur = 10
    context.shadowColor = `rgba(188, 221, 255, ${alpha * 0.75})`
    context.beginPath()
    context.moveTo(tailX, tailY)
    context.lineTo(headX, headY)
    context.stroke()

    context.globalAlpha = alpha * 0.9
    context.fillStyle = '#f4fbff'
    context.beginPath()
    context.arc(headX, headY, ambientMeteor.glowRadius, 0, Math.PI * 2)
    context.fill()
    context.restore()
  }

  const resize = () => {
    const { width: nextWidth, height: nextHeight } = canvas.getBoundingClientRect()

    if (!nextWidth || !nextHeight) {
      return
    }

    const nextProfile = resolveRenderProfile(nextWidth, nextHeight)
    renderProfile = nextProfile
    frameIntervalMs = 1000 / renderProfile.targetFps
    const nextStarCount = resolveStarCount(nextWidth, nextHeight, renderProfile)

    const pixelRatio = Math.min(window.devicePixelRatio || 1, renderProfile.maxPixelRatio)

    width = nextWidth
    height = nextHeight
    canvas.width = Math.floor(nextWidth * pixelRatio)
    canvas.height = Math.floor(nextHeight * pixelRatio)

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    stars = resizeStarBuffer(stars, nextStarCount)
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

    context.clearRect(0, 0, width, height)
    context.fillStyle = '#ffffff'

    const {
      count,
      anchorX,
      anchorY,
      size,
      baseAlpha,
      twinkleSpeed,
      twinkleAmplitude,
      twinklePhase,
      driftRadius,
      driftPhase,
      driftSpeed,
    } = stars

    for (let index = 0; index < count; index += 1) {
      const twinkle =
        Math.sin(elapsedSeconds * twinkleSpeed[index] + twinklePhase[index]) *
        twinkleAmplitude[index]
      const alpha = clamp(baseAlpha[index] + twinkle, 0.08, 1)
      const driftAngle = elapsedSeconds * driftSpeed[index] + driftPhase[index]
      const rawStarX =
        anchorX[index] * width + Math.cos(driftAngle) * driftRadius[index]
      const rawStarY =
        anchorY[index] * height + Math.sin(driftAngle * 0.92) * driftRadius[index] * 0.82
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

    if (!ambientMeteor && elapsedSeconds >= nextAmbientMeteorAt) {
      ambientMeteor = createAmbientMeteor(elapsedSeconds, width, height)
    }

    drawAmbientMeteor(elapsedSeconds)

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
    ambientMeteor = null
    resize()
    nextAmbientMeteorAt = randomBetween(5, 9)

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
    ambientMeteor = null

    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    } else {
      window.removeEventListener('resize', resize)
    }
  }

  return { start, stop }
}

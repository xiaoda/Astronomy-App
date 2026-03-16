import { useCallback, useEffect, useRef, useState } from 'react'

import musicTracks from './musicTracks'

const MUSIC_VOLUME = 0.26
const MUSIC_FADE_DURATION_MS = 650

function createShuffledTrackOrder(trackCount: number, previousLastTrackIndex?: number) {
  const trackOrder = Array.from({ length: trackCount }, (_, index) => index)

  for (let currentIndex = trackOrder.length - 1; currentIndex > 0; currentIndex -= 1) {
    const nextIndex = Math.floor(Math.random() * (currentIndex + 1))
    ;[trackOrder[currentIndex], trackOrder[nextIndex]] = [
      trackOrder[nextIndex],
      trackOrder[currentIndex],
    ]
  }

  if (
    trackOrder.length > 1 &&
    previousLastTrackIndex !== undefined &&
    trackOrder[0] === previousLastTrackIndex
  ) {
    ;[trackOrder[0], trackOrder[1]] = [trackOrder[1], trackOrder[0]]
  }

  return trackOrder
}

function useBackgroundMusic(isEnabled: boolean) {
  const [hasUnlockedAudio, setHasUnlockedAudio] = useState(false)
  const [playbackState, setPlaybackState] = useState(() => ({
    trackOrder: createShuffledTrackOrder(musicTracks.length),
    trackPosition: 0,
  }))
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasUnlockedAudioRef = useRef(false)
  const fadeFrameRef = useRef<number | null>(null)
  const fadeRunIdRef = useRef(0)
  const currentTrackIndex = playbackState.trackOrder[playbackState.trackPosition] ?? 0

  const currentTrack = musicTracks[currentTrackIndex] ?? musicTracks[0]

  const stopFade = useCallback(() => {
    if (fadeFrameRef.current !== null) {
      window.cancelAnimationFrame(fadeFrameRef.current)
      fadeFrameRef.current = null
    }
  }, [])

  const ensureAudioPlayback = useCallback(async () => {
    const audio = audioRef.current

    if (!audio) {
      return false
    }

    try {
      await audio.play()
      return true
    } catch {
      return false
    }
  }, [])

  const fadeAudioVolume = useCallback(
    async (targetVolume: number, { pauseOnComplete = false } = {}) => {
      const audio = audioRef.current

      if (!audio) {
        return
      }

      fadeRunIdRef.current += 1
      const fadeRunId = fadeRunIdRef.current

      stopFade()

      const startingVolume = audio.volume
      const volumeDelta = targetVolume - startingVolume

      if (Math.abs(volumeDelta) < 0.001) {
        audio.volume = targetVolume

        if (pauseOnComplete && targetVolume <= 0.001) {
          audio.pause()
        }

        return
      }

      const startTimestamp = performance.now()

      const step = (timestamp: number) => {
        if (fadeRunId !== fadeRunIdRef.current) {
          return
        }

        const progress = Math.min((timestamp - startTimestamp) / MUSIC_FADE_DURATION_MS, 1)
        const easedProgress = 1 - (1 - progress) * (1 - progress)
        audio.volume = startingVolume + volumeDelta * easedProgress

        if (progress < 1) {
          fadeFrameRef.current = window.requestAnimationFrame(step)
          return
        }

        audio.volume = targetVolume
        fadeFrameRef.current = null

        if (pauseOnComplete && targetVolume <= 0.001) {
          audio.pause()
        }
      }

      fadeFrameRef.current = window.requestAnimationFrame(step)
    },
    [stopFade],
  )

  const playAudio = useCallback(
    async (shouldForcePlay = false) => {
      const audio = audioRef.current

      if (!audio || (!isEnabled && !shouldForcePlay)) {
        return
      }

      if (!audio.paused) {
        return
      }

      await ensureAudioPlayback()
    },
    [ensureAudioPlayback, isEnabled],
  )

  const unlockAudio = useCallback(
    async (shouldPlay = isEnabled) => {
      if (!musicTracks.length || hasUnlockedAudioRef.current) {
        return
      }

      hasUnlockedAudioRef.current = true
      setHasUnlockedAudio(true)

      if (!shouldPlay) {
        return
      }

      const audio = audioRef.current

      if (!audio) {
        return
      }

      stopFade()
      audio.volume = 0

      const hasStarted = await ensureAudioPlayback()

      if (!hasStarted) {
        return
      }

      await fadeAudioVolume(MUSIC_VOLUME)
    },
    [ensureAudioPlayback, fadeAudioVolume, isEnabled, stopFade],
  )

  useEffect(() => {
    if (!musicTracks.length) {
      return
    }

    const audio = new Audio(musicTracks[0]?.src ?? '')
    const handleEnded = () => {
      setPlaybackState((currentState) => {
        const isLastTrackInRound =
          currentState.trackPosition >= currentState.trackOrder.length - 1

        if (!isLastTrackInRound) {
          return {
            ...currentState,
            trackPosition: currentState.trackPosition + 1,
          }
        }

        const lastPlayedTrackIndex =
          currentState.trackOrder[currentState.trackOrder.length - 1]

        return {
          trackOrder: createShuffledTrackOrder(musicTracks.length, lastPlayedTrackIndex),
          trackPosition: 0,
        }
      })
    }

    audio.preload = 'auto'
    audio.volume = 0
    audio.addEventListener('ended', handleEnded)
    audioRef.current = audio

    return () => {
      stopFade()
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [stopFade])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio || !currentTrack) {
      return
    }

    const nextSourceUrl = new URL(currentTrack.src, window.location.href).href

    if (audio.src !== nextSourceUrl) {
      const preserveVolume = isEnabled && hasUnlockedAudioRef.current ? MUSIC_VOLUME : 0
      audio.src = nextSourceUrl
      audio.load()
      audio.volume = preserveVolume
    }

    if (!isEnabled) {
      void fadeAudioVolume(0, { pauseOnComplete: true })
      return
    }

    if (hasUnlockedAudioRef.current) {
      void (async () => {
        const hasStarted = await ensureAudioPlayback()

        if (!hasStarted) {
          return
        }

        void fadeAudioVolume(MUSIC_VOLUME)
      })()
    }
  }, [currentTrack, ensureAudioPlayback, fadeAudioVolume, isEnabled])

  return {
    currentTrack,
    shouldShowUnlockButton: musicTracks.length > 0 && !hasUnlockedAudio,
    unlockAudio,
    playAudio,
  }
}

export default useBackgroundMusic

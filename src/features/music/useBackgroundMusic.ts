import { useCallback, useEffect, useRef, useState } from 'react'

import musicTracks from './musicTracks'

const MUSIC_VOLUME = 0.26

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
  const currentTrackIndex = playbackState.trackOrder[playbackState.trackPosition] ?? 0

  const currentTrack = musicTracks[currentTrackIndex] ?? musicTracks[0]

  const playAudio = useCallback(async () => {
    const audio = audioRef.current

    if (!audio || !isEnabled) {
      return
    }

    audio.volume = MUSIC_VOLUME

    try {
      await audio.play()
    } catch {
      // Ignore autoplay rejections until the next user interaction.
    }
  }, [isEnabled])

  const unlockAudio = useCallback(async () => {
    if (!musicTracks.length || hasUnlockedAudioRef.current) {
      return
    }

    hasUnlockedAudioRef.current = true
    setHasUnlockedAudio(true)
    await playAudio()
  }, [playAudio])

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
    audio.volume = MUSIC_VOLUME
    audio.addEventListener('ended', handleEnded)
    audioRef.current = audio

    return () => {
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio || !currentTrack) {
      return
    }

    const nextSourceUrl = new URL(currentTrack.src, window.location.href).href

    if (audio.src !== nextSourceUrl) {
      audio.src = nextSourceUrl
      audio.load()
    }

    if (!isEnabled) {
      audio.pause()
      return
    }

    if (hasUnlockedAudioRef.current) {
      void playAudio()
    }
  }, [currentTrack, isEnabled, playAudio])

  return {
    currentTrack,
    shouldShowUnlockButton: musicTracks.length > 0 && !hasUnlockedAudio,
    unlockAudio,
  }
}

export default useBackgroundMusic

import { useCallback, useEffect, useRef, useState } from 'react'

import musicTracks from './musicTracks'

const MUSIC_VOLUME = 0.26

function useBackgroundMusic(isEnabled: boolean) {
  const [trackIndex, setTrackIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasUnlockedAudioRef = useRef(false)

  const currentTrack = musicTracks[trackIndex] ?? musicTracks[0]

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

  useEffect(() => {
    if (!musicTracks.length) {
      return
    }

    const audio = new Audio(musicTracks[0]?.src ?? '')
    const handleEnded = () => {
      setTrackIndex((currentIndex) => (currentIndex + 1) % musicTracks.length)
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

  useEffect(() => {
    if (!musicTracks.length) {
      return
    }

    const unlockAudio = () => {
      if (hasUnlockedAudioRef.current) {
        return
      }

      hasUnlockedAudioRef.current = true
      void playAudio()
    }

    window.addEventListener('pointerdown', unlockAudio, true)
    window.addEventListener('keydown', unlockAudio, true)

    return () => {
      window.removeEventListener('pointerdown', unlockAudio, true)
      window.removeEventListener('keydown', unlockAudio, true)
    }
  }, [playAudio])

  return {
    currentTrack,
  }
}

export default useBackgroundMusic

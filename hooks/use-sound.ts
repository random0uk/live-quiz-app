"use client"

import { useCallback, useRef, useEffect } from "react"

// Using free sound effect URLs
const SOUNDS = {
  tick: "https://cdn.pixabay.com/audio/2022/03/15/audio_942694cbd9.mp3",
  correct: "https://cdn.pixabay.com/audio/2022/03/15/audio_8cb2c41e09.mp3",
  wrong: "https://cdn.pixabay.com/audio/2021/08/04/audio_bb630cc098.mp3",
  fanfare: "https://cdn.pixabay.com/audio/2022/03/15/audio_8a8a0b63c6.mp3",
} as const

type SoundName = keyof typeof SOUNDS

export function useSound() {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({})
  const enabledRef = useRef(true)

  // Preload sounds on mount
  useEffect(() => {
    if (typeof window === "undefined") return
    
    Object.entries(SOUNDS).forEach(([name, url]) => {
      const audio = new Audio(url)
      audio.preload = "auto"
      audio.volume = 0.5
      audioRefs.current[name] = audio
    })

    return () => {
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [])

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return
    const audio = audioRefs.current[name]
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {
        // Ignore autoplay errors - user hasn't interacted yet
      })
    }
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled
  }, [])

  return { play, setEnabled }
}

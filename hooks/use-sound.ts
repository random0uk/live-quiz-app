"use client"

import { useCallback, useRef } from "react"

type SoundName = "tick" | "correct" | "wrong" | "fanfare"

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(true)

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) => {
    const ctx = getCtx()
    if (!ctx) return
    
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    
    osc.type = type
    osc.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  }, [getCtx])

  const play = useCallback((name: SoundName) => {
    if (!enabledRef.current) return
    const ctx = getCtx()
    if (!ctx) return

    switch (name) {
      case "tick":
        // Short click sound
        playTone(800, 0.05, "square", 0.15)
        break
        
      case "correct":
        // Happy ascending ding-ding
        playTone(523, 0.15, "sine", 0.3) // C5
        setTimeout(() => playTone(659, 0.15, "sine", 0.3), 100) // E5
        setTimeout(() => playTone(784, 0.25, "sine", 0.35), 200) // G5
        break
        
      case "wrong":
        // Sad descending buzz
        playTone(200, 0.15, "sawtooth", 0.25)
        setTimeout(() => playTone(150, 0.25, "sawtooth", 0.2), 120)
        break
        
      case "fanfare":
        // Triumphant fanfare
        const notes = [
          { f: 523, d: 0.12 }, // C5
          { f: 523, d: 0.12 }, // C5
          { f: 523, d: 0.12 }, // C5
          { f: 523, d: 0.35 }, // C5
          { f: 415, d: 0.35 }, // Ab4
          { f: 466, d: 0.35 }, // Bb4
          { f: 523, d: 0.15 }, // C5
          { f: 466, d: 0.1 },  // Bb4
          { f: 523, d: 0.5 },  // C5
        ]
        let time = 0
        notes.forEach(({ f, d }) => {
          setTimeout(() => playTone(f, d, "triangle", 0.25), time * 1000)
          time += d * 0.85
        })
        break
    }
  }, [getCtx, playTone])

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled
  }, [])

  return { play, setEnabled }
}

"use client"

import { useCallback, useRef } from "react"

type SoundName = "tick" | "correct" | "wrong" | "fanfare"

export function useSound() {
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Always resume context — browsers suspend AudioContext until a user gesture
  const getCtx = useCallback(async () => {
    if (typeof window === "undefined") return null
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      )()
    }
    // Resume if suspended (required on mobile Safari, Chrome mobile, etc.)
    if (audioCtxRef.current.state === "suspended") {
      await audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  const playTone = useCallback(async (
    frequency: number,
    duration: number,
    type: OscillatorType = "sine",
    volume = 0.3,
    delayMs = 0
  ) => {
    const ctx = await getCtx()
    if (!ctx) return

    const startTime = ctx.currentTime + delayMs / 1000

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(frequency, startTime)

    gain.gain.setValueAtTime(volume, startTime)
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(startTime)
    osc.stop(startTime + duration)
  }, [getCtx])

  const play = useCallback((name: SoundName) => {
    switch (name) {
      case "tick":
        playTone(900, 0.06, "square", 0.12)
        break

      case "correct":
        // Happy ascending chime: C5 -> E5 -> G5
        playTone(523, 0.18, "sine", 0.3, 0)
        playTone(659, 0.18, "sine", 0.3, 110)
        playTone(784, 0.3,  "sine", 0.35, 220)
        break

      case "wrong":
        // Low descending buzz
        playTone(220, 0.18, "sawtooth", 0.28, 0)
        playTone(160, 0.28, "sawtooth", 0.22, 140)
        break

      case "fanfare":
        // Triumphant 4-note fanfare
        const seq = [
          { f: 523, d: 0.14, t: 0 },
          { f: 523, d: 0.14, t: 140 },
          { f: 523, d: 0.14, t: 280 },
          { f: 659, d: 0.4,  t: 420 },
          { f: 587, d: 0.2,  t: 820 },
          { f: 659, d: 0.6,  t: 1080 },
        ]
        seq.forEach(({ f, d, t }) => playTone(f, d, "triangle", 0.28, t))
        break
    }
  }, [playTone])

  return { play }
}

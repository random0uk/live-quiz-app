"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Question } from "@/lib/types"
import { useSound } from "@/hooks/use-sound"

interface Props {
  question: Question
  quizId: string
  playerId: string
  onComplete: (timeMs: number) => void
}

const GRID = 3 // 3x3 puzzle

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function PlayerPuzzle({ question, onComplete }: Props) {
  const total = GRID * GRID
  // pieces[i] = which original tile index is at position i
  const [pieces, setPieces] = useState<number[]>(() => shuffle(Array.from({ length: total }, (_, i) => i)))
  const [dragging, setDragging] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<number | null>(null)
  const [solved, setSolved] = useState(false)
  const [timeMs, setTimeMs] = useState(0)
  const startRef = useRef(Date.now())
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { play } = useSound()

  useEffect(() => {
    startRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      setTimeMs(Date.now() - startRef.current)
    }, 100)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const checkSolved = useCallback((p: number[]) => {
    return p.every((v, i) => v === i)
  }, [])

  const swap = (from: number, to: number) => {
    if (from === to) return
    setPieces(prev => {
      const next = [...prev]
      ;[next[from], next[to]] = [next[to], next[from]]
      if (checkSolved(next)) {
        setSolved(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
        const elapsed = Date.now() - startRef.current
        play("correct")
        setTimeout(() => onComplete(elapsed), 800)
      }
      return next
    })
  }

  // Touch drag state
  const touchStartPos = useRef<{ x: number; y: number; index: number } | null>(null)

  const tileStyle = (originalIndex: number) => {
    const col = originalIndex % GRID
    const row = Math.floor(originalIndex / GRID)
    return {
      backgroundImage: `url(${question.image_url})`,
      backgroundSize: `${GRID * 100}%`,
      backgroundPosition: `${(col / (GRID - 1)) * 100}% ${(row / (GRID - 1)) * 100}%`,
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-4"
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-muted-foreground text-xs uppercase tracking-widest">Puzzle Challenge</p>
          <h2 className="font-bold text-lg text-balance">{question.question_text || "Put the image together!"}</h2>
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2">
          <div className="px-4 py-1.5 bg-primary/10 rounded-full">
            <span className="font-mono font-bold text-primary text-sm">
              {(timeMs / 1000).toFixed(1)}s
            </span>
          </div>
        </div>

        {/* Puzzle grid */}
        <div
          className="relative mx-auto rounded-2xl overflow-hidden shadow-xl border border-border"
          style={{ width: "100%", aspectRatio: "1" }}
        >
          <AnimatePresence>
            {solved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-10 flex items-center justify-center bg-primary/80 backdrop-blur-sm rounded-2xl"
              >
                <div className="text-center text-white">
                  <p className="text-5xl font-black mb-2">Done!</p>
                  <p className="text-xl font-semibold">{(timeMs / 1000).toFixed(2)}s</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="grid w-full h-full"
            style={{ gridTemplateColumns: `repeat(${GRID}, 1fr)`, gap: "2px", background: "var(--border)" }}
          >
            {pieces.map((originalIndex, position) => (
              <motion.div
                key={`pos-${position}`}
                layout
                draggable
                onDragStart={() => setDragging(position)}
                onDragEnd={() => { setDragging(null); setDragOver(null) }}
                onDragOver={e => { e.preventDefault(); setDragOver(position) }}
                onDrop={() => { if (dragging !== null) { swap(dragging, position) }; setDragOver(null) }}
                // Touch support
                onTouchStart={e => {
                  touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, index: position }
                  setDragging(position)
                }}
                onTouchEnd={e => {
                  if (!touchStartPos.current) return
                  const touch = e.changedTouches[0]
                  const el = document.elementFromPoint(touch.clientX, touch.clientY)
                  const targetIdx = el ? parseInt(el.getAttribute("data-pos") ?? "-1") : -1
                  if (targetIdx >= 0 && targetIdx !== position) swap(position, targetIdx)
                  setDragging(null)
                  setDragOver(null)
                  touchStartPos.current = null
                }}
                data-pos={position}
                className={`cursor-grab active:cursor-grabbing select-none transition-transform ${
                  dragOver === position ? "scale-95 opacity-60" : ""
                } ${dragging === position ? "opacity-40 scale-90" : ""}`}
                style={{ ...tileStyle(originalIndex), backgroundRepeat: "no-repeat" }}
                whileTap={{ scale: 0.92 }}
              />
            ))}
          </div>
        </div>

        {/* Preview thumbnail */}
        <div className="flex items-center gap-3 p-3 bg-secondary/60 rounded-xl">
          <div
            className="w-12 h-12 rounded-lg shrink-0 border border-border"
            style={{ backgroundImage: `url(${question.image_url})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div>
            <p className="text-xs font-medium">Target image</p>
            <p className="text-xs text-muted-foreground">Drag tiles to match this</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

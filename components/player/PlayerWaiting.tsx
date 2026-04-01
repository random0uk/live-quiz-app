"use client"

import { useEffect } from "react"
import { Check, X } from "lucide-react"
import { useSound } from "@/hooks/use-sound"
interface Props {
  lastResult: { is_correct: boolean; points_earned: number; is_poll?: boolean } | null
  playerScore: number
}

export default function PlayerWaiting({ lastResult, playerScore }: Props) {
  const { play } = useSound()

  useEffect(() => {
    if (lastResult && !lastResult.is_poll) {
      play(lastResult.is_correct ? "correct" : "wrong")
    }
  }, [lastResult, play])

  const isPoll = lastResult?.is_poll === true

  const headerBg = !lastResult
    ? "bg-primary"
    : isPoll
    ? "bg-primary"
    : lastResult.is_correct
    ? "bg-[#2ec4b6]"
    : "bg-[#e84855]"

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Colored result header */}
      <div className={`${headerBg} pt-14 pb-10 px-6 flex flex-col items-center gap-4 transition-colors duration-500`}>
        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
          {!lastResult ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPoll ? (
            <Check className="w-10 h-10 text-white" />
          ) : lastResult.is_correct ? (
            <Check className="w-10 h-10 text-white" />
          ) : (
            <X className="w-10 h-10 text-white" />
          )}
        </div>
        <div className="text-center">
          <p className="text-white text-2xl font-bold">
            {!lastResult
              ? "Hold tight..."
              : isPoll
              ? "Voted!"
              : lastResult.is_correct
              ? "Correct!"
              : "Wrong!"}
          </p>
          {lastResult && !isPoll && lastResult.is_correct && lastResult.points_earned > 0 && (
            <p className="text-white/80 text-sm mt-1">+{lastResult.points_earned} points</p>
          )}
          {isPoll && <p className="text-white/80 text-sm mt-1">No points for polls</p>}
        </div>
      </div>

      {/* Score & waiting */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {lastResult && !isPoll && (
          <div className="w-full rounded-3xl bg-secondary/60 p-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">Your Score</p>
            <p className="text-5xl font-bold font-mono">{playerScore}</p>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          Waiting for host...
        </div>
      </div>
    </div>
  )
}

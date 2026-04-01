"use client"

import { useEffect } from "react"
import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useSound } from "@/hooks/use-sound"

interface Props {
  lastResult: { is_correct: boolean; points_earned: number; is_poll?: boolean } | null
  playerScore: number
}

export default function PlayerWaiting({ lastResult, playerScore }: Props) {
  const { play } = useSound()

  // Play correct/wrong sound when result arrives
  useEffect(() => {
    if (lastResult && !lastResult.is_poll) {
      play(lastResult.is_correct ? "correct" : "wrong")
    }
  }, [lastResult, play])

  if (lastResult) {
    const isPoll = lastResult.is_poll === true
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-xs animate-scale-in">
          <CardContent className="pt-6 text-center space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              isPoll ? "bg-secondary" : lastResult.is_correct ? "bg-primary" : "bg-destructive"
            }`}>
              {isPoll ? (
                <Check className="w-8 h-8 text-foreground" />
              ) : lastResult.is_correct ? (
                <Check className="w-8 h-8 text-primary-foreground" />
              ) : (
                <X className="w-8 h-8 text-destructive-foreground" />
              )}
            </div>

            <div>
              <p className={`text-2xl font-bold ${isPoll ? "text-foreground" : lastResult.is_correct ? "text-primary" : "text-destructive"}`}>
                {isPoll ? "Voted!" : lastResult.is_correct ? "Correct!" : "Wrong"}
              </p>
              {!isPoll && lastResult.is_correct && lastResult.points_earned > 0 && (
                <p className="text-muted-foreground text-sm">+{lastResult.points_earned} points</p>
              )}
              {isPoll && (
                <p className="text-muted-foreground text-sm">No points for polls</p>
              )}
            </div>

            {!isPoll && (
              <div className="p-4 bg-secondary rounded-xl">
                <p className="text-muted-foreground text-xs">Your Score</p>
                <p className="text-3xl font-bold font-mono">{playerScore}</p>
              </div>
            )}

            <p className="text-muted-foreground text-sm flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Waiting for host...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xs">
        <CardContent className="pt-6 text-center space-y-4">
          <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Waiting for answer reveal...</p>
        </CardContent>
      </Card>
    </div>
  )
}

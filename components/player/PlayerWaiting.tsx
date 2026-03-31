"use client"

import { Check, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  lastResult: { is_correct: boolean; points_earned: number } | null
  playerScore: number
}

export default function PlayerWaiting({ lastResult, playerScore }: Props) {
  if (lastResult) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-xs animate-scale-in">
          <CardContent className="pt-6 text-center space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              lastResult.is_correct ? "bg-primary" : "bg-destructive"
            }`}>
              {lastResult.is_correct ? (
                <Check className="w-8 h-8 text-primary-foreground" />
              ) : (
                <X className="w-8 h-8 text-destructive-foreground" />
              )}
            </div>

            <div>
              <p className={`text-2xl font-bold ${lastResult.is_correct ? "text-primary" : "text-destructive"}`}>
                {lastResult.is_correct ? "Correct!" : "Wrong"}
              </p>
              {lastResult.is_correct && lastResult.points_earned > 0 && (
                <p className="text-muted-foreground text-sm">+{lastResult.points_earned} points</p>
              )}
            </div>

            <div className="p-4 bg-secondary rounded-xl">
              <p className="text-muted-foreground text-xs">Your Score</p>
              <p className="text-3xl font-bold font-mono">{playerScore}</p>
            </div>

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

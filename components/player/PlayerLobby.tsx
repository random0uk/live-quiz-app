"use client"

import { Quiz, Player } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  quiz: Quiz
  player: Player
}

export default function PlayerLobby({ quiz, player }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xs animate-fade-in">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold text-balance">{quiz.title}</h2>
            <p className="text-muted-foreground text-sm">You&apos;re in!</p>
          </div>

          <div className="flex flex-col items-center gap-3 py-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-2xl">
                {player.name[0].toUpperCase()}
              </span>
            </div>
            <span className="font-semibold">{player.name}</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Waiting for host to start...
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

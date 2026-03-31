"use client"

import { Player } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  players: Player[]
  currentPlayerId: string
}

export default function PlayerLeaderboard({ players, currentPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)
  const top5 = sorted.slice(0, 5)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xs animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Leaderboard</CardTitle>
          {me && (
            <p className="text-muted-foreground text-sm">
              You&apos;re #{myRank} with {me.score} points
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-2">
          {top5.map((player, i) => {
            const isMe = player.id === currentPlayerId
            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 p-3 rounded-xl animate-scale-in ${
                  isMe ? "bg-primary text-primary-foreground" : i === 0 ? "bg-primary/10" : "bg-secondary"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  isMe ? "bg-primary-foreground/20" : "bg-background"
                }`}>
                  {i + 1}
                </span>
                <span className="flex-1 font-medium truncate">
                  {player.name} {isMe && "(you)"}
                </span>
                <span className="font-mono font-bold">{player.score}</span>
              </div>
            )
          })}

          {myRank > 5 && me && (
            <>
              <div className="text-center text-muted-foreground text-xs py-1">...</div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary text-primary-foreground">
                <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold bg-primary-foreground/20">
                  {myRank}
                </span>
                <span className="flex-1 font-medium truncate">{me.name} (you)</span>
                <span className="font-mono font-bold">{me.score}</span>
              </div>
            </>
          )}

          <p className="text-center text-muted-foreground text-xs pt-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Waiting for next question...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

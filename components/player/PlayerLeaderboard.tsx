"use client"

import { useEffect } from "react"
import { Player } from "@/lib/types"
import { useSound } from "@/hooks/use-sound"
interface Props {
  players: Player[]
  currentPlayerId: string
}

export default function PlayerLeaderboard({ players, currentPlayerId }: Props) {
  const { play } = useSound()
  const sorted = [...players].sort((a, b) => b.score - a.score)

  useEffect(() => {
    play("fanfare")
  }, [play])

  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)
  const top5 = sorted.slice(0, 5)

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header with my rank */}
      <div className="bg-primary pt-14 pb-8 px-6 flex flex-col items-center gap-2">
        <p className="text-white/70 text-xs uppercase tracking-widest font-medium">Leaderboard</p>
        {me && (
          <>
            <p className="text-white text-4xl font-bold font-mono">#{myRank}</p>
            <p className="text-white/80 text-sm">{me.score} points</p>
          </>
        )}
      </div>

      {/* Player list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
        {top5.map((player, i) => {
          const isMe = player.id === currentPlayerId
          return (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-4 rounded-2xl transition-all ${
                isMe ? "bg-primary text-primary-foreground" : i === 0 ? "bg-primary/10" : "bg-secondary"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                isMe ? "bg-white/20 text-white" : "bg-background text-foreground"
              }`}>
                {i + 1}
              </span>
              <span className="flex-1 font-semibold truncate">
                {player.name}{isMe ? " (you)" : ""}
              </span>
              <span className="font-mono font-bold">{player.score}</span>
            </div>
          )
        })}

        {myRank > 5 && me && (
          <>
            <div className="text-center text-muted-foreground text-xs py-1">•••</div>
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary text-primary-foreground">
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-white/20">
                {myRank}
              </span>
              <span className="flex-1 font-semibold truncate">{me.name} (you)</span>
              <span className="font-mono font-bold">{me.score}</span>
            </div>
          </>
        )}
      </div>

      {/* Waiting bar */}
      <div className="px-6 pb-8 pt-2 flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
        Waiting for next question...
      </div>
    </div>
  )
}

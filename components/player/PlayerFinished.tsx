"use client"

import { Player } from "@/lib/types"
import Link from "next/link"
import { Trophy, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
interface Props {
  players: Player[]
  currentPlayerId: string
}

export default function PlayerFinished({ players, currentPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)

  const getRankMessage = (rank: number) => {
    if (rank === 1) return "You won!"
    if (rank <= 3) return "Top 3! Well done!"
    return "Good game!"
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Trophy header */}
      <div className="bg-primary pt-14 pb-10 px-6 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <Trophy className="w-8 h-8 text-white" />
        </div>
        <div className="text-center">
          <p className="text-white text-2xl font-bold">Game Over</p>
          {me && <p className="text-white/80 text-sm mt-1">{getRankMessage(myRank)}</p>}
        </div>
      </div>

      {/* Stats */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
        {me && (
          <div className="w-full rounded-3xl bg-secondary/60 p-6 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Final Score</p>
            <p className="text-5xl font-bold font-mono">{me.score}</p>
            <p className="text-muted-foreground text-sm mt-1">points</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 w-full">
          <div className="p-4 bg-secondary/60 rounded-2xl text-center">
            <p className="text-2xl font-bold">#{myRank}</p>
            <p className="text-xs text-muted-foreground mt-1">Rank</p>
          </div>
          <div className="p-4 bg-secondary/60 rounded-2xl text-center">
            <p className="text-2xl font-bold">{me?.score || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Points</p>
          </div>
          <div className="p-4 bg-secondary/60 rounded-2xl text-center">
            <p className="text-2xl font-bold">{players.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Players</p>
          </div>
        </div>

        <Link href="/" className="w-full">
          <Button className="w-full h-12 rounded-2xl text-base font-semibold">
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  )
}

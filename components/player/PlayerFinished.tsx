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

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
        {/* Thank you message */}
        <div className="w-full rounded-3xl bg-primary/10 border border-primary/20 p-5 text-center">
          <p className="text-lg font-bold">Thank you for playing!</p>
          <p className="text-sm text-muted-foreground mt-1">We hope you had a great time. See you next quiz!</p>
        </div>

        {/* My score */}
        {me && (
          <div className="grid grid-cols-3 gap-3 w-full">
            <div className="p-4 bg-secondary/60 rounded-2xl text-center">
              <p className="text-2xl font-bold">#{myRank}</p>
              <p className="text-xs text-muted-foreground mt-1">Rank</p>
            </div>
            <div className="p-4 bg-secondary/60 rounded-2xl text-center">
              <p className="text-2xl font-bold">{me.score}</p>
              <p className="text-xs text-muted-foreground mt-1">Points</p>
            </div>
            <div className="p-4 bg-secondary/60 rounded-2xl text-center">
              <p className="text-2xl font-bold">{players.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Players</p>
            </div>
          </div>
        )}

        {/* Final leaderboard */}
        <div className="w-full space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">Final Leaderboard</p>
          {sorted.slice(0, 10).map((p, i) => {
            const isMe = p.id === currentPlayerId
            const medal = i === 0 ? "1st" : i === 1 ? "2nd" : i === 2 ? "3rd" : `${i + 1}th`
            return (
              <div
                key={p.id}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary/60"}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-8 ${isMe ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{medal}</span>
                  <span className="font-semibold text-sm">{p.name}{isMe ? " (you)" : ""}</span>
                </div>
                <span className="font-mono font-bold text-sm">{p.score}</span>
              </div>
            )
          })}
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

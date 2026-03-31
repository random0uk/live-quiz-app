"use client"

import { Quiz, Player } from "@/lib/types"
import Link from "next/link"
import { Zap, Home } from "lucide-react"

interface Props {
  quiz: Quiz
  players: Player[]
  currentPlayerId: string
}

export default function PlayerFinished({ quiz, players, currentPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)
  const total = sorted.length

  const getRankMessage = (rank: number, total: number) => {
    if (rank === 1) return "You won the game!"
    if (rank <= 3) return "Great job — top 3!"
    if (rank <= Math.ceil(total / 2)) return "Solid performance!"
    return "Better luck next time!"
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-6">
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Zap className="w-10 h-10 text-primary-foreground" fill="currentColor" />
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-black text-foreground">Game Over!</h1>
          <p className="text-muted-foreground text-sm mt-1 text-balance">{quiz.title}</p>
        </div>

        {/* My result */}
        {me && (
          <div className="bg-card border border-border rounded-2xl p-6 w-full flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
              <span className="text-primary font-black text-2xl">{me.name[0].toUpperCase()}</span>
            </div>
            <div className="text-center">
              <p className="text-foreground font-bold text-xl">{me.name}</p>
              <p className="text-muted-foreground text-sm">{getRankMessage(myRank, total)}</p>
            </div>
            <div className="flex w-full justify-around border-t border-border pt-4">
              <div className="text-center">
                <p className="text-foreground font-black text-3xl">{me.score.toLocaleString()}</p>
                <p className="text-muted-foreground text-xs">Points</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-foreground font-black text-3xl">#{myRank}</p>
                <p className="text-muted-foreground text-xs">Rank</p>
              </div>
              <div className="w-px bg-border" />
              <div className="text-center">
                <p className="text-foreground font-black text-3xl">{total}</p>
                <p className="text-muted-foreground text-xs">Players</p>
              </div>
            </div>
          </div>
        )}

        <Link href="/join" className="w-full">
          <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <Home className="w-5 h-5" />
            Play Again
          </button>
        </Link>
      </div>
    </main>
  )
}

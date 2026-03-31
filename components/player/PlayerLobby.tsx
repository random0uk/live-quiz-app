"use client"

import { Quiz, Player } from "@/lib/types"
import { Zap } from "lucide-react"

interface Props {
  quiz: Quiz
  player: Player
}

export default function PlayerLobby({ quiz, player }: Props) {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4 gap-6">
      <div className="flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Zap className="w-10 h-10 text-primary-foreground" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-black text-foreground text-balance text-center">{quiz.title}</h1>
      </div>

      {/* Player card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-3 w-full max-w-xs">
        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
          <span className="text-primary font-black text-3xl">{player.name[0].toUpperCase()}</span>
        </div>
        <div className="text-center">
          <p className="text-foreground font-bold text-xl">{player.name}</p>
          <p className="text-muted-foreground text-sm">You&apos;re in the lobby!</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
        <p className="text-muted-foreground text-sm">Waiting for host to start...</p>
      </div>
    </main>
  )
}

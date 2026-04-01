"use client"

import { Quiz, Player } from "@/lib/types"
interface Props {
  quiz: Quiz
  player: Player
}

export default function PlayerLobby({ quiz, player }: Props) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top branded section */}
      <div className="bg-primary pt-14 pb-10 px-6 flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-white font-bold text-3xl">
            {player.name[0].toUpperCase()}
          </span>
        </div>
        <div className="text-center">
          <p className="text-white font-bold text-xl">{player.name}</p>
          <p className="text-white/70 text-sm">You&apos;re in the game!</p>
        </div>
      </div>

      {/* Quiz info & waiting */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="w-full rounded-3xl bg-secondary/60 p-6 text-center space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Playing</p>
          <p className="text-xl font-bold text-balance">{quiz.title}</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            Waiting for host to start...
          </div>
          <p className="text-xs text-muted-foreground">Get ready — the quiz is about to begin</p>
        </div>
      </div>
    </div>
  )
}

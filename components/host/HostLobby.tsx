"use client"

import { Quiz, Player } from "@/lib/types"
import { Users, Zap } from "lucide-react"

interface Props {
  quiz: Quiz
  players: Player[]
  onStart: () => void
}

export default function HostLobby({ quiz, players, onStart }: Props) {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-6 pb-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" fill="currentColor" />
          <span className="text-muted-foreground text-sm font-medium">QuizBlitz</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground text-center text-balance">{quiz.title}</h1>
      </div>

      {/* Game Code */}
      <div className="mx-4 rounded-2xl bg-primary p-6 flex flex-col items-center gap-2 shadow-lg shadow-primary/25">
        <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-widest">Game Code</p>
        <p className="text-primary-foreground font-black tracking-widest" style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)" }}>
          {quiz.game_code}
        </p>
        <p className="text-primary-foreground/70 text-xs text-center">
          Players go to <span className="font-semibold text-primary-foreground">QuizBlitz</span> and enter this code
        </p>
      </div>

      {/* Players */}
      <div className="flex-1 flex flex-col px-4 pt-5 gap-4 overflow-hidden">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm font-medium">{players.length} player{players.length !== 1 ? "s" : ""} joined</span>
        </div>

        <div className="flex-1 overflow-y-auto">
          {players.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm text-center">Waiting for players to join...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 pb-4">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-sm">{player.name[0].toUpperCase()}</span>
                  </div>
                  <span className="text-foreground font-medium text-sm truncate">{player.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Start Button */}
      <div className="p-4 pb-8">
        <button
          onClick={onStart}
          disabled={players.length === 0}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-40 active:scale-[0.98]"
        >
          Start Game
        </button>
        {players.length === 0 && (
          <p className="text-center text-muted-foreground text-xs mt-2">Waiting for at least 1 player</p>
        )}
      </div>
    </main>
  )
}

"use client"

import { Quiz, Player } from "@/lib/types"
import Link from "next/link"
import { Zap, Home } from "lucide-react"

interface Props {
  quiz: Quiz
  players: Player[]
}

const PODIUM_COLORS = ["bg-[--answer-yellow]", "bg-muted", "bg-[--answer-red]"]

export default function HostFinished({ quiz, players }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const top3 = sorted.slice(0, 3)

  return (
    <main className="min-h-screen bg-background flex flex-col items-center pb-8">
      <div className="w-full max-w-md px-4">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-8 h-8 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-foreground text-balance text-center">Game Over!</h1>
          <p className="text-muted-foreground text-sm text-center">{quiz.title}</p>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {/* 2nd place */}
            {top3[1] && (
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-secondary border-2 border-muted flex items-center justify-center">
                  <span className="text-foreground font-black text-lg">{top3[1].name[0].toUpperCase()}</span>
                </div>
                <span className="text-foreground font-semibold text-xs text-center truncate w-full text-center">{top3[1].name}</span>
                <span className="text-muted-foreground text-xs font-bold">{top3[1].score.toLocaleString()}</span>
                <div className={`w-full h-16 ${PODIUM_COLORS[1]} rounded-t-xl flex items-center justify-center`}>
                  <span className="text-foreground font-black text-xl">2</span>
                </div>
              </div>
            )}
            {/* 1st place */}
            {top3[0] && (
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                  <span className="text-primary font-black text-2xl">{top3[0].name[0].toUpperCase()}</span>
                </div>
                <span className="text-foreground font-bold text-sm text-center truncate w-full text-center">{top3[0].name}</span>
                <span className="text-primary text-xs font-black">{top3[0].score.toLocaleString()}</span>
                <div className={`w-full h-24 ${PODIUM_COLORS[0]} rounded-t-xl flex items-center justify-center`}>
                  <span className="text-white font-black text-2xl">1</span>
                </div>
              </div>
            )}
            {/* 3rd place */}
            {top3[2] && (
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="w-12 h-12 rounded-full bg-secondary border-2 border-muted flex items-center justify-center">
                  <span className="text-foreground font-black text-lg">{top3[2].name[0].toUpperCase()}</span>
                </div>
                <span className="text-foreground font-semibold text-xs text-center truncate w-full text-center">{top3[2].name}</span>
                <span className="text-muted-foreground text-xs font-bold">{top3[2].score.toLocaleString()}</span>
                <div className={`w-full h-10 ${PODIUM_COLORS[2]} rounded-t-xl flex items-center justify-center`}>
                  <span className="text-white font-black text-xl">3</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full leaderboard */}
        {sorted.length > 3 && (
          <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col gap-2">
            <h3 className="text-foreground font-bold text-sm mb-1">All Players</h3>
            {sorted.map((player, idx) => (
              <div key={player.id} className="flex items-center gap-3">
                <span className="text-muted-foreground text-xs w-5 text-right font-bold">{idx + 1}</span>
                <span className="text-foreground text-sm flex-1 truncate">{player.name}</span>
                <span className="text-foreground font-bold text-sm">{player.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <Link href="/">
          <button className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-[0.98]">
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </Link>
      </div>
    </main>
  )
}

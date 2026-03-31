"use client"

import { Player } from "@/lib/types"

interface Props {
  players: Player[]
  currentPlayerId: string
}

export default function PlayerLeaderboard({ players, currentPlayerId }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const myRank = sorted.findIndex(p => p.id === currentPlayerId) + 1
  const me = sorted.find(p => p.id === currentPlayerId)
  const maxScore = sorted[0]?.score || 1

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-4 flex items-center justify-center">
        <div className="bg-primary/20 text-primary px-4 py-1.5 rounded-xl text-sm font-bold">
          Leaderboard
        </div>
      </div>

      {/* My rank card */}
      {me && (
        <div className="mx-4 bg-primary rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-primary/25 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <span className="text-primary-foreground font-black">{me.name[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-primary-foreground font-bold text-sm">{me.name}</p>
              <p className="text-primary-foreground/70 text-xs">Rank #{myRank}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground font-black text-2xl">{me.score.toLocaleString()}</p>
            <p className="text-primary-foreground/70 text-xs">points</p>
          </div>
        </div>
      )}

      <div className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto pb-8">
        {sorted.slice(0, 10).map((player, idx) => {
          const isMe = player.id === currentPlayerId
          const barPct = (player.score / maxScore) * 100
          return (
            <div
              key={player.id}
              className={`rounded-2xl px-4 py-3 flex items-center gap-3 transition-all animate-in fade-in slide-in-from-right-2 duration-300 ${
                isMe ? "bg-primary/20 border-2 border-primary" : "bg-card border border-border"
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <span className={`w-6 text-center text-sm font-black ${idx === 0 ? "text-[--answer-yellow]" : idx === 1 ? "text-muted-foreground" : idx === 2 ? "text-[--answer-red]" : "text-muted-foreground"}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-semibold text-sm truncate ${isMe ? "text-primary" : "text-foreground"}`}>
                    {player.name} {isMe && "(you)"}
                  </span>
                  <span className={`font-black text-sm ml-2 shrink-0 ${isMe ? "text-primary" : "text-foreground"}`}>
                    {player.score.toLocaleString()}
                  </span>
                </div>
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${isMe ? "bg-primary" : "bg-muted-foreground/40"}`}
                    style={{ width: `${barPct}%`, transitionDelay: `${idx * 50 + 200}ms` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}

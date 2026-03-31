"use client"

import { Quiz, Player } from "@/lib/types"

interface Props {
  quiz: Quiz
  players: Player[]
  questionNumber: number
  totalQuestions: number
  onNext: () => void
}

const MEDAL_COLORS = ["text-[--answer-yellow]", "text-muted-foreground", "text-[--answer-red]"]
const MEDAL_LABELS = ["1st", "2nd", "3rd"]

export default function HostLeaderboard({ quiz, players, questionNumber, totalQuestions, onNext }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const isLastQuestion = questionNumber >= totalQuestions
  const maxScore = sorted[0]?.score || 1

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-4 flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">Q{questionNumber}/{totalQuestions}</span>
        <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-xl text-sm font-bold">
          Leaderboard
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 gap-4 overflow-hidden">
        <h2 className="text-2xl font-black text-foreground text-center">Top Players</h2>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4">
          {sorted.slice(0, 10).map((player, idx) => {
            const barPct = (player.score / maxScore) * 100
            return (
              <div
                key={player.id}
                className="bg-card border border-border rounded-2xl px-4 py-3 flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <span className={`w-8 text-center font-black text-sm ${idx < 3 ? MEDAL_COLORS[idx] : "text-muted-foreground"}`}>
                  {idx < 3 ? MEDAL_LABELS[idx] : `${idx + 1}`}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-semibold text-sm truncate">{player.name}</span>
                    <span className="text-foreground font-black text-sm ml-2 shrink-0">{player.score.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-700"
                      style={{ width: `${barPct}%`, transitionDelay: `${idx * 60 + 200}ms` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-4 pb-8">
        <button
          onClick={onNext}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all hover:opacity-90 active:scale-[0.98]"
        >
          {isLastQuestion ? "See Final Results" : "Next Question"}
        </button>
      </div>
    </main>
  )
}

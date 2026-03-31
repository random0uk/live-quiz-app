"use client"

import { Quiz, Player } from "@/lib/types"
import { Trophy, Medal, Award, ChevronRight } from "lucide-react"

interface Props {
  quiz: Quiz
  players: Player[]
  questionNumber: number
  totalQuestions: number
  onNext: () => void
}

const MEDAL_ICONS = [Trophy, Medal, Award]
const MEDAL_COLORS = ["#ffd700", "#c0c0c0", "#cd7f32"]

export default function HostLeaderboard({ quiz, players, questionNumber, totalQuestions, onNext }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const isLastQuestion = questionNumber >= totalQuestions
  const maxScore = sorted[0]?.score || 1

  return (
    <main 
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
          <span className="text-gray-700 font-bold">Q{questionNumber}/{totalQuestions}</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900">Leaderboard</h2>
        <div className="w-20" />
      </div>

      <div className="flex-1 flex flex-col px-6 gap-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pb-4">
          {sorted.slice(0, 10).map((player, idx) => {
            const barPct = (player.score / maxScore) * 100
            const MedalIcon = idx < 3 ? MEDAL_ICONS[idx] : null
            const isTop3 = idx < 3

            return (
              <div
                key={player.id}
                className={`bg-white rounded-2xl px-5 py-4 flex items-center gap-4 shadow-lg animate-in fade-in slide-in-from-right-4 duration-500 ${
                  isTop3 ? "ring-2" : ""
                }`}
                style={{ 
                  animationDelay: `${idx * 80}ms`,
                  ringColor: isTop3 ? MEDAL_COLORS[idx] : undefined
                }}
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ 
                    backgroundColor: isTop3 ? `${MEDAL_COLORS[idx]}20` : "#f3f4f6"
                  }}
                >
                  {MedalIcon ? (
                    <MedalIcon className="w-6 h-6" style={{ color: MEDAL_COLORS[idx] }} />
                  ) : (
                    <span className="font-black text-lg text-gray-400">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-900 font-bold truncate">{player.name}</span>
                    <span 
                      className="font-black text-lg ml-3 shrink-0"
                      style={{ color: isTop3 ? MEDAL_COLORS[idx] : "#6b7280" }}
                    >
                      {player.score.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ 
                        width: `${barPct}%`, 
                        transitionDelay: `${idx * 80 + 300}ms`,
                        background: `linear-gradient(90deg, ${quiz.theme_bg}, ${quiz.theme_btn})`
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-6 pb-8">
        <button
          onClick={onNext}
          className="w-full text-white py-5 rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ 
            background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
            boxShadow: `0 20px 40px ${quiz.theme_bg}40`
          }}
        >
          {isLastQuestion ? "See Final Results" : "Next Question"}
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </main>
  )
}

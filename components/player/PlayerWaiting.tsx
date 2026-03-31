"use client"

import { Quiz } from "@/lib/types"
import { CheckCircle, XCircle, Star } from "lucide-react"

interface Props {
  quiz: Quiz
  lastResult: { is_correct: boolean; points_earned: number } | null
  playerScore: number
}

export default function PlayerWaiting({ quiz, lastResult, playerScore }: Props) {
  return (
    <main 
      className="min-h-screen flex flex-col items-center justify-center px-4 gap-6"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      {lastResult !== null ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm">
          {/* Result */}
          <div 
            className={`w-28 h-28 rounded-3xl flex items-center justify-center shadow-2xl ${
              lastResult.is_correct ? "bg-green-500" : "bg-red-500"
            }`}
            style={{ boxShadow: lastResult.is_correct ? "0 20px 40px rgba(34, 197, 94, 0.4)" : "0 20px 40px rgba(239, 68, 68, 0.4)" }}
          >
            {lastResult.is_correct ? (
              <CheckCircle className="w-14 h-14 text-white" />
            ) : (
              <XCircle className="w-14 h-14 text-white" />
            )}
          </div>

          <div className="text-center">
            <h2 className={`text-4xl font-black ${lastResult.is_correct ? "text-green-600" : "text-red-600"}`}>
              {lastResult.is_correct ? "Correct!" : "Wrong!"}
            </h2>
            {lastResult.is_correct && lastResult.points_earned > 0 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <Star className="w-5 h-5 text-yellow-500" fill="currentColor" />
                <p className="text-gray-600 font-bold text-lg">
                  +{lastResult.points_earned.toLocaleString()} points
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 w-full text-center shadow-xl">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Your Score</p>
            <p 
              className="font-black text-5xl"
              style={{ color: quiz.theme_bg }}
            >
              {playerScore.toLocaleString()}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div 
            className="w-14 h-14 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: `${quiz.theme_bg} transparent ${quiz.theme_bg} ${quiz.theme_bg}` }}
          />
          <p className="text-gray-500 font-medium">Waiting for answer reveal...</p>
        </div>
      )}

      <div className="flex items-center gap-3 bg-white/80 rounded-full px-5 py-3 shadow-lg mt-4">
        <span className="relative flex h-3 w-3">
          <span 
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
            style={{ backgroundColor: quiz.theme_bg }}
          />
          <span 
            className="relative inline-flex rounded-full h-3 w-3"
            style={{ backgroundColor: quiz.theme_bg }}
          />
        </span>
        <p className="text-gray-600 font-medium text-sm">Waiting for host...</p>
      </div>
    </main>
  )
}

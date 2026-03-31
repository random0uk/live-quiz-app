"use client"

import { Quiz, Question, Answer, Player } from "@/lib/types"
import { CheckCircle, XCircle } from "lucide-react"

interface Props {
  quiz: Quiz
  question: Question
  answers: Answer[]
  players: Player[]
  questionNumber: number
  totalQuestions: number
  onLeaderboard: () => void
}

const ANSWER_COLORS = [
  { bg: "#e53935", name: "Red" },
  { bg: "#1e88e5", name: "Blue" },
  { bg: "#fdd835", name: "Yellow", text: "#1a1a1a" },
  { bg: "#43a047", name: "Green" },
]

export default function HostReveal({ quiz, question, answers, players, questionNumber, totalQuestions, onLeaderboard }: Props) {
  const correctCount = answers.filter(a => a.is_correct).length
  const totalAnswers = answers.length

  const optionCounts = question.options.map((_, idx) =>
    answers.filter(a => a.selected_index === idx).length
  )
  const maxCount = Math.max(...optionCounts, 1)

  return (
    <main 
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}15, ${quiz.theme_btn}10)` }}
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="bg-white rounded-xl px-4 py-2 shadow-sm">
          <span className="text-gray-700 font-bold">Q{questionNumber}/{totalQuestions}</span>
        </div>
        <div 
          className="px-4 py-2 rounded-xl text-white font-bold shadow-lg"
          style={{ background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})` }}
        >
          Answer Revealed!
        </div>
      </div>

      <div className="flex-1 flex flex-col px-6 gap-5">
        {/* Question */}
        <div className="bg-white rounded-3xl p-6 shadow-xl">
          <p className="text-gray-900 font-bold text-xl text-center text-balance leading-relaxed">
            {question.question_text}
          </p>
        </div>

        {/* Answer bars */}
        <div className="flex flex-col gap-3">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.correct_index
            const count = optionCounts[idx]
            const pct = totalAnswers > 0 ? (count / maxCount) * 100 : 0
            return (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden transition-all ${
                  isCorrect ? "ring-4 ring-green-400 ring-offset-2" : "opacity-60"
                }`}
                style={{ backgroundColor: ANSWER_COLORS[idx].bg }}
              >
                <div className="flex items-center gap-4 px-5 py-4">
                  <span 
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg bg-white/20"
                    style={{ color: ANSWER_COLORS[idx].text || "white" }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span 
                    className="font-bold flex-1"
                    style={{ color: ANSWER_COLORS[idx].text || "white" }}
                  >
                    {opt}
                  </span>
                  {isCorrect && (
                    <CheckCircle className="w-8 h-8 text-white" />
                  )}
                  <div 
                    className="px-4 py-2 rounded-xl font-black text-lg bg-white/20"
                    style={{ color: ANSWER_COLORS[idx].text || "white" }}
                  >
                    {count}
                  </div>
                </div>
                {/* Bar */}
                <div className="h-2 bg-white/10 w-full">
                  <div
                    className="h-full bg-white/40 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 flex items-center justify-around shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <span className="text-3xl font-black text-gray-900">{correctCount}</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Correct</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <XCircle className="w-6 h-6 text-red-500" />
              <span className="text-3xl font-black text-gray-900">{totalAnswers - correctCount}</span>
            </div>
            <div className="text-gray-500 text-sm font-medium">Wrong</div>
          </div>
          <div className="w-px h-12 bg-gray-200" />
          <div className="text-center">
            <div className="text-3xl font-black text-gray-400">{players.length - totalAnswers}</div>
            <div className="text-gray-500 text-sm font-medium">No Answer</div>
          </div>
        </div>
      </div>

      <div className="p-6 pb-8">
        <button
          onClick={onLeaderboard}
          className="w-full text-white py-5 rounded-2xl font-bold text-xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{ 
            background: `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`,
            boxShadow: `0 20px 40px ${quiz.theme_bg}40`
          }}
        >
          Show Leaderboard
        </button>
      </div>
    </main>
  )
}

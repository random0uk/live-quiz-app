"use client"

import { useEffect, useState } from "react"
import { Question, Quiz } from "@/lib/types"
import { Clock, Check } from "lucide-react"

interface Props {
  quiz: Quiz
  question: Question
  questionNumber: number
  totalQuestions: number
  hasAnswered: boolean
  onAnswer: (selectedIndex: number, timeRemaining: number) => void
}

const ANSWER_COLORS = [
  { bg: "#e53935", name: "Red" },
  { bg: "#1e88e5", name: "Blue" },
  { bg: "#fdd835", name: "Yellow", text: "#1a1a1a" },
  { bg: "#43a047", name: "Green" },
]

export default function PlayerQuestion({ quiz, question, questionNumber, totalQuestions, hasAnswered, onAnswer }: Props) {
  const [timeLeft, setTimeLeft] = useState(question.time_limit)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    setTimeLeft(question.time_limit)
    setSelected(null)
  }, [question.id, question.time_limit])

  useEffect(() => {
    if (timeLeft <= 0 || hasAnswered) return
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, hasAnswered])

  const handleSelect = (idx: number) => {
    if (hasAnswered || selected !== null) return
    setSelected(idx)
    onAnswer(idx, timeLeft)
  }

  const progress = (timeLeft / question.time_limit) * 100
  const isUrgent = timeLeft <= 5
  const isWarning = timeLeft <= 10

  return (
    <main 
      className="min-h-screen flex flex-col"
      style={{ background: `linear-gradient(180deg, ${quiz.theme_bg}, ${quiz.theme_btn})` }}
    >
      {/* Timer bar */}
      <div className="h-2 bg-white/20 w-full">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent ? "bg-red-400" : isWarning ? "bg-yellow-400" : "bg-white"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 py-4 flex items-center justify-between">
        <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
          <span className="text-white font-bold text-sm">Q{questionNumber}/{totalQuestions}</span>
        </div>
        <div className={`w-14 h-14 rounded-full flex flex-col items-center justify-center ${
          isUrgent ? "bg-red-500 animate-pulse" : isWarning ? "bg-yellow-500" : "bg-white"
        } shadow-xl`}>
          <Clock className={`w-3 h-3 ${isUrgent || isWarning ? "text-white" : "text-gray-500"}`} />
          <span className={`font-black text-xl ${isUrgent || isWarning ? "text-white" : "text-gray-900"}`}>
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Question */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-2xl p-5 shadow-xl min-h-[80px] flex items-center justify-center">
          <p className="text-gray-900 font-bold text-lg text-center text-balance leading-relaxed">
            {question.question_text}
          </p>
        </div>
      </div>

      {/* Answer Buttons */}
      <div className="flex-1 px-4 pb-8">
        {hasAnswered ? (
          <div className="h-full flex flex-col items-center justify-center gap-5">
            {selected !== null && (
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: ANSWER_COLORS[selected].bg }}
              >
                <span 
                  className="font-black text-3xl"
                  style={{ color: ANSWER_COLORS[selected].text || "white" }}
                >
                  {String.fromCharCode(65 + selected)}
                </span>
              </div>
            )}
            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 text-center w-full max-w-xs">
              <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-bold text-xl">Answer Locked In!</p>
              <p className="text-white/70 text-sm mt-1">Waiting for results...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 h-full">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="rounded-2xl p-5 flex flex-col gap-2 shadow-xl transition-all active:scale-[0.95] hover:scale-[1.02] text-left"
                style={{ 
                  backgroundColor: ANSWER_COLORS[idx].bg,
                  color: ANSWER_COLORS[idx].text || "white"
                }}
              >
                <div 
                  className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"
                  style={{ color: ANSWER_COLORS[idx].text || "white" }}
                >
                  <span className="font-black text-lg">{String.fromCharCode(65 + idx)}</span>
                </div>
                <span className="font-bold text-base leading-snug">{opt}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

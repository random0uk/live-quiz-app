"use client"

import { useEffect, useState } from "react"
import { Quiz, Question } from "@/lib/types"
import { Users, Clock } from "lucide-react"

interface Props {
  quiz: Quiz
  question: Question
  questionNumber: number
  totalQuestions: number
  answerCount: number
  playerCount: number
  onReveal: () => void
}

const ANSWER_COLORS = [
  { bg: "#e53935", name: "Red" },
  { bg: "#1e88e5", name: "Blue" },
  { bg: "#fdd835", name: "Yellow", text: "#1a1a1a" },
  { bg: "#43a047", name: "Green" },
]

export default function HostQuestion({
  quiz, question, questionNumber, totalQuestions, answerCount, playerCount, onReveal
}: Props) {
  const [timeLeft, setTimeLeft] = useState(question.time_limit)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setTimeLeft(question.time_limit)
    setRevealed(false)
  }, [question.id, question.time_limit])

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!revealed) { setRevealed(true); onReveal() }
      return
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, revealed, onReveal])

  const progress = (timeLeft / question.time_limit) * 100
  const isUrgent = timeLeft <= 5
  const isWarning = timeLeft <= 10

  return (
    <main 
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: `linear-gradient(180deg, ${quiz.theme_bg}, ${quiz.theme_btn})` }}
    >
      {/* Progress bar */}
      <div className="h-2 bg-white/20 w-full">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isUrgent ? "bg-red-400" : isWarning ? "bg-yellow-400" : "bg-white"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2">
          <span className="text-white font-bold">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>
        
        {/* Timer */}
        <div className={`relative w-20 h-20 rounded-full flex items-center justify-center ${
          isUrgent ? "bg-red-500 animate-pulse" : isWarning ? "bg-yellow-500" : "bg-white"
        } shadow-2xl`}>
          <div className="flex flex-col items-center">
            <Clock className={`w-4 h-4 ${isUrgent || isWarning ? "text-white" : "text-gray-600"}`} />
            <span className={`font-black text-3xl ${
              isUrgent || isWarning ? "text-white" : "text-gray-900"
            }`}>
              {timeLeft}
            </span>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-white" />
          <span className="text-white font-bold">{answerCount}/{playerCount}</span>
        </div>
      </div>

      {/* Question Card */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl min-h-[120px] flex items-center justify-center">
          <p className="text-gray-900 font-black text-2xl md:text-4xl text-center text-balance leading-relaxed">
            {question.question_text}
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div className="flex-1 px-6 py-4">
        <div className="grid grid-cols-2 gap-4 h-full">
          {question.options.map((opt, idx) => (
            <div
              key={idx}
              className="rounded-3xl p-6 flex items-center gap-4 shadow-xl transition-transform hover:scale-[1.02]"
              style={{ 
                backgroundColor: ANSWER_COLORS[idx].bg,
                color: ANSWER_COLORS[idx].text || "white"
              }}
            >
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <span className="font-black text-2xl" style={{ color: ANSWER_COLORS[idx].text || "white" }}>
                  {String.fromCharCode(65 + idx)}
                </span>
              </div>
              <span className="font-bold text-xl md:text-2xl leading-snug">{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reveal button */}
      <div className="p-6 pb-8">
        <button
          onClick={() => { setRevealed(true); onReveal() }}
          className="w-full bg-white/20 backdrop-blur text-white py-5 rounded-2xl font-bold text-lg transition-all hover:bg-white/30 active:scale-[0.98] border-2 border-white/30"
        >
          Skip Timer & Reveal Answer
        </button>
      </div>
    </main>
  )
}

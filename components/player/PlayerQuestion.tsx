"use client"

import { useEffect, useState } from "react"
import { Question } from "@/lib/types"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  hasAnswered: boolean
  onAnswer: (selectedIndex: number, timeRemaining: number) => void
}

const ANSWER_STYLES = [
  { bg: "bg-[--answer-red]", hover: "hover:opacity-90", label: "A", shadow: "shadow-[--answer-red]/30" },
  { bg: "bg-[--answer-blue]", hover: "hover:opacity-90", label: "B", shadow: "shadow-[--answer-blue]/30" },
  { bg: "bg-[--answer-yellow]", hover: "hover:opacity-90", label: "C", shadow: "shadow-[--answer-yellow]/30" },
  { bg: "bg-[--answer-green]", hover: "hover:opacity-90", label: "D", shadow: "shadow-[--answer-green]/30" },
]

export default function PlayerQuestion({ question, questionNumber, totalQuestions, hasAnswered, onAnswer }: Props) {
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

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Timer bar */}
      <div className="h-2 bg-secondary w-full">
        <div
          className={`h-full transition-all duration-1000 ${
            timeLeft > 10 ? "bg-accent" : timeLeft > 5 ? "bg-[--answer-yellow]" : "bg-[--answer-red]"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="px-4 py-3 flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">Q{questionNumber}/{totalQuestions}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
          timeLeft <= 5 ? "bg-[--answer-red] text-white animate-pulse" :
          timeLeft <= 10 ? "bg-[--answer-yellow] text-white" :
          "bg-secondary text-foreground"
        }`}>
          {timeLeft}
        </div>
      </div>

      {/* Question */}
      <div className="px-4 pb-4">
        <div className="bg-card border border-border rounded-2xl p-5 min-h-[90px] flex items-center justify-center">
          <p className="text-foreground font-bold text-lg text-center text-balance leading-relaxed">
            {question.question_text}
          </p>
        </div>
      </div>

      {/* Answer Buttons */}
      <div className="flex-1 px-4 pb-8">
        {hasAnswered ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            {selected !== null && (
              <div className={`${ANSWER_STYLES[selected].bg} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg`}>
                <span className="text-white font-black text-2xl">{ANSWER_STYLES[selected].label}</span>
              </div>
            )}
            <div className="bg-card border border-border rounded-2xl p-5 text-center w-full max-w-xs">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2">
                <span className="text-accent font-bold text-lg">✓</span>
              </div>
              <p className="text-foreground font-bold">Answer submitted!</p>
              <p className="text-muted-foreground text-sm mt-1">Waiting for host...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 h-full">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`${ANSWER_STYLES[idx].bg} ${ANSWER_STYLES[idx].hover} rounded-2xl p-4 flex flex-col gap-2 shadow-lg ${ANSWER_STYLES[idx].shadow} transition-all active:scale-[0.95] text-left`}
              >
                <span className="text-white/80 text-xs font-bold">{ANSWER_STYLES[idx].label}</span>
                <span className="text-white font-semibold text-sm leading-relaxed">{opt}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

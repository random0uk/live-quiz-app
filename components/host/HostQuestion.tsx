"use client"

import { useEffect, useState } from "react"
import { Quiz, Question } from "@/lib/types"
import { Users } from "lucide-react"

interface Props {
  quiz: Quiz
  question: Question
  questionNumber: number
  totalQuestions: number
  answerCount: number
  playerCount: number
  onReveal: () => void
}

const ANSWER_STYLES = [
  { bg: "bg-[--answer-red]", label: "A" },
  { bg: "bg-[--answer-blue]", label: "B" },
  { bg: "bg-[--answer-yellow]", label: "C" },
  { bg: "bg-[--answer-green]", label: "D" },
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
  }, [timeLeft])

  const progress = (timeLeft / question.time_limit) * 100
  const timerColor = timeLeft > 10 ? "bg-accent" : timeLeft > 5 ? "bg-[--answer-yellow]" : "bg-[--answer-red]"

  return (
    <main className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="h-1.5 bg-secondary w-full">
        <div
          className={`h-full ${timerColor} transition-all duration-1000`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">
          Q{questionNumber}/{totalQuestions}
        </span>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-lg ${
          timeLeft <= 5 ? "bg-[--answer-red] text-white animate-pulse" :
          timeLeft <= 10 ? "bg-[--answer-yellow] text-white" :
          "bg-accent text-accent-foreground"
        }`}>
          {timeLeft}
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Users className="w-4 h-4" />
          <span>{answerCount}/{playerCount}</span>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col px-4 gap-5">
        <div className="bg-card border border-border rounded-2xl p-5 min-h-[100px] flex items-center justify-center">
          <p className="text-foreground font-bold text-xl text-center text-balance leading-relaxed">
            {question.question_text}
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, idx) => (
            <div
              key={idx}
              className={`${ANSWER_STYLES[idx].bg} rounded-2xl p-4 flex flex-col gap-1 shadow-md`}
            >
              <span className="text-white/80 text-xs font-bold">{ANSWER_STYLES[idx].label}</span>
              <span className="text-white font-semibold text-sm leading-relaxed">{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reveal button */}
      <div className="p-4 pb-8">
        <button
          onClick={() => { setRevealed(true); onReveal() }}
          className="w-full bg-secondary border border-border text-foreground py-4 rounded-2xl font-bold text-base transition-all hover:bg-secondary/80 active:scale-[0.98]"
        >
          Reveal Answer Early
        </button>
      </div>
    </main>
  )
}

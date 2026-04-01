"use client"

import { useEffect, useState } from "react"
import { Question } from "@/lib/types"
import { Check } from "lucide-react"
import { useSound } from "@/hooks/use-sound"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  hasAnswered: boolean
  onAnswer: (selectedIndex: number, timeRemaining: number) => void
}

const OPTION_COLORS = [
  "bg-[#e84855] hover:bg-[#d03a46] border-[#e84855]", // A - red
  "bg-[#3a86ff] hover:bg-[#2a76ef] border-[#3a86ff]", // B - blue
  "bg-[#f4a261] hover:bg-[#e49251] border-[#f4a261]", // C - orange
  "bg-[#2ec4b6] hover:bg-[#1eb4a6] border-[#2ec4b6]", // D - teal
]

export default function PlayerQuestion({ question, questionNumber, totalQuestions, hasAnswered, onAnswer }: Props) {
  const [timeLeft, setTimeLeft] = useState(question.time_limit)
  const [selected, setSelected] = useState<number | null>(null)
  const { play } = useSound()

  useEffect(() => {
    setTimeLeft(question.time_limit)
    setSelected(null)
  }, [question.id, question.time_limit])

  useEffect(() => {
    if (timeLeft <= 0 || hasAnswered) return
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, hasAnswered])

  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0 && !hasAnswered) {
      play("tick")
    }
  }, [timeLeft, hasAnswered, play])

  const handleSelect = (idx: number) => {
    if (hasAnswered || selected !== null) return
    setSelected(idx)
    onAnswer(idx, timeLeft)
  }

  const progress = (timeLeft / question.time_limit) * 100
  const isUrgent = timeLeft <= 5
  const opts = Array.isArray(question.options) ? question.options : []
  const type = question.type ?? "multiple_choice"

  if (hasAnswered) {
    return (
      <div className="h-screen flex flex-col bg-background overflow-hidden">
          {/* Header */}
        <div className="bg-primary pt-12 pb-8 px-5 flex flex-col items-center gap-2">
          <span className="text-primary-foreground/70 text-xs font-medium tracking-widest uppercase">
            Q{questionNumber} / {totalQuestions}
          </span>
          <p className="text-primary-foreground text-lg font-semibold text-center text-balance leading-snug">
            {question.question_text}
          </p>
        </div>

        {/* Answered state */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="text-xl font-bold">{type === "poll" ? "Vote Locked!" : "Answer Locked!"}</p>
            <p className="text-muted-foreground text-sm mt-1">Waiting for results...</p>
          </div>
          {selected !== null && (
            <div className={`px-5 py-3 rounded-2xl text-white font-semibold text-sm ${OPTION_COLORS[selected]?.split(" ")[0]}`}>
              {type === "true_false"
                ? (selected === 0 ? "True" : "False")
                : String(opts[selected])}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* Header: question + timer */}
      <div className={`pt-12 pb-6 px-5 flex flex-col gap-3 transition-colors duration-700 ${isUrgent ? "bg-destructive" : "bg-primary"}`}>
        <div className="flex items-center justify-between">
          <span className="text-white/70 text-xs font-medium tracking-widest uppercase">
            Q{questionNumber} / {totalQuestions}
          </span>
          {type !== "poll" && (
            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-sm bg-white/20 text-white ${isUrgent ? "animate-pulse" : ""}`}>
              {timeLeft}
            </span>
          )}
        </div>

        {/* Timer bar */}
        {type !== "poll" && (
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <p className="text-white text-base font-semibold text-balance leading-snug">
          {question.question_text}
        </p>
      </div>

      {/* Answer options — fill remaining screen */}
      <div className="flex-1 flex flex-col p-4 gap-3 justify-center">

        {/* True / False */}
        {type === "true_false" && (
          <div className="grid grid-cols-2 gap-3 h-full">
            {["True", "False"].map((label, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`rounded-2xl flex flex-col items-center justify-center gap-2 text-white font-bold text-lg transition-all active:scale-95 ${idx === 0 ? "bg-[#2ec4b6] hover:brightness-90" : "bg-[#e84855] hover:brightness-90"}`}
              >
                <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                  {idx === 0 ? "T" : "F"}
                </span>
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Multiple Choice */}
        {type === "multiple_choice" && (
          <div className="grid grid-cols-2 gap-3 flex-1">
            {opts.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`rounded-2xl flex flex-col items-center justify-center gap-2 p-4 text-white font-semibold text-sm transition-all active:scale-95 ${OPTION_COLORS[idx]?.split(" ").slice(0, 2).join(" ")}`}
              >
                <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-center leading-tight">{String(opt)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Poll */}
        {type === "poll" && (
          <div className="flex flex-col gap-3">
            {opts.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full p-4 rounded-2xl flex items-center gap-3 text-white font-semibold transition-all active:scale-[0.98] ${OPTION_COLORS[idx]?.split(" ").slice(0, 2).join(" ")}`}
              >
                <span className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center text-sm font-bold shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm text-left">{String(opt)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Question } from "@/lib/types"
import { Check } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  hasAnswered: boolean
  onAnswer: (selectedIndex: number, timeRemaining: number) => void
}

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
  const isUrgent = timeLeft <= 5
  const opts = Array.isArray(question.options) ? question.options : []
  const type = question.type ?? "multiple_choice"

  if (hasAnswered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-xs animate-scale-in">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary flex items-center justify-center">
              <Check className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">
                {type === "poll" ? "Vote Locked" : "Answer Locked"}
              </p>
              <p className="text-muted-foreground text-sm">Waiting for results...</p>
            </div>
            {selected !== null && (
              <div className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium">
                {type === "true_false"
                  ? (selected === 0 ? "True" : "False")
                  : opts[selected]}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xs animate-fade-in">
        <CardContent className="pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Q{questionNumber}/{totalQuestions}</span>
              {type === "poll" && (
                <span className="px-2 py-0.5 bg-secondary text-xs rounded-full text-muted-foreground">Poll</span>
              )}
            </div>
            {type !== "poll" && (
              <span className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold ${
                isUrgent ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-secondary"
              }`}>
                {timeLeft}
              </span>
            )}
          </div>

          {/* Timer bar (not for polls) */}
          {type !== "poll" && (
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  isUrgent ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Question */}
          <p className="text-sm font-medium text-center text-balance leading-relaxed">
            {question.question_text}
          </p>

          {/* True / False */}
          {type === "true_false" && (
            <div className="grid grid-cols-2 gap-3">
              {["True", "False"].map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className={`p-5 rounded-xl text-center font-semibold text-sm transition-all active:scale-95 border-2 ${
                    idx === 0
                      ? "bg-primary/10 border-primary text-primary hover:bg-primary/20"
                      : "bg-destructive/10 border-destructive text-destructive hover:bg-destructive/20"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Multiple Choice */}
          {type === "multiple_choice" && (
            <div className="grid grid-cols-2 gap-2">
              {opts.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className="p-4 bg-secondary hover:bg-secondary/70 rounded-xl text-center transition-all active:scale-95 border border-border hover:border-primary"
                >
                  <span className="text-primary font-bold block text-sm">{String.fromCharCode(65 + idx)}</span>
                  <span className="text-sm leading-tight block mt-0.5">{String(opt)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Poll */}
          {type === "poll" && (
            <div className="space-y-2">
              {opts.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className="w-full p-3.5 bg-secondary hover:bg-secondary/70 rounded-xl text-left text-sm font-medium transition-all active:scale-[0.98] border border-border hover:border-primary flex items-center gap-3"
                >
                  <span className="w-6 h-6 rounded-full border-2 border-primary text-primary text-xs font-bold flex items-center justify-center shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {String(opt)}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

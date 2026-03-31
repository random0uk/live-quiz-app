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

  if (hasAnswered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-xs animate-scale-in">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-primary flex items-center justify-center">
              <Check className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold">Answer Locked</p>
              <p className="text-muted-foreground text-sm">Waiting for results...</p>
            </div>
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
            <span className="text-muted-foreground">Q{questionNumber}/{totalQuestions}</span>
            <span className={`w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold ${
              isUrgent ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-secondary"
            }`}>
              {timeLeft}
            </span>
          </div>

          {/* Timer bar */}
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                isUrgent ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Question */}
          <p className="text-sm font-medium text-center text-balance">
            {question.question_text}
          </p>

          {/* Options */}
          <div className="grid grid-cols-2 gap-2">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className="p-4 bg-secondary hover:bg-secondary/80 rounded-xl text-center transition-all active:scale-95"
              >
                <span className="text-primary font-bold block">{String.fromCharCode(65 + idx)}</span>
                <span className="text-sm truncate block">{String(opt)}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

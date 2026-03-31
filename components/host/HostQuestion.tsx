"use client"

import { useEffect, useState, useRef } from "react"
import { Question } from "@/lib/types"
import { Users, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  question: Question
  questionNumber: number
  totalQuestions: number
  answerCount: number
  playerCount: number
  onReveal: () => void
  controlling?: boolean
}

export default function HostQuestion({
  question, questionNumber, totalQuestions, answerCount, playerCount, onReveal, controlling
}: Props) {
  const [timeLeft, setTimeLeft] = useState(question.time_limit)
  const revealedRef = useRef(false)

  useEffect(() => {
    setTimeLeft(question.time_limit)
    revealedRef.current = false
  }, [question.id, question.time_limit])

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!revealedRef.current) {
        revealedRef.current = true
        onReveal()
      }
      return
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, onReveal])

  const handleReveal = () => {
    if (!revealedRef.current && !controlling) {
      revealedRef.current = true
      onReveal()
    }
  }

  const progress = (timeLeft / question.time_limit) * 100
  const isUrgent = timeLeft <= 5

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardContent className="pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Q{questionNumber}/{totalQuestions}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{answerCount}/{playerCount}</span>
            </div>
          </div>

          {/* Timer */}
          <div className="relative">
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  isUrgent ? "bg-destructive" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center font-mono text-2xl font-bold ${
              isUrgent ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-card border border-border"
            }`}>
              {timeLeft}
            </div>
          </div>

          {/* Question */}
          <div className="pt-6">
            <p className="text-lg font-semibold text-center text-balance leading-relaxed">
              {question.question_text}
            </p>
          </div>

          {/* Options preview */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            {question.options.map((opt, i) => (
              <div
                key={i}
                className="p-3 bg-secondary rounded-lg text-center text-sm truncate"
              >
                <span className="text-primary font-bold mr-1">{String.fromCharCode(65 + i)}.</span>
                {String(opt)}
              </div>
            ))}
          </div>

          {/* Reveal Button */}
          <Button
            onClick={handleReveal}
            disabled={controlling}
            variant="secondary"
            className="w-full"
          >
            {controlling ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Reveal Answer
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

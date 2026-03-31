"use client"

import { Question, Answer, Player } from "@/lib/types"
import { Check, X, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  question: Question
  answers: Answer[]
  players: Player[]
  questionNumber: number
  totalQuestions: number
  onLeaderboard: () => void
  controlling?: boolean
}

export default function HostReveal({ 
  question, answers, players, questionNumber, totalQuestions, onLeaderboard, controlling 
}: Props) {
  const correctCount = answers.filter(a => a.is_correct).length
  const totalAnswers = answers.length

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardContent className="pt-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Q{questionNumber}/{totalQuestions}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              Answer Revealed
            </span>
          </div>

          {/* Question */}
          <p className="text-sm text-center text-muted-foreground text-balance">
            {question.question_text}
          </p>

          {/* Correct Answer */}
          <div className="p-4 bg-primary/10 border-2 border-primary rounded-xl">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="font-semibold text-primary">
                {String.fromCharCode(65 + question.correct_index)}. {String(question.options[question.correct_index])}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-center gap-1 text-primary">
                <Check className="w-4 h-4" />
                <span className="font-bold">{correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <div className="flex items-center justify-center gap-1 text-destructive">
                <X className="w-4 h-4" />
                <span className="font-bold">{totalAnswers - correctCount}</span>
              </div>
              <p className="text-xs text-muted-foreground">Wrong</p>
            </div>
            <div className="p-3 bg-secondary rounded-lg">
              <span className="font-bold text-muted-foreground">{players.length - totalAnswers}</span>
              <p className="text-xs text-muted-foreground">No Answer</p>
            </div>
          </div>

          {/* Leaderboard Button */}
          <Button
            onClick={onLeaderboard}
            disabled={controlling}
            className="w-full"
          >
            {controlling ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trophy className="w-4 h-4 mr-2" />
                Leaderboard
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

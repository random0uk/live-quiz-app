"use client"

import { Question, Answer, Player } from "@/lib/types"
import { Check, X, Trophy, BarChart2 } from "lucide-react"
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
  const opts = Array.isArray(question.options) ? question.options : []
  const type = question.type ?? "multiple_choice"
  const isPoll = type === "poll"
  const isTrueFalse = type === "true_false"
  const totalAnswers = answers.length
  const correctCount = answers.filter(a => a.is_correct).length

  const displayOpts = isTrueFalse ? ["True", "False"] : opts.map(String)

  // Per-option counts and percentages
  const optionCounts = displayOpts.map((_, i) => answers.filter(a => a.selected_index === i).length)
  const getPercent = (count: number) =>
    totalAnswers === 0 ? 0 : Math.round((count / totalAnswers) * 100)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardContent className="pt-6 space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Q{questionNumber}/{totalQuestions}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {isPoll ? "Poll Results" : "Answer Revealed"}
            </span>
          </div>

          <p className="text-sm text-center font-medium text-balance">{question.question_text}</p>

          {/* Per-option bars for every type */}
          <div className="space-y-2">
            {displayOpts.map((label, i) => {
              const count = optionCounts[i]
              const pct = getPercent(count)
              const isCorrect = !isPoll && i === question.correct_index
              return (
                <div key={i}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className={`font-medium flex items-center gap-1 ${isCorrect ? "text-primary" : "text-foreground"}`}>
                      {isCorrect && <Check className="w-3 h-3" />}
                      {!isPoll && !isTrueFalse && <span className="text-muted-foreground">{String.fromCharCode(65 + i)}. </span>}
                      {label}
                    </span>
                    <span className="text-muted-foreground font-mono">{pct}% <span className="text-muted-foreground/60">({count})</span></span>
                  </div>
                  <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPoll ? "bg-primary" : isCorrect ? "bg-primary" : "bg-destructive/50"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary row */}
          {!isPoll && (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-secondary rounded-lg">
                <p className="font-bold text-primary">{correctCount}</p>
                <p className="text-muted-foreground">Correct</p>
              </div>
              <div className="p-2 bg-secondary rounded-lg">
                <p className="font-bold text-destructive">{totalAnswers - correctCount}</p>
                <p className="text-muted-foreground">Wrong</p>
              </div>
              <div className="p-2 bg-secondary rounded-lg">
                <p className="font-bold text-muted-foreground">{players.length - totalAnswers}</p>
                <p className="text-muted-foreground">No reply</p>
              </div>
            </div>
          )}
          {isPoll && (
            <p className="text-xs text-muted-foreground text-center">{totalAnswers} of {players.length} voted</p>
          )}

          <Button onClick={onLeaderboard} disabled={controlling} className="w-full">
            {controlling ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPoll ? (
              <><BarChart2 className="w-4 h-4 mr-2" />Continue</>
            ) : (
              <><Trophy className="w-4 h-4 mr-2" />Leaderboard</>
            )}
          </Button>

        </CardContent>
      </Card>
    </div>
  )
}

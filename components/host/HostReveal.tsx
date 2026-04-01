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
  const correctCount = answers.filter(a => a.is_correct).length
  const totalAnswers = answers.length

  // Vote counts per option for poll
  const voteCounts = opts.map((_, i) => answers.filter(a => a.selected_index === i).length)
  const maxVotes = Math.max(...voteCounts, 1)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Q{questionNumber}/{totalQuestions}</span>
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
              {isPoll ? "Poll Results" : "Answer Revealed"}
            </span>
          </div>

          <p className="text-sm text-center text-muted-foreground text-balance">
            {question.question_text}
          </p>

          {isPoll ? (
            /* Poll: show vote bar chart */
            <div className="space-y-2">
              {opts.map((opt, i) => {
                const count = voteCounts[i]
                const pct = Math.round((count / maxVotes) * 100)
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium truncate">{String(opt)}</span>
                      <span className="text-muted-foreground ml-2 shrink-0">{count} vote{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
              <p className="text-xs text-muted-foreground text-center pt-1">{totalAnswers} of {players.length} voted</p>
            </div>
          ) : (
            /* Multiple choice / True-False: show correct answer + stats */
            <>
              <div className="p-4 bg-primary/10 border-2 border-primary rounded-xl">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-semibold text-primary text-sm">
                    {type === "true_false"
                      ? (question.correct_index === 0 ? "True" : "False")
                      : `${String.fromCharCode(65 + question.correct_index)}. ${String(opts[question.correct_index])}`
                    }
                  </span>
                </div>
              </div>
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
            </>
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

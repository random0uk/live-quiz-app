"use client"

import { Player, Question } from "@/lib/types"
import { ChevronRight, HelpCircle, ToggleLeft, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Props {
  players: Player[]
  questionNumber: number
  totalQuestions: number
  nextQuestion?: Question
  onNext: () => void
  controlling?: boolean
}

const TYPE_ICONS = {
  multiple_choice: HelpCircle,
  true_false: ToggleLeft,
  poll: BarChart3,
}

const TYPE_LABELS = {
  multiple_choice: "Multiple Choice",
  true_false: "True / False",
  poll: "Poll",
}

export default function HostLeaderboard({ players, questionNumber, totalQuestions, nextQuestion, onNext, controlling }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score)
  const isLastQuestion = questionNumber >= totalQuestions
  const top5 = sorted.slice(0, 5)

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-lg">Leaderboard</CardTitle>
          <p className="text-muted-foreground text-sm">Q{questionNumber}/{totalQuestions}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {top5.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 p-3 rounded-xl animate-scale-in ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary"
              }`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                i === 0 ? "bg-primary-foreground/20" : "bg-background"
              }`}>
                {i + 1}
              </span>
              <span className="flex-1 font-medium truncate">{player.name}</span>
              <span className="font-mono font-bold">{player.score}</span>
            </div>
          ))}

          {sorted.length > 5 && (
            <p className="text-center text-muted-foreground text-xs">
              +{sorted.length - 5} more players
            </p>
          )}

          {/* Next Question Preview */}
          {nextQuestion && !isLastQuestion && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl space-y-1.5 mt-2">
              <p className="text-xs text-muted-foreground font-medium">UP NEXT</p>
              <div className="flex items-start gap-2">
                {(() => {
                  const Icon = TYPE_ICONS[nextQuestion.type] || HelpCircle
                  return <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                })()}
                <div className="min-w-0">
                  <p className="text-xs text-primary font-medium">{TYPE_LABELS[nextQuestion.type] || "Question"}</p>
                  <p className="text-sm font-medium truncate">{nextQuestion.question_text}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={onNext}
            disabled={controlling}
            className="w-full mt-2"
          >
            {controlling ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isLastQuestion ? "Final Results" : "Next Question"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

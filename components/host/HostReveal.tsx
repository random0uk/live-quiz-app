"use client"

import { Quiz, Question, Answer, Player } from "@/lib/types"

interface Props {
  quiz: Quiz
  question: Question
  answers: Answer[]
  players: Player[]
  questionNumber: number
  totalQuestions: number
  onLeaderboard: () => void
}

const ANSWER_STYLES = [
  { bg: "bg-[--answer-red]", label: "A" },
  { bg: "bg-[--answer-blue]", label: "B" },
  { bg: "bg-[--answer-yellow]", label: "C" },
  { bg: "bg-[--answer-green]", label: "D" },
]

export default function HostReveal({ quiz, question, answers, players, questionNumber, totalQuestions, onLeaderboard }: Props) {
  const correctCount = answers.filter(a => a.is_correct).length
  const totalAnswers = answers.length

  // Count per option
  const optionCounts = question.options.map((_, idx) =>
    answers.filter(a => a.selected_index === idx).length
  )
  const maxCount = Math.max(...optionCounts, 1)

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="px-4 py-4 flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">Q{questionNumber}/{totalQuestions}</span>
        <div className="bg-accent text-accent-foreground px-3 py-1.5 rounded-xl text-sm font-bold">
          Answer Revealed
        </div>
      </div>

      <div className="flex-1 flex flex-col px-4 gap-5">
        {/* Question */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-foreground font-bold text-lg text-center text-balance leading-relaxed">
            {question.question_text}
          </p>
        </div>

        {/* Answer bars */}
        <div className="flex flex-col gap-2">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.correct_index
            const count = optionCounts[idx]
            const pct = totalAnswers > 0 ? (count / maxCount) * 100 : 0
            return (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden border-2 transition-all ${
                  isCorrect ? "border-white/60" : "border-transparent opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 ${ANSWER_STYLES[idx].bg}`}>
                    {ANSWER_STYLES[idx].label}
                  </span>
                  <span className="text-foreground font-medium text-sm flex-1">{opt}</span>
                  {isCorrect && (
                    <span className="text-accent font-bold text-lg">✓</span>
                  )}
                  <span className="text-muted-foreground font-bold text-sm">{count}</span>
                </div>
                {/* Bar */}
                <div className="h-1.5 bg-secondary w-full">
                  <div
                    className={`h-full transition-all duration-700 ${isCorrect ? ANSWER_STYLES[idx].bg : "bg-muted-foreground/30"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats */}
        <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-around">
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{correctCount}</div>
            <div className="text-muted-foreground text-xs">Correct</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{totalAnswers - correctCount}</div>
            <div className="text-muted-foreground text-xs">Wrong</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-2xl font-black text-foreground">{players.length - totalAnswers}</div>
            <div className="text-muted-foreground text-xs">No Answer</div>
          </div>
        </div>
      </div>

      <div className="p-4 pb-8">
        <button
          onClick={onLeaderboard}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Show Leaderboard
        </button>
      </div>
    </main>
  )
}

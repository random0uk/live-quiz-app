"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trophy, Users, Calendar, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import type { Quiz, Player } from "@/lib/types"

interface QuizWithPlayers extends Quiz {
  players: Player[]
}

export default function HistoryPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizWithPlayers[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithPlayers | null>(null)

  useEffect(() => {
    if (localStorage.getItem("organizer_auth") !== "true") {
      router.push("/")
      return
    }
    fetchQuizzes()
  }, [router])

  const fetchQuizzes = async () => {
    const supabase = createClient()
    const { data: quizzesData } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false })

    if (!quizzesData) {
      setLoading(false)
      return
    }

    // Fetch players for each quiz
    const quizzesWithPlayers = await Promise.all(
      quizzesData.map(async (quiz) => {
        const { data: players } = await supabase
          .from("players")
          .select("*")
          .eq("quiz_id", quiz.id)
          .order("score", { ascending: false })
        return { ...quiz, players: players || [] }
      })
    )

    setQuizzes(quizzesWithPlayers)
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Detail view for a single quiz
  if (selectedQuiz) {
    const sorted = [...selectedQuiz.players].sort((a, b) => b.score - a.score)
    const top3 = sorted.slice(0, 3)
    const rest = sorted.slice(3)

    return (
      <div className="min-h-screen flex flex-col items-center p-4">
        <div className="w-full max-w-md space-y-4">
          <button
            onClick={() => setSelectedQuiz(null)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to History
          </button>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{selectedQuiz.title}</CardTitle>
              <p className="text-muted-foreground text-xs flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(selectedQuiz.created_at)}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 text-center">
                <div className="flex-1 p-3 bg-secondary rounded-xl">
                  <p className="text-2xl font-bold">{selectedQuiz.players.length}</p>
                  <p className="text-xs text-muted-foreground">Players</p>
                </div>
                <div className="flex-1 p-3 bg-secondary rounded-xl">
                  <p className="text-2xl font-bold uppercase">{selectedQuiz.game_code}</p>
                  <p className="text-xs text-muted-foreground">Code</p>
                </div>
                <div className="flex-1 p-3 bg-secondary rounded-xl">
                  <p className="text-2xl font-bold capitalize">{selectedQuiz.mode ?? "classic"}</p>
                  <p className="text-xs text-muted-foreground">Mode</p>
                </div>
              </div>

              {/* Podium */}
              {top3.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    Top Players
                  </p>
                  <div className="flex items-end justify-center gap-2 py-4">
                    {/* 2nd place */}
                    {top3[1] && (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-20 bg-secondary rounded-t-lg flex flex-col items-center justify-end pb-2">
                          <span className="text-lg font-bold text-muted-foreground">2</span>
                        </div>
                        <div className="w-16 p-2 bg-card border border-border rounded-b-lg text-center">
                          <p className="text-xs font-medium truncate">{top3[1].name}</p>
                          <p className="text-xs text-muted-foreground">{top3[1].score}</p>
                        </div>
                      </div>
                    )}
                    {/* 1st place */}
                    {top3[0] && (
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-28 bg-primary/20 border-2 border-primary rounded-t-lg flex flex-col items-center justify-end pb-2">
                          <Trophy className="w-6 h-6 text-primary mb-1" />
                          <span className="text-xl font-bold text-primary">1</span>
                        </div>
                        <div className="w-20 p-2 bg-primary/10 border-2 border-primary rounded-b-lg text-center">
                          <p className="text-sm font-bold truncate text-primary">{top3[0].name}</p>
                          <p className="text-xs text-primary">{top3[0].score}</p>
                        </div>
                      </div>
                    )}
                    {/* 3rd place */}
                    {top3[2] && (
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-secondary rounded-t-lg flex flex-col items-center justify-end pb-2">
                          <span className="text-lg font-bold text-muted-foreground">3</span>
                        </div>
                        <div className="w-16 p-2 bg-card border border-border rounded-b-lg text-center">
                          <p className="text-xs font-medium truncate">{top3[2].name}</p>
                          <p className="text-xs text-muted-foreground">{top3[2].score}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rest of players */}
              {rest.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold">All Players</p>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {rest.map((p, i) => (
                      <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                        <span className="w-6 text-center text-sm text-muted-foreground">{i + 4}</span>
                        <span className="flex-1 text-sm truncate">{p.name}</span>
                        <span className="font-mono text-sm font-bold">{p.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedQuiz.players.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No players joined this quiz</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // List view
  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">Quiz History</h1>
          <Link href="/organizer">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No quizzes yet</p>
              <Link href="/organizer">
                <Button className="mt-4">Create Your First Quiz</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {quizzes.map(quiz => {
              const winner = quiz.players[0]
              return (
                <Card
                  key={quiz.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedQuiz(quiz)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{quiz.title}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {quiz.players.length}
                          </span>
                          <span className="uppercase font-mono">{quiz.game_code}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            quiz.status === "finished" ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                          }`}>
                            {quiz.status}
                          </span>
                        </div>
                        {winner && (
                          <p className="text-xs mt-1 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-primary" />
                            <span className="font-medium">{winner.name}</span>
                            <span className="text-muted-foreground">({winner.score} pts)</span>
                          </p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

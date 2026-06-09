"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trophy, Users, Calendar, ChevronRight, Zap, BarChart2, Clock, Star, TrendingUp, Play } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Quiz, Player } from "@/lib/types"

interface QuizWithPlayers extends Quiz {
  players: Player[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizWithPlayers[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithPlayers | null>(null)
  const [organizerName, setOrganizerName] = useState("Organizer")

  useEffect(() => {
    if (localStorage.getItem("organizer_auth") !== "true") {
      router.push("/")
      return
    }
    fetchData()
  }, [router])

  const fetchData = async () => {
    const supabase = createClient()

    const [{ data: settings }, { data: quizzesData }] = await Promise.all([
      supabase.from("organizer_settings").select("organizer_name").eq("id", 1).single(),
      supabase.from("quizzes").select("*").order("created_at", { ascending: false }),
    ])

    if (settings?.organizer_name) setOrganizerName(settings.organizer_name)

    if (!quizzesData) { setLoading(false); return }

    const quizzesWithPlayers = await Promise.all(
      quizzesData.map(async (quiz) => {
        const { data: players } = await supabase
          .from("players").select("*").eq("quiz_id", quiz.id).order("score", { ascending: false })
        return { ...quiz, players: players || [] }
      })
    )
    setQuizzes(quizzesWithPlayers)
    setLoading(false)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  }

  // Compute KPIs
  const totalQuizzes = quizzes.length
  const totalPlayers = quizzes.reduce((acc, q) => acc + q.players.length, 0)
  const finishedQuizzes = quizzes.filter((q) => q.status === "finished").length
  const avgPlayers = totalQuizzes > 0 ? Math.round(totalPlayers / totalQuizzes) : 0
  const topScore = quizzes.flatMap((q) => q.players).reduce((max, p) => Math.max(max, p.score), 0)
  const recentQuiz = quizzes[0]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Detail view ──
  if (selectedQuiz) {
    const sorted = [...selectedQuiz.players].sort((a, b) => b.score - a.score)
    const top3 = sorted.slice(0, 3)
    const rest = sorted.slice(3)
    const medals = ["🥇", "🥈", "🥉"]

    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-md mx-auto px-4 py-6 space-y-5">
          <button
            onClick={() => setSelectedQuiz(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          {/* Quiz header card */}
          <div className="rounded-2xl bg-foreground text-background p-5">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60 mb-1">{formatDate(selectedQuiz.created_at)} · {formatTime(selectedQuiz.created_at)}</p>
            <h2 className="text-xl font-black leading-tight mb-3">{selectedQuiz.title}</h2>
            <div className="flex gap-3">
              <div className="flex-1 bg-background/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-black">{selectedQuiz.players.length}</p>
                <p className="text-xs opacity-60 mt-0.5">Players</p>
              </div>
              <div className="flex-1 bg-background/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-black uppercase font-mono">{selectedQuiz.game_code}</p>
                <p className="text-xs opacity-60 mt-0.5">Code</p>
              </div>
              <div className="flex-1 bg-background/10 rounded-xl p-3 text-center">
                <p className="text-2xl font-black capitalize">{selectedQuiz.mode ?? "classic"}</p>
                <p className="text-xs opacity-60 mt-0.5">Mode</p>
              </div>
            </div>
          </div>

          {/* Podium */}
          {top3.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-bold flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Top Players
              </p>
              <div className="flex items-end justify-center gap-3">
                {[top3[1], top3[0], top3[2]].map((p, idx) => {
                  if (!p) return <div key={idx} className="w-20" />
                  const realIdx = idx === 0 ? 1 : idx === 1 ? 0 : 2
                  const heights = ["h-20", "h-28", "h-16"]
                  const colors = ["bg-gray-100", "bg-yellow-400", "bg-orange-100"]
                  return (
                    <div key={p.id} className="flex flex-col items-center gap-1">
                      <span className="text-lg">{medals[realIdx]}</span>
                      <div className={`w-20 ${heights[idx]} ${colors[idx]} rounded-t-xl flex items-end justify-center pb-2`}>
                        <span className="text-xs font-bold text-gray-600">{realIdx + 1}</span>
                      </div>
                      <div className="w-20 text-center">
                        <p className="text-xs font-bold truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.score} pts</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rest of players */}
          {rest.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-5">
              <p className="text-sm font-bold mb-3">All Players</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sorted.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                    <span className="w-5 text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium truncate">{p.name}</span>
                    <span className="text-sm font-bold text-yellow-500">{p.score} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedQuiz.players.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No players joined this quiz</p>
          )}
        </div>
      </div>
    )
  }

  // ── Dashboard view ──
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500">Dashboard</p>
            <h1 className="text-2xl font-black text-foreground">Hey, {organizerName} 👋</h1>
          </div>
          <Link href="/organizer">
            <button className="flex items-center gap-1.5 text-xs font-semibold bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-2 rounded-xl transition-colors">
              <Play className="w-3.5 h-3.5" />
              New Quiz
            </button>
          </Link>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-foreground text-background p-4">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-4 h-4 opacity-60" />
              <span className="text-xs opacity-50">Total</span>
            </div>
            <p className="text-3xl font-black">{totalQuizzes}</p>
            <p className="text-xs opacity-60 mt-0.5">Quizzes run</p>
          </div>

          <div className="rounded-2xl bg-yellow-400 text-black p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-4 h-4 opacity-60" />
              <span className="text-xs opacity-50">All time</span>
            </div>
            <p className="text-3xl font-black">{totalPlayers}</p>
            <p className="text-xs opacity-60 mt-0.5">Players joined</p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Avg</span>
            </div>
            <p className="text-3xl font-black text-foreground">{avgPlayers}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Players/quiz</p>
          </div>

          <div className="rounded-2xl bg-card border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Best</span>
            </div>
            <p className="text-3xl font-black text-foreground">{topScore > 0 ? topScore.toLocaleString() : "—"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Top score ever</p>
          </div>
        </div>

        {/* Last quiz snapshot */}
        {recentQuiz && (
          <div
            className="rounded-2xl bg-card border border-border p-4 cursor-pointer hover:border-yellow-400/50 transition-colors"
            onClick={() => setSelectedQuiz(recentQuiz)}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500">Latest Quiz</p>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="font-black text-foreground text-lg leading-tight">{recentQuiz.title}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recentQuiz.players.length} players</span>
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(recentQuiz.created_at)}</span>
              <span className={`px-2 py-0.5 rounded-full font-semibold ${recentQuiz.status === "finished" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {recentQuiz.status}
              </span>
            </div>
          </div>
        )}

        {/* Quiz history list */}
        <div>
          <p className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-yellow-400" />
            Quiz History
          </p>

          {quizzes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <p className="font-bold text-foreground">No quizzes yet</p>
              <p className="text-sm text-muted-foreground mt-1">Run your first quiz to see stats here</p>
              <Link href="/organizer">
                <button className="mt-4 px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-sm transition-colors">
                  Create Quiz
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {quizzes.map((quiz) => {
                const winner = quiz.players[0]
                return (
                  <div
                    key={quiz.id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border cursor-pointer hover:border-yellow-400/50 transition-colors"
                    onClick={() => setSelectedQuiz(quiz)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Zap className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm truncate">{quiz.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-0.5"><Users className="w-3 h-3" />{quiz.players.length}</span>
                        <span className="font-mono uppercase">{quiz.game_code}</span>
                        <span className={`px-1.5 py-0.5 rounded-full ${quiz.status === "finished" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {quiz.status}
                        </span>
                      </div>
                      {winner && (
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-400" />
                          {winner.name} · {winner.score} pts
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

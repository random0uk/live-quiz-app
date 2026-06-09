"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Trophy, Users, Calendar, ChevronRight, Zap, BarChart2, Clock, Star, TrendingUp, Play, LogOut, Menu, X } from "lucide-react"
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
  const [sidebarOpen, setSidebarOpen] = useState(true)

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

  const handleLogout = () => {
    localStorage.removeItem("organizer_auth")
    router.push("/")
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

  // ── Detail view (mobile) ──
  if (selectedQuiz) {
    const sorted = [...selectedQuiz.players].sort((a, b) => b.score - a.score)
    const top3 = sorted.slice(0, 3)
    const rest = sorted.slice(3)
    const medals = ["🥇", "🥈", "🥉"]

    return (
      <div className="min-h-screen bg-background lg:hidden">
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
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4" />
                {selectedQuiz.players.length} Players
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 text-yellow-400" />
                {Math.max(...selectedQuiz.players.map(p => p.score))} Top Score
              </div>
            </div>
          </div>

          {/* Top 3 Medal */}
          <div className="grid grid-cols-3 gap-3">
            {top3.map((player, idx) => (
              <div key={player.id} className="rounded-2xl bg-card p-4 text-center">
                <div className="text-2xl mb-2">{medals[idx]}</div>
                <p className="font-black text-lg text-foreground mb-1">{player.score}</p>
                <p className="text-xs text-muted-foreground truncate">{player.name}</p>
              </div>
            ))}
          </div>

          {/* Rest */}
          {rest.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Other Players</p>
              {rest.map((player, idx) => (
                <div key={player.id} className="flex items-center justify-between bg-card p-3 rounded-xl">
                  <div>
                    <p className="font-semibold text-foreground">{player.name}</p>
                    <p className="text-xs text-muted-foreground">#{idx + 4} • {player.score} pts</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Desktop Main Dashboard ──
  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header + sidebar toggle */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-border">
        <h1 className="font-black text-lg">Awane Dashboard</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar - Desktop always, Mobile conditional */}
        {(sidebarOpen || typeof window === 'undefined' || window.innerWidth >= 1024) && (
          <div className="hidden lg:flex lg:w-64 flex-col border-r border-border bg-card/30 p-6">
            <div className="mb-8">
              <h2 className="text-lg font-black text-foreground mb-1">Awane</h2>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>

            <nav className="space-y-1 flex-1">
              <div className="px-3 py-2 rounded-lg bg-yellow-400/10 border border-yellow-400/20">
                <div className="flex items-center gap-2 font-semibold text-yellow-600">
                  <BarChart2 className="w-4 h-4" />
                  Overview
                </div>
              </div>
            </nav>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-widest">Account</p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-3 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 lg:p-8 p-4">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600 mb-1">Dashboard</p>
              <h1 className="text-2xl lg:text-3xl font-black text-foreground">
                Hey, {organizerName} 👋
              </h1>
            </div>
            <button className="hidden lg:flex items-center gap-2 mt-4 lg:mt-0 h-10 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors">
              <Zap className="w-4 h-4" />
              New Quiz
            </button>
          </div>

          {/* KPI Grid - 2x2 on mobile, 4 columns on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-8">
            {/* KPI 1: Total Quizzes */}
            <div className="rounded-2xl bg-foreground text-background p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <Zap className="w-5 h-5 opacity-60" />
                <span className="text-xs font-semibold text-yellow-300">Total</span>
              </div>
              <p className="text-2xl lg:text-3xl font-black mb-1">{totalQuizzes}</p>
              <p className="text-xs opacity-70">Quizzes run</p>
            </div>

            {/* KPI 2: Total Players */}
            <div className="rounded-2xl bg-yellow-400 text-black p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <Users className="w-5 h-5 opacity-60" />
                <span className="text-xs font-semibold">All time</span>
              </div>
              <p className="text-2xl lg:text-3xl font-black mb-1">{totalPlayers}</p>
              <p className="text-xs opacity-70">Players joined</p>
            </div>

            {/* KPI 3: Avg Players */}
            <div className="rounded-2xl bg-card p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-600">Avg</span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-foreground mb-1">{avgPlayers}</p>
              <p className="text-xs text-muted-foreground">Players/quiz</p>
            </div>

            {/* KPI 4: Top Score */}
            <div className="rounded-2xl bg-card p-4 lg:p-6">
              <div className="flex items-center justify-between mb-3">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-600">Best</span>
              </div>
              <p className="text-2xl lg:text-3xl font-black text-foreground mb-1">{topScore.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Top score ever</p>
            </div>
          </div>

          {/* Latest Quiz Card */}
          {recentQuiz && (
            <div className="rounded-2xl bg-card border border-yellow-400/30 p-5 lg:p-6 mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600 mb-2">Latest Quiz</p>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg lg:text-xl font-black text-foreground mb-1">{recentQuiz.title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {recentQuiz.players.length} players
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(recentQuiz.created_at)}
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-yellow-400/20 text-yellow-700 rounded-full text-xs font-semibold">
                      {recentQuiz.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuiz(recentQuiz)}
                  className="ml-4 p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Quiz History */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg lg:text-xl font-black text-foreground">Quiz History</h2>
              {quizzes.length > 0 && (
                <p className="text-xs text-muted-foreground">{quizzes.length} total</p>
              )}
            </div>

            {quizzes.length === 0 ? (
              <div className="rounded-2xl bg-card border border-dashed border-border p-8 text-center">
                <p className="text-muted-foreground text-sm">No quizzes yet. Create your first one to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 lg:space-y-3">
                {quizzes.map((quiz) => (
                  <button
                    key={quiz.id}
                    onClick={() => setSelectedQuiz(quiz)}
                    className="w-full rounded-2xl bg-card hover:bg-secondary transition-colors p-4 lg:p-5 flex items-center justify-between group"
                  >
                    <div className="flex items-start gap-3 flex-1 text-left">
                      <div className="flex-shrink-0">
                        <Zap className="w-5 h-5 text-yellow-500 mt-1" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground group-hover:text-yellow-600 transition-colors">{quiz.title}</h3>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-1">
                          <span>👥 {quiz.players.length}</span>
                          <span>📅 {formatDate(quiz.created_at)}</span>
                          <span className="inline-block px-2 py-0.5 bg-yellow-400/10 text-yellow-700 rounded text-xs font-semibold">
                            {quiz.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Trophy, Users, Calendar, ChevronRight, Zap,
  BarChart2, Star, TrendingUp, LogOut, Plus, Activity,
  Hash, Target, Menu, X
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts"
import type { Quiz, Player } from "@/lib/types"

interface QuizWithPlayers extends Quiz {
  players: Player[]
}

const getDayLabel = (offset: number) => {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  return d.toLocaleDateString("en-US", { weekday: "short" })
}

export default function DashboardPage() {
  const router = useRouter()
  const [quizzes, setQuizzes] = useState<QuizWithPlayers[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithPlayers | null>(null)
  const [organizerName, setOrganizerName] = useState("Organizer")
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("organizer_auth") !== "true") {
      router.push("/"); return
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

  const getHour = () => {
    const h = new Date().getHours()
    if (h < 12) return "Good morning"
    if (h < 17) return "Good afternoon"
    return "Good evening"
  }

  // KPIs
  const totalQuizzes = quizzes.length
  const totalPlayers = quizzes.reduce((acc, q) => acc + q.players.length, 0)
  const avgPlayers = totalQuizzes > 0 ? Math.round(totalPlayers / totalQuizzes) : 0
  const topScore = quizzes.flatMap(q => q.players).reduce((max, p) => Math.max(max, p.score), 0)
  const finishedCount = quizzes.filter(q => q.status === "finished").length
  const recentQuiz = quizzes[0]

  // Activity chart data — players per day for last 7 days
  const activityData = Array.from({ length: 7 }, (_, i) => {
    const offset = 6 - i
    const day = getDayLabel(offset)
    const d = new Date(); d.setDate(d.getDate() - offset)
    const dateStr = d.toDateString()
    const count = quizzes
      .filter(q => new Date(q.created_at).toDateString() === dateStr)
      .reduce((sum, q) => sum + q.players.length, 0)
    return { day, players: count }
  })

  // Recent sessions for right panel
  const recentSessions = quizzes.slice(0, 6)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7]">
        <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Detail view ──
  if (selectedQuiz) {
    const sorted = [...selectedQuiz.players].sort((a, b) => b.score - a.score)
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-4 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-4">
          <button
            onClick={() => setSelectedQuiz(null)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="bg-gray-900 text-white rounded-2xl p-6">
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-widest">{formatDate(selectedQuiz.created_at)}</p>
            <h2 className="text-2xl font-black mb-3">{selectedQuiz.title}</h2>
            <div className="flex gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1"><Users className="w-4 h-4" />{selectedQuiz.players.length} Players</span>
              <span className="inline-block px-2 py-0.5 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-semibold">{selectedQuiz.status}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {sorted.map((player, idx) => (
              <div key={player.id} className={`flex items-center justify-between px-5 py-4 ${idx < sorted.length - 1 ? "border-b border-gray-100" : ""}`}>
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">#{idx + 1}</span>
                  <span className="font-semibold text-gray-900">{player.name}</span>
                </div>
                <span className="font-black text-gray-900">{player.score.toLocaleString()} pts</span>
              </div>
            ))}
            {sorted.length === 0 && <p className="text-center text-gray-400 py-8 text-sm">No players joined this quiz</p>}
          </div>
        </div>
      </div>
    )
  }

  // ── Main Dashboard ──
  return (
    <div className="flex h-screen bg-[#F5F5F7] overflow-hidden">

      {/* ── LEFT SIDEBAR ── */}
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-56 flex flex-col bg-white border-r border-gray-100 transition-transform duration-300
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">Awane<span className="text-yellow-400">.</span></h2>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-3 mb-2">Workspace</p>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gray-900 text-white font-semibold text-sm">
            <BarChart2 className="w-4 h-4" />
            Overview
          </div>
          <Link href="/organizer" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <Zap className="w-4 h-4" />
            My Quizzes
          </Link>
          <Link href="/organizer" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 font-medium text-sm transition-colors">
            <Plus className="w-4 h-4" />
            New Quiz
          </Link>
        </nav>

        {/* User / logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center font-black text-black text-sm flex-shrink-0">
              {organizerName[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{organizerName}</p>
            </div>
            <button onClick={handleLogout} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Logout">
              <LogOut className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <p className="text-xs text-gray-400">{getHour()},</p>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">{organizerName}</h1>
            </div>
          </div>
          <Link href="/organizer">
            <button className="flex items-center gap-2 h-10 px-5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-colors text-sm shadow-sm">
              <Plus className="w-4 h-4" />
              New Quiz
            </button>
          </Link>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex gap-0 h-full">

            {/* Center content */}
            <div className="flex-1 p-6 min-w-0">

              {/* 4 KPI cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                    <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">+{totalQuizzes}</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-0.5">{totalQuizzes}</p>
                  <p className="text-xs text-gray-400">Total Quizzes</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-xs font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded-full">All time</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-0.5">{totalPlayers}</p>
                  <p className="text-xs text-gray-400">Total Players</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-yellow-50 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-yellow-500" />
                    </div>
                    <span className="text-xs font-semibold text-yellow-500 bg-yellow-50 px-2 py-0.5 rounded-full">Avg</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-0.5">{avgPlayers}</p>
                  <p className="text-xs text-gray-400">Players / Quiz</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">Best</span>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mb-0.5">{topScore > 0 ? topScore.toLocaleString() : "—"}</p>
                  <p className="text-xs text-gray-400">Top Score Ever</p>
                </div>
              </div>

              {/* Activity Chart */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Activity</h3>
                    <p className="text-xs text-gray-400">Players joined over the last 7 days</p>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    {["7d", "14d", "30d"].map((t) => (
                      <button key={t} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${t === "7d" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="playerGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#1f2937", border: "none", borderRadius: "12px", color: "#fff", fontSize: 12 }}
                        cursor={{ stroke: "#facc15", strokeWidth: 1.5, strokeDasharray: "4 4" }}
                      />
                      <Area type="monotone" dataKey="players" stroke="#facc15" strokeWidth={2.5} fill="url(#playerGrad)" dot={false} activeDot={{ r: 5, fill: "#facc15" }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom two panels */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

                {/* Latest Quiz panel */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Latest Quiz</h3>
                    {recentQuiz && (
                      <button
                        onClick={() => setSelectedQuiz(recentQuiz)}
                        className="text-xs text-yellow-600 font-semibold hover:text-yellow-700"
                      >
                        View All
                      </button>
                    )}
                  </div>
                  {recentQuiz ? (
                    <button
                      onClick={() => setSelectedQuiz(recentQuiz)}
                      className="w-full text-left bg-yellow-50 border border-yellow-100 rounded-xl p-4 hover:bg-yellow-100 transition-colors"
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-yellow-600 mb-1">Latest</p>
                      <h4 className="font-black text-gray-900 mb-2">{recentQuiz.title}</h4>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{recentQuiz.players.length} players</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(recentQuiz.created_at)}</span>
                        <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full font-semibold">{recentQuiz.status}</span>
                      </div>
                    </button>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-8">No quizzes yet</p>
                  )}

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-lg font-black text-gray-900">{finishedCount}</p>
                      <p className="text-xs text-gray-400">Finished</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-lg font-black text-gray-900">{totalQuizzes - finishedCount}</p>
                      <p className="text-xs text-gray-400">In Progress</p>
                    </div>
                  </div>
                </div>

                {/* Quiz History list */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Quiz History</h3>
                    <span className="text-xs text-gray-400">{totalQuizzes} total</span>
                  </div>
                  <div className="space-y-1 max-h-72 overflow-y-auto">
                    {quizzes.slice(0, 8).map((quiz, idx) => (
                      <button
                        key={quiz.id}
                        onClick={() => setSelectedQuiz(quiz)}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 transition-colors group text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-yellow-600 transition-colors">{quiz.title}</p>
                          <p className="text-xs text-gray-400">{quiz.players.length} players · {formatDate(quiz.created_at)}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${quiz.status === "finished" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                          {quiz.status}
                        </span>
                      </button>
                    ))}
                    {quizzes.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-8">No quizzes yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL ── desktop only */}
            <aside className="hidden xl:flex w-72 flex-shrink-0 flex-col border-l border-gray-100 bg-white p-5 overflow-y-auto gap-4">

              {/* Mini stat cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">{totalQuizzes}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Total Quizzes</p>
                </div>
                <div className="bg-yellow-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-yellow-600">{finishedCount}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Finished</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">{totalPlayers}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Players</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-black text-gray-900">{avgPlayers}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Avg/Quiz</p>
                </div>
              </div>

              {/* Recent sessions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Recent Sessions</h3>
                  <Link href="/organizer" className="text-xs text-yellow-600 font-semibold hover:text-yellow-700">View All</Link>
                </div>
                <div className="space-y-1">
                  {recentSessions.map((quiz) => {
                    const initials = quiz.title.slice(0, 2).toUpperCase()
                    const colors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500", "bg-teal-500"]
                    const color = colors[quiz.id.charCodeAt(0) % colors.length]
                    const top = quiz.players[0]
                    return (
                      <button
                        key={quiz.id}
                        onClick={() => setSelectedQuiz(quiz)}
                        className="w-full flex items-center gap-3 py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                      >
                        <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-yellow-600 transition-colors">{quiz.title}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 truncate">
                            {top ? <><Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />{top.name}</> : `${quiz.players.length} players`}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                  {recentSessions.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">No sessions yet</p>
                  )}
                </div>
              </div>

              {/* CTA card */}
              <Link href="/organizer" className="block bg-gray-900 text-white rounded-2xl p-5 hover:bg-gray-800 transition-colors mt-auto">
                <div className="w-8 h-8 rounded-xl bg-yellow-400 flex items-center justify-center mb-3">
                  <Zap className="w-4 h-4 text-black" />
                </div>
                <h4 className="font-bold text-sm mb-1">Start a Quiz</h4>
                <p className="text-xs text-gray-400 mb-3">Launch a new session and invite players to join live.</p>
                <div className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-xs rounded-xl text-center transition-colors">
                  Go to Builder
                </div>
              </Link>
            </aside>

          </div>
        </div>
      </main>
    </div>
  )
}

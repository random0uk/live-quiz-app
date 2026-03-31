"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Quiz, Question, Player, Answer } from "@/lib/types"
import { Zap, Users, Monitor, Eye, Trophy, SkipForward, Play } from "lucide-react"
import HostLobby from "@/components/host/HostLobby"

const ANSWER_COLORS = [
  { bg: "#ef4444", label: "A" },
  { bg: "#3b82f6", label: "B" },
  { bg: "#f59e0b", label: "C" },
  { bg: "#10b981", label: "D" },
]

export default function HostControlPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchData = useCallback(async () => {
    const [quizRes, questionsRes, playersRes] = await Promise.all([
      supabase.from("quizzes").select("*").eq("id", id).single(),
      supabase.from("questions").select("*").eq("quiz_id", id).order("position"),
      supabase.from("players").select("*").eq("quiz_id", id).order("score", { ascending: false }),
    ])
    if (quizRes.data) setQuiz(quizRes.data)
    if (questionsRes.data) setQuestions(questionsRes.data)
    if (playersRes.data) setPlayers(playersRes.data)
    setLoading(false)
  }, [id])

  const fetchAnswers = useCallback(async (questionId: string) => {
    const { data } = await supabase.from("answers").select("*").eq("question_id", questionId)
    if (data) setAnswers(data)
  }, [])

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel(`control-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "quizzes", filter: `id=eq.${id}` }, (payload) => {
        setQuiz(payload.new as Quiz)
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "players", filter: `quiz_id=eq.${id}` }, () => {
        supabase.from("players").select("*").eq("quiz_id", id).order("score", { ascending: false }).then(({ data }) => {
          if (data) setPlayers(data)
        })
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "players", filter: `quiz_id=eq.${id}` }, () => {
        supabase.from("players").select("*").eq("quiz_id", id).order("score", { ascending: false }).then(({ data }) => {
          if (data) setPlayers(data)
        })
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "answers", filter: `quiz_id=eq.${id}` }, (payload) => {
        setAnswers(prev => {
          const exists = prev.find(a => a.id === (payload.new as Answer).id)
          return exists ? prev : [...prev, payload.new as Answer]
        })
      })
      .subscribe()
    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [id, fetchData])

  useEffect(() => {
    if (!quiz || !questions.length) return
    if (quiz.status === "question" || quiz.status === "answer_reveal") {
      const q = questions[quiz.current_question_index]
      if (q) fetchAnswers(q.id)
    } else {
      setAnswers([])
    }
  }, [quiz?.current_question_index, quiz?.status])

  const control = async (action: string) => {
    setActing(true)
    const res = await fetch(`/api/quiz/${id}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    if (data.quiz) setQuiz(data.quiz)
    setActing(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Game not found.</p>
      </div>
    )
  }

  // LOBBY: show the lobby join screen
  if (quiz.status === "lobby") {
    return <HostLobby quiz={quiz} players={players} onStart={() => control("start")} />
  }

  const currentQuestion = questions[quiz.current_question_index]
  const currentAnswers = currentQuestion ? answers.filter(a => a.question_id === currentQuestion.id) : []
  const screenUrl = typeof window !== "undefined" ? `${window.location.origin}/screen/${id}` : `/screen/${id}`
  const themeGrad = `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: themeGrad }}>
            <Zap className="w-4 h-4 text-white" fill="currentColor" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">{quiz.title}</div>
            <div className="text-gray-400 text-xs">Organizer Control Panel</div>
          </div>
        </div>
        <a
          href={screenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium text-gray-300"
        >
          <Monitor className="w-4 h-4" />
          Display Screen
        </a>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main controls */}
        <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">

          {/* Status */}
          <div className="bg-gray-900 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: quiz.theme_btn }} />
              <span className="text-gray-300 text-sm">
                Status: <span className="text-white font-bold capitalize">{quiz.status.replace("_", " ")}</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Users className="w-4 h-4" />
              {players.length} players
            </div>
          </div>

          {/* Current question display */}
          {currentQuestion && quiz.status !== "finished" && (
            <div className="bg-gray-900 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Question {quiz.current_question_index + 1} of {questions.length}
                </span>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-lg">
                  {currentQuestion.time_limit}s
                </span>
              </div>
              <p className="text-white font-bold text-lg leading-snug mb-4">{currentQuestion.question_text}</p>
              <div className="grid grid-cols-2 gap-2">
                {currentQuestion.options.map((opt, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-3 py-2 flex items-center gap-2 text-sm font-medium text-white"
                    style={{
                      backgroundColor: ANSWER_COLORS[i]?.bg + "22",
                      border: `1.5px solid ${currentQuestion.correct_index === i ? ANSWER_COLORS[i]?.bg : ANSWER_COLORS[i]?.bg + "44"}`,
                    }}
                  >
                    <span
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 text-white"
                      style={{ backgroundColor: ANSWER_COLORS[i]?.bg }}
                    >
                      {ANSWER_COLORS[i]?.label}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {currentQuestion.correct_index === i && (
                      <span className="text-green-400 text-xs font-bold">✓</span>
                    )}
                  </div>
                ))}
              </div>

              {(quiz.status === "question" || quiz.status === "answer_reveal") && (
                <div className="mt-4 bg-gray-800 rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Answers in</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-gray-700 w-32 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: players.length ? `${(currentAnswers.length / players.length) * 100}%` : "0%",
                          backgroundColor: quiz.theme_btn,
                        }}
                      />
                    </div>
                    <span className="text-white font-bold text-sm">
                      {currentAnswers.length}/{players.length}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          {quiz.status === "question" && (
            <button
              onClick={() => control("reveal")}
              disabled={acting}
              className="w-full py-5 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
              style={{ background: themeGrad }}
            >
              <Eye className="w-6 h-6" />
              {acting ? "Revealing..." : "Reveal Answers"}
            </button>
          )}

          {quiz.status === "answer_reveal" && (
            <button
              onClick={() => control("leaderboard")}
              disabled={acting}
              className="w-full py-5 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
              style={{ background: themeGrad }}
            >
              <Trophy className="w-6 h-6" />
              {acting ? "Loading..." : "Show Leaderboard"}
            </button>
          )}

          {quiz.status === "leaderboard" && (
            <button
              onClick={() => control("next")}
              disabled={acting}
              className="w-full py-5 rounded-2xl font-bold text-white text-lg flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-95"
              style={{ background: themeGrad }}
            >
              {quiz.current_question_index + 1 >= questions.length ? (
                <><Trophy className="w-6 h-6" />{acting ? "Finishing..." : "End Game & Show Podium"}</>
              ) : (
                <><SkipForward className="w-6 h-6" />{acting ? "Loading..." : `Next Question (${quiz.current_question_index + 2}/${questions.length})`}</>
              )}
            </button>
          )}

          {quiz.status === "finished" && (
            <div className="bg-gray-900 rounded-2xl p-8 flex flex-col items-center gap-5">
              <div className="text-6xl">🏆</div>
              <p className="text-white font-black text-2xl">Game Over!</p>
              <p className="text-gray-400">
                Winner: <span className="text-yellow-400 font-bold">{players[0]?.name}</span>
              </p>
              <button
                onClick={() => router.push("/organizer")}
                className="w-full py-4 rounded-xl font-bold text-white text-lg"
                style={{ background: themeGrad }}
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Display screen hint */}
          <div className="bg-gray-900 rounded-xl p-4 flex items-start gap-3 border border-gray-800">
            <Monitor className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-300 text-sm font-medium">Display Screen</p>
              <p className="text-gray-500 text-xs mt-0.5">
                Open the <span className="text-violet-400 font-semibold">Display Screen</span> on a projector or TV. Players see questions and answers on their phones.
              </p>
              <a
                href={screenUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 text-xs font-medium mt-1 block hover:text-violet-300 transition-colors"
              >
                {screenUrl}
              </a>
            </div>
          </div>
        </div>

        {/* Right panel — live leaderboard */}
        <div className="lg:w-72 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-800 p-4 flex flex-col gap-3 max-h-screen overflow-y-auto">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300 text-sm font-semibold uppercase tracking-wider">Live Standings</span>
          </div>
          {players.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-8">No players yet</p>
          ) : (
            [...players]
              .sort((a, b) => b.score - a.score)
              .map((player, i) => (
                <div key={player.id} className="flex items-center gap-3 bg-gray-800 rounded-xl px-3 py-3">
                  <span className={`text-sm font-black w-5 text-center ${i === 0 ? "text-yellow-400" : i === 1 ? "text-gray-300" : i === 2 ? "text-amber-600" : "text-gray-600"}`}>
                    {i + 1}
                  </span>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ background: themeGrad }}
                  >
                    {player.name[0].toUpperCase()}
                  </div>
                  <span className="text-white font-semibold text-sm flex-1 truncate">{player.name}</span>
                  <span className="text-yellow-400 font-bold text-sm">{player.score}</span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  )
}

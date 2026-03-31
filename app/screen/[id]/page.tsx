"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Quiz, Question, Player, Answer } from "@/lib/types"
import { QRCodeSVG } from "qrcode.react"
import { Zap, Users, Timer } from "lucide-react"

const ANSWER_SHAPES = [
  { bg: "#ef4444", shape: "▲", label: "A" },
  { bg: "#3b82f6", shape: "◆", label: "B" },
  { bg: "#f59e0b", shape: "●", label: "C" },
  { bg: "#10b981", shape: "■", label: "D" },
]

export default function DisplayScreen() {
  const { id } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

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

  useEffect(() => {
    fetchData()
    const channel = supabase
      .channel(`screen-${id}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "quizzes", filter: `id=eq.${id}` }, (payload) => {
        setQuiz(payload.new as Quiz)
        setAnswers([])
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
    return () => { channel.unsubscribe() }
  }, [id, fetchData])

  // Timer countdown
  useEffect(() => {
    if (!quiz || !questions.length) return
    if (quiz.status === "question") {
      const q = questions[quiz.current_question_index]
      if (!q) return
      setTimeLeft(q.time_limit)
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current!); return 0 }
          return t - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [quiz?.status, quiz?.current_question_index])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }
  if (!quiz) return null

  const currentQuestion = questions[quiz.current_question_index]
  const currentAnswers = currentQuestion ? answers.filter(a => a.question_id === currentQuestion.id) : []
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${quiz.game_code}` : `/join?code=${quiz.game_code}`
  const themeGrad = `linear-gradient(135deg, ${quiz.theme_bg}, ${quiz.theme_btn})`
  const timerPct = currentQuestion ? (timeLeft / currentQuestion.time_limit) * 100 : 0

  // LOBBY
  if (quiz.status === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 py-12 bg-gray-950">
        <div className="w-full max-w-3xl flex flex-col items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: themeGrad }}>
              <Zap className="w-7 h-7 text-white" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-black text-white">{quiz.title}</h1>
          </div>

          <div
            className="w-full rounded-3xl p-10 flex flex-col sm:flex-row items-center gap-10"
            style={{ background: themeGrad }}
          >
            <div className="bg-white p-4 rounded-2xl shadow-2xl shrink-0">
              <QRCodeSVG value={joinUrl} size={200} level="H" />
            </div>
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <p className="text-white/80 text-sm uppercase tracking-widest font-semibold">Scan QR or go to</p>
              <p className="text-white font-bold text-2xl">{typeof window !== "undefined" ? window.location.host : ""}/join</p>
              <p className="text-white/70 text-sm uppercase tracking-widest font-semibold mt-2">Enter Code</p>
              <p className="text-white font-black tracking-[0.3em]" style={{ fontSize: "clamp(3rem, 10vw, 5rem)" }}>
                {quiz.game_code}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <Users className="w-6 h-6" />
            <span className="text-2xl font-bold text-white">{players.length}</span>
            <span className="text-lg">player{players.length !== 1 ? "s" : ""} joined</span>
          </div>

          {players.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {players.map(p => (
                <div
                  key={p.id}
                  className="px-5 py-2 rounded-full text-white font-bold text-lg animate-in fade-in zoom-in duration-300"
                  style={{ background: themeGrad }}
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // QUESTION
  if (quiz.status === "question" && currentQuestion) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-950">
        {/* Top bar */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: themeGrad }}>
              <Zap className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <span className="text-gray-400 font-semibold">{quiz.title}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Q {quiz.current_question_index + 1}/{questions.length}</span>
            <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-2">
              <Timer className="w-5 h-5 text-yellow-400" />
              <span className={`text-2xl font-black tabular-nums ${timeLeft <= 5 ? "text-red-400 animate-pulse" : "text-white"}`}>
                {timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mx-8 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${timerPct}%`,
              background: timerPct > 50 ? quiz.theme_btn : timerPct > 20 ? "#f59e0b" : "#ef4444"
            }}
          />
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 py-6 gap-8">
          <div
            className="w-full max-w-4xl rounded-3xl p-8 text-center shadow-2xl"
            style={{ background: themeGrad }}
          >
            <p className="text-white font-black leading-tight text-balance" style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)" }}>
              {currentQuestion.question_text}
            </p>
          </div>

          <div className="w-full max-w-4xl grid grid-cols-2 gap-4">
            {currentQuestion.options.map((opt, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 flex items-center gap-4 shadow-lg"
                style={{ backgroundColor: ANSWER_SHAPES[i]?.bg }}
              >
                <span className="text-4xl font-black text-white opacity-60">{ANSWER_SHAPES[i]?.shape}</span>
                <span className="text-white font-bold text-xl leading-snug">{opt}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="text-white font-bold text-xl">{currentAnswers.length}</span>
            <span>/ {players.length} answered</span>
          </div>
        </div>
      </div>
    )
  }

  // ANSWER REVEAL
  if (quiz.status === "answer_reveal" && currentQuestion) {
    const correctIdx = currentQuestion.correct_index
    const counts = currentQuestion.options.map((_, i) =>
      currentAnswers.filter(a => a.selected_index === i).length
    )
    const maxCount = Math.max(...counts, 1)

    return (
      <div className="min-h-screen flex flex-col bg-gray-950 px-8 py-8">
        <div className="text-center mb-6">
          <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">Answer Reveal</p>
          <p className="text-white font-bold text-2xl">{currentQuestion.question_text}</p>
        </div>

        <div className="flex-1 flex items-end justify-center gap-4 pb-8 max-w-4xl mx-auto w-full">
          {currentQuestion.options.map((opt, i) => {
            const pct = (counts[i] / maxCount) * 100
            const isCorrect = i === correctIdx
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-white font-bold text-xl">{counts[i]}</span>
                <div className="w-full rounded-t-xl transition-all duration-700 relative overflow-hidden" style={{ height: "200px" }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t-xl transition-all duration-700"
                    style={{
                      height: `${Math.max(pct, 8)}%`,
                      backgroundColor: ANSWER_SHAPES[i]?.bg,
                      opacity: isCorrect ? 1 : 0.4,
                      boxShadow: isCorrect ? `0 0 30px ${ANSWER_SHAPES[i]?.bg}88` : "none",
                    }}
                  />
                  {isCorrect && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">✓</div>
                  )}
                </div>
                <div
                  className="w-full rounded-xl p-3 text-center text-white font-semibold text-sm"
                  style={{ backgroundColor: ANSWER_SHAPES[i]?.bg, opacity: isCorrect ? 1 : 0.5 }}
                >
                  {opt}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // LEADERBOARD
  if (quiz.status === "leaderboard") {
    const sorted = [...players].sort((a, b) => b.score - a.score).slice(0, 5)
    const medals = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"]
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-gray-950 gap-8">
        <h2 className="text-white font-black text-4xl">Leaderboard</h2>
        <div className="w-full max-w-xl flex flex-col gap-3">
          {sorted.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-5 rounded-2xl px-6 py-4 animate-in fade-in slide-in-from-bottom-4"
              style={{
                background: i === 0 ? themeGrad : "rgba(255,255,255,0.05)",
                animationDelay: `${i * 100}ms`
              }}
            >
              <span className="text-3xl">{medals[i]}</span>
              <span className="text-white font-black text-2xl flex-1">{p.name}</span>
              <span className="text-yellow-400 font-black text-2xl">{p.score}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // FINISHED
  if (quiz.status === "finished") {
    const sorted = [...players].sort((a, b) => b.score - a.score)
    const podium = [sorted[1], sorted[0], sorted[2]].filter(Boolean)
    const podiumHeights = ["h-24", "h-36", "h-16"]
    const medals = ["🥈", "🥇", "🥉"]

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-gray-950 gap-10">
        <div className="text-center">
          <p className="text-yellow-400 font-black text-5xl mb-2">Game Over!</p>
          <p className="text-gray-400 text-xl">{quiz.title} is complete</p>
        </div>

        <div className="flex items-end justify-center gap-4">
          {podium.map((p, i) => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <span className="text-4xl">{medals[i]}</span>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
                style={{ background: themeGrad }}
              >
                {p.name[0].toUpperCase()}
              </div>
              <span className="text-white font-bold text-center text-sm max-w-[80px] truncate">{p.name}</span>
              <div
                className={`${podiumHeights[i]} w-24 rounded-t-xl flex items-start justify-center pt-3`}
                style={{ background: themeGrad, opacity: i === 1 ? 1 : 0.7 }}
              >
                <span className="text-white font-black text-xl">{i === 0 ? "2" : i === 1 ? "1" : "3"}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-lg">Thank you for playing!</p>
      </div>
    )
  }

  return null
}

"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Quiz, Question, Player } from "@/lib/types"
import { QRCodeSVG } from "qrcode.react"
import { motion, AnimatePresence } from "framer-motion"

export default function ProjectorScreen() {
  const { id } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [answers, setAnswers] = useState<{ selected_index: number; is_correct: boolean; question_id: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Manage countdown timer when question is active
  useEffect(() => {
    if (!quiz || quiz.status !== "question") {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    const currentQ = questions[quiz.current_question_index]
    if (!currentQ) return

    setTimeLeft(currentQ.time_limit)
    if (timerRef.current) clearInterval(timerRef.current)

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [quiz?.status, quiz?.current_question_index, questions])

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [quizRes, questionsRes, playersRes] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", id).single(),
        supabase.from("questions").select("*").eq("quiz_id", id).order("position"),
        supabase.from("players").select("*").eq("quiz_id", id).order("score", { ascending: false }),
      ])
      if (quizRes.data) setQuiz(quizRes.data)
      if (questionsRes.data) setQuestions(questionsRes.data)
      if (playersRes.data) setPlayers(playersRes.data)
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel(`screen-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quizzes", filter: `id=eq.${id}` }, (payload) => {
        if (payload.new) {
          const newQuiz = payload.new as Quiz
          setQuiz(newQuiz)
          // Fetch answers when moving to reveal
          if (newQuiz.status === "answer_reveal") {
            supabase.from("questions").select("id").eq("quiz_id", id).order("position").then(({ data: qs }) => {
              if (!qs) return
              const currentQ = qs[newQuiz.current_question_index]
              if (currentQ) {
                supabase.from("answers").select("selected_index, is_correct, question_id")
                  .eq("question_id", currentQ.id)
                  .then(({ data: ans }) => { if (ans) setAnswers(ans) })
              }
            })
          }
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "players", filter: `quiz_id=eq.${id}` }, () => {
        supabase.from("players").select("*").eq("quiz_id", id).order("score", { ascending: false }).then(({ data }) => {
          if (data) setPlayers(data)
        })
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "answers", filter: `quiz_id=eq.${id}` }, (payload) => {
        setAnswers(prev => {
          const exists = prev.find((a: { question_id: string; selected_index: number }) =>
            a.question_id === (payload.new as { question_id: string }).question_id &&
            (payload.new as { selected_index: number }).selected_index === a.selected_index
          )
          return exists ? prev : [...prev, payload.new as { selected_index: number; is_correct: boolean; question_id: string }]
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Quiz not found</p>
      </div>
    )
  }

  const currentQ = questions[quiz.current_question_index]
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${quiz.game_code}` : ""

  const spinner = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  // Lobby - show QR and join code
  if (quiz.status === "lobby") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <h1 className="text-3xl font-bold tracking-tight text-balance text-center">{quiz.title}</h1>
          
          <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-6">
            <div className="bg-white p-4 rounded-xl">
              <QRCodeSVG value={joinUrl} size={200} />
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-sm mb-2">Join Code</p>
              <p className="text-5xl font-mono font-bold tracking-widest text-primary">{quiz.game_code}</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2 max-w-xl">
            <AnimatePresence mode="popLayout">
              {players.map((p) => (
                <motion.span
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="px-3 py-1.5 bg-secondary rounded-full text-sm font-medium"
                >
                  {p.name}
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
          {players.length > 0 && (
            <p className="text-muted-foreground text-sm">{players.length} player{players.length !== 1 ? "s" : ""} joined</p>
          )}
        </motion.div>
      </div>
    )
  }

  // Question
  if (quiz.status === "question") {
    if (!currentQ) return spinner
    const opts = Array.isArray(currentQ.options) ? currentQ.options : []
    const type = currentQ.type ?? "multiple_choice"
    const isPoll = type === "poll"
    const isTrueFalse = type === "true_false"
    const isUrgent = timeLeft <= 5
    const progress = (timeLeft / currentQ.time_limit) * 100
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          key={quiz.current_question_index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl space-y-6"
        >
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <p className="text-muted-foreground text-sm">
                Question {quiz.current_question_index + 1} of {questions.length}
              </p>
              {isPoll && (
                <span className="px-2 py-0.5 bg-secondary text-xs rounded-full text-muted-foreground">Poll</span>
              )}
            </div>
            {!isPoll && (
              <div className={`w-14 h-14 rounded-full flex items-center justify-center font-mono font-bold text-xl border-2 transition-colors ${
                isUrgent ? "border-destructive text-destructive animate-pulse" : "border-primary text-primary"
              }`}>
                {timeLeft}
              </div>
            )}
          </div>

          {/* Progress bar (not for polls) */}
          {!isPoll && (
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <h2 className="text-3xl font-bold text-center text-balance">{currentQ.question_text}</h2>

          {/* True / False */}
          {isTrueFalse && (
            <div className="grid grid-cols-2 gap-4">
              {["True", "False"].map((label, i) => (
                <div key={i} className={`p-8 rounded-xl text-center text-2xl font-bold border-2 ${
                  i === 0 ? "bg-primary/10 border-primary text-primary" : "bg-destructive/10 border-destructive text-destructive"
                }`}>
                  {label}
                </div>
              ))}
            </div>
          )}

          {/* Multiple choice */}
          {!isTrueFalse && (
            <div className={`grid gap-4 ${opts.length <= 2 ? "grid-cols-2" : "grid-cols-2"}`}>
              {opts.map((opt, i) => (
                <div key={i} className="p-6 bg-card border border-border rounded-xl text-center text-lg font-medium">
                  {!isPoll && <span className="text-primary font-bold mr-2">{String.fromCharCode(65 + i)}.</span>}
                  {String(opt)}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    )
  }

  // Answer reveal
  if (quiz.status === "answer_reveal") {
    if (!currentQ) return spinner
    const opts = Array.isArray(currentQ.options) ? currentQ.options : []
    const type = currentQ.type ?? "multiple_choice"
    const isPoll = type === "poll"
    const isTrueFalse = type === "true_false"
    const displayOpts = isTrueFalse ? ["True", "False"] : opts.map(String)
    const currentAnswers = answers.filter(a => a.question_id === currentQ.id)
    const totalAnswers = currentAnswers.length
    const getCount = (i: number) => currentAnswers.filter(a => a.selected_index === i).length
    const getPct = (i: number) => totalAnswers === 0 ? 0 : Math.round((getCount(i) / totalAnswers) * 100)

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-3xl space-y-6"
        >
          <p className="text-muted-foreground text-sm text-center">{isPoll ? "Poll Results" : "Correct Answer"}</p>
          <h2 className="text-2xl font-bold text-center text-balance">{currentQ.question_text}</h2>

          {/* Per-option percentage bars */}
          <div className="space-y-3">
            {displayOpts.map((label, i) => {
              const pct = getPct(i)
              const count = getCount(i)
              const isCorrect = !isPoll && i === currentQ.correct_index
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-lg font-semibold flex items-center gap-2 ${isCorrect ? "text-primary" : ""}`}>
                      {isCorrect && <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-xs">✓</span>}
                      {!isPoll && !isTrueFalse && <span className="text-muted-foreground text-base">{String.fromCharCode(65 + i)}.</span>}
                      {label}
                    </span>
                    <span className="font-mono font-bold text-lg">{pct}%
                      <span className="text-muted-foreground text-sm ml-1">({count})</span>
                    </span>
                  </div>
                  <div className="h-4 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, delay: i * 0.08 + 0.1 }}
                      className={`h-full rounded-full ${isPoll ? "bg-primary" : isCorrect ? "bg-primary" : "bg-destructive/50"}`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          <p className="text-center text-muted-foreground text-sm">{totalAnswers} of {players.length} answered</p>
        </motion.div>
      </div>
    )
  }

  // Leaderboard
  if (quiz.status === "leaderboard" || quiz.status === "finished") {
    const top = players.slice(0, 10)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center mb-6">
            {quiz.status === "finished" ? "Final Results" : "Leaderboard"}
          </h2>
          <div className="space-y-2">
            {top.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${
                    i === 0 ? "bg-primary-foreground/20" : "bg-secondary"
                  }`}>
                    {i + 1}
                  </span>
                  <span className="font-medium">{p.name}</span>
                </div>
                <span className="font-mono font-bold">{p.score}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    )
  }

  return spinner
}

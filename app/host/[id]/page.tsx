"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Quiz, Question, Player, Answer } from "@/lib/types"
import HostLobby from "@/components/host/HostLobby"
import HostQuestion from "@/components/host/HostQuestion"
import HostReveal from "@/components/host/HostReveal"
import HostLeaderboard from "@/components/host/HostLeaderboard"
import HostFinished from "@/components/host/HostFinished"

export default function HostGamePage() {
  const { id } = useParams<{ id: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)
  const [controlling, setControlling] = useState(false)
  const supabaseRef = useRef(createClient())

  const fetchData = useCallback(async () => {
    const supabase = supabaseRef.current
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
    const supabase = supabaseRef.current
    const { data } = await supabase.from("answers").select("*").eq("question_id", questionId)
    if (data) setAnswers(data)
  }, [])

  useEffect(() => {
    fetchData()
    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`host-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quizzes", filter: `id=eq.${id}` }, (payload) => {
        setQuiz(payload.new as Quiz)
        setControlling(false)
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "players", filter: `quiz_id=eq.${id}` }, (payload) => {
        setPlayers(prev => [...prev, payload.new as Player])
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

    return () => { supabase.removeChannel(channel) }
  }, [id, fetchData])

  useEffect(() => {
    if (!quiz || !questions.length) return
    if (quiz.status === "question" || quiz.status === "answer_reveal") {
      const currentQ = questions[quiz.current_question_index]
      if (currentQ) fetchAnswers(currentQ.id)
    }
  }, [quiz?.current_question_index, quiz?.status, questions, fetchAnswers])

  const control = async (action: string) => {
    if (controlling) return
    setControlling(true)
    await fetch(`/api/quiz/${id}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Game not found</p>
      </div>
    )
  }

  const currentQuestion = questions[quiz.current_question_index]

  if (quiz.status === "lobby") {
    return <HostLobby quiz={quiz} players={players} onStart={() => control("start")} controlling={controlling} />
  }

  if (quiz.status === "question" && currentQuestion) {
    return (
      <HostQuestion
        question={currentQuestion}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        answerCount={answers.filter(a => a.question_id === currentQuestion.id).length}
        playerCount={players.length}
        onReveal={() => control("reveal")}
        controlling={controlling}
      />
    )
  }

  if (quiz.status === "answer_reveal" && currentQuestion) {
    return (
      <HostReveal
        question={currentQuestion}
        answers={answers.filter(a => a.question_id === currentQuestion.id)}
        players={players}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        onLeaderboard={() => control("leaderboard")}
        controlling={controlling}
      />
    )
  }

  if (quiz.status === "leaderboard") {
    return (
      <HostLeaderboard
        players={players}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        onNext={() => control("next")}
        controlling={controlling}
      />
    )
  }

  if (quiz.status === "finished") {
    return <HostFinished players={players} />
  }

  return null
}

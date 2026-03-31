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

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`host-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quizzes", filter: `id=eq.${id}` }, (payload) => {
        setQuiz(payload.new as Quiz)
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

    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [id, fetchData])

  // Fetch answers when question changes
  useEffect(() => {
    if (!quiz || !questions.length) return
    if (quiz.status === "question" || quiz.status === "answer_reveal") {
      const currentQ = questions[quiz.current_question_index]
      if (currentQ) fetchAnswers(currentQ.id)
    }
  }, [quiz?.current_question_index, quiz?.status])

  const control = async (action: string) => {
    await fetch(`/api/quiz/${id}/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground text-sm">Loading game...</p>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Game not found.</p>
      </div>
    )
  }

  const currentQuestion = questions[quiz.current_question_index]

  if (quiz.status === "lobby") {
    return <HostLobby quiz={quiz} players={players} onStart={() => control("start")} />
  }

  if (quiz.status === "question" && currentQuestion) {
    return (
      <HostQuestion
        quiz={quiz}
        question={currentQuestion}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        answerCount={answers.filter(a => a.question_id === currentQuestion.id).length}
        playerCount={players.length}
        onReveal={() => control("reveal")}
      />
    )
  }

  if (quiz.status === "answer_reveal" && currentQuestion) {
    return (
      <HostReveal
        quiz={quiz}
        question={currentQuestion}
        answers={answers.filter(a => a.question_id === currentQuestion.id)}
        players={players}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        onLeaderboard={() => control("leaderboard")}
      />
    )
  }

  if (quiz.status === "leaderboard") {
    return (
      <HostLeaderboard
        quiz={quiz}
        players={players}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        onNext={() => control("next")}
      />
    )
  }

  if (quiz.status === "finished") {
    return <HostFinished quiz={quiz} players={players} />
  }

  return null
}

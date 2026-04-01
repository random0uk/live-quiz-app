"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Quiz, Question, Player } from "@/lib/types"
import PlayerLobby from "@/components/player/PlayerLobby"
import PlayerQuestion from "@/components/player/PlayerQuestion"
import PlayerWaiting from "@/components/player/PlayerWaiting"
import PlayerLeaderboard from "@/components/player/PlayerLeaderboard"
import PlayerFinished from "@/components/player/PlayerFinished"
import PlayerEliminated from "@/components/player/PlayerEliminated"

export default function PlayPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [player, setPlayer] = useState<Player | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [answered, setAnswered] = useState<Record<string, boolean>>({})
  const [lastResult, setLastResult] = useState<{ is_correct: boolean; points_earned: number; is_poll?: boolean } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef(createClient())

  const getPlayerId = useCallback(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem("player_id")
  }, [])

  const fetchData = useCallback(async () => {
    const playerId = getPlayerId()
    if (!playerId) { router.push("/"); return }
    
    const supabase = supabaseRef.current

    const [quizRes, questionsRes, playerRes, playersRes] = await Promise.all([
      supabase.from("quizzes").select("*").eq("id", id).single(),
      supabase.from("questions").select("*").eq("quiz_id", id).order("position"),
      supabase.from("players").select("*").eq("id", playerId).single(),
      supabase.from("players").select("*").eq("quiz_id", id).order("score", { ascending: false }),
    ])

    if (quizRes.data) setQuiz(quizRes.data)
    if (questionsRes.data) setQuestions(questionsRes.data)
    if (playerRes.data) setPlayer(playerRes.data)
    if (playersRes.data) setPlayers(playersRes.data)
    setLoading(false)
  }, [id, getPlayerId, router])

  useEffect(() => {
    fetchData()
    const supabase = supabaseRef.current

    const channel = supabase
      .channel(`play-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quizzes", filter: `id=eq.${id}` }, (payload) => {
        const newQuiz = payload.new as Quiz
        setQuiz(newQuiz)
        if (newQuiz.status === "question") {
          setLastResult(null)
          // Ensure questions are loaded
          supabase.from("questions").select("*").eq("quiz_id", id).order("position").then(({ data }) => {
            if (data && data.length > 0) setQuestions(data)
          })
        }
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "players", filter: `quiz_id=eq.${id}` }, () => {
        const playerId = getPlayerId()
        supabase.from("players").select("*").eq("quiz_id", id).order("score", { ascending: false }).then(({ data }) => {
          if (data) {
            setPlayers(data)
            const me = data.find(p => p.id === playerId)
            if (me) setPlayer(me)
          }
        })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [id, fetchData, getPlayerId])

  const handleAnswer = async (selectedIndex: number, timeRemaining: number) => {
    const playerId = getPlayerId()
    if (!playerId || !quiz || !questions.length) return

    const currentQuestion = questions[quiz.current_question_index]
    if (!currentQuestion) return

    // Optimistic update - show answered state immediately
    setAnswered(prev => ({ ...prev, [currentQuestion.id]: true }))

    const res = await fetch("/api/quiz/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quiz_id: quiz.id,
        question_id: currentQuestion.id,
        player_id: playerId,
        selected_index: selectedIndex,
        time_remaining: timeRemaining,
        time_limit: currentQuestion.time_limit,
      }),
    })
    const data = await res.json()
    if (res.ok) {
      setLastResult({ is_correct: data.is_correct, points_earned: data.points_earned, is_poll: data.is_poll })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!quiz || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Could not connect to game</p>
      </div>
    )
  }

  const currentQuestion = questions[quiz.current_question_index]
  const hasAnswered = currentQuestion ? !!answered[currentQuestion.id] : false

  const spinner = (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (quiz.status === "lobby") {
    return <PlayerLobby quiz={quiz} player={player} />
  }

  // Show eliminated screen if player is out (elimination mode)
  if (player.eliminated) {
    return <PlayerEliminated />
  }

  if (quiz.status === "question") {
    if (!currentQuestion) return spinner
    return (
      <PlayerQuestion
        question={currentQuestion}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        hasAnswered={hasAnswered}
        onAnswer={handleAnswer}
      />
    )
  }

  if (quiz.status === "answer_reveal") {
    return <PlayerWaiting lastResult={lastResult} playerScore={player.score} />
  }

  if (quiz.status === "leaderboard") {
    return <PlayerLeaderboard players={players} currentPlayerId={player.id} />
  }

  if (quiz.status === "finished") {
    return <PlayerFinished players={players} currentPlayerId={player.id} />
  }

  return spinner
}

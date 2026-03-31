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

export default function PlayPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [player, setPlayer] = useState<Player | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [answered, setAnswered] = useState<Record<string, boolean>>({})
  const [lastResult, setLastResult] = useState<{ is_correct: boolean; points_earned: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const getPlayerId = useCallback(() => {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem(`player_${id}`)
  }, [id])

  const fetchData = useCallback(async () => {
    const playerId = getPlayerId()
    if (!playerId) { router.push("/join"); return }

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
  }, [id, getPlayerId, router, supabase])

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel(`play-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quizzes", filter: `id=eq.${id}` }, (payload) => {
        setQuiz(payload.new as Quiz)
        setLastResult(null)
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

    channelRef.current = channel
    return () => { channel.unsubscribe() }
  }, [id, fetchData, getPlayerId, supabase])

  const handleAnswer = async (selectedIndex: number, timeRemaining: number) => {
    const playerId = getPlayerId()
    if (!playerId || !quiz || !questions.length) return

    const currentQuestion = questions[quiz.current_question_index]
    if (!currentQuestion) return

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
      setLastResult({ is_correct: data.is_correct, points_earned: data.points_earned })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-gray-500">Joining game...</p>
        </div>
      </div>
    )
  }

  if (!quiz || !player) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <p className="text-gray-500">Could not connect to game.</p>
      </div>
    )
  }

  const currentQuestion = questions[quiz.current_question_index]
  const hasAnswered = currentQuestion ? !!answered[currentQuestion.id] : false

  if (quiz.status === "lobby") {
    return <PlayerLobby quiz={quiz} player={player} />
  }

  if (quiz.status === "question" && currentQuestion) {
    return (
      <PlayerQuestion
        quiz={quiz}
        question={currentQuestion}
        questionNumber={quiz.current_question_index + 1}
        totalQuestions={questions.length}
        hasAnswered={hasAnswered}
        onAnswer={handleAnswer}
      />
    )
  }

  if (quiz.status === "answer_reveal") {
    return (
      <PlayerWaiting
        quiz={quiz}
        lastResult={lastResult}
        playerScore={player.score}
      />
    )
  }

  if (quiz.status === "leaderboard") {
    return (
      <PlayerLeaderboard
        quiz={quiz}
        players={players}
        currentPlayerId={player.id}
      />
    )
  }

  if (quiz.status === "finished") {
    return <PlayerFinished quiz={quiz} players={players} currentPlayerId={player.id} />
  }

  return null
}

"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [joinCode, setJoinCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState("")
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    const code = searchParams.get("code")
    if (code) setJoinCode(code.toUpperCase())
  }, [searchParams])

  const handleJoin = async () => {
    if (!joinCode.trim() || !nickname.trim()) return
    setJoining(true)
    setError("")

    const supabase = createClient()
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("id, status")
      .eq("game_code", joinCode.toUpperCase())
      .single()

    if (!quiz) {
      setError("Game not found")
      setJoining(false)
      return
    }

    if (quiz.status !== "lobby") {
      setError("Game already started")
      setJoining(false)
      return
    }

    const { data: player, error: joinError } = await supabase
      .from("players")
      .insert({ quiz_id: quiz.id, name: nickname.trim(), score: 0 })
      .select()
      .single()

    if (joinError || !player) {
      setError("Failed to join")
      setJoining(false)
      return
    }

    localStorage.setItem("player_id", player.id)
    localStorage.setItem("player_name", nickname.trim())
    router.push(`/play/${quiz.id}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-xs animate-fade-in">
        <CardContent className="pt-6 space-y-4">
          <div className="text-center">
            <h2 className="text-lg font-bold">Join Game</h2>
            <p className="text-muted-foreground text-sm">Enter the code shown on screen</p>
          </div>
          
          <Input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="Game Code"
            className="text-center font-mono text-xl tracking-widest uppercase"
            maxLength={8}
            autoFocus
          />
          
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Your Name"
            maxLength={20}
          />
          
          {error && <p className="text-destructive text-sm text-center">{error}</p>}
          
          <Button
            onClick={handleJoin}
            disabled={!joinCode.trim() || !nickname.trim() || joining}
            className="w-full"
          >
            {joining ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              "Join"
            )}
          </Button>
          
          <Button variant="ghost" onClick={() => router.push("/")} className="w-full text-muted-foreground">
            Back
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <JoinForm />
    </Suspense>
  )
}

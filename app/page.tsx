"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Users, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function Home() {
  const router = useRouter()
  const [view, setView] = useState<"home" | "join" | "organizer">("home")
  const [joinCode, setJoinCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [joining, setJoining] = useState(false)

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

  const handleOrganizerLogin = async () => {
    if (!pin.trim()) return
    setError("")

    const supabase = createClient()
    const { data } = await supabase
      .from("organizer_settings")
      .select("pin_code")
      .eq("id", 1)
      .single()

    if (data?.pin_code === pin) {
      localStorage.setItem("organizer_auth", "true")
      router.push("/organizer")
    } else {
      setError("Wrong PIN")
    }
  }

  // Join view
  if (view === "join") {
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
            
            <Button variant="ghost" onClick={() => setView("home")} className="w-full text-muted-foreground">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Organizer login view
  if (view === "organizer") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-xs animate-fade-in">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <h2 className="text-lg font-bold">Organizer</h2>
              <p className="text-muted-foreground text-sm">Enter your PIN</p>
            </div>
            
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="text-center text-2xl tracking-widest"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleOrganizerLogin()}
            />
            
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
            
            <Button onClick={handleOrganizerLogin} disabled={!pin.trim()} className="w-full">
              Login
            </Button>
            
            <Button variant="ghost" onClick={() => setView("home")} className="w-full text-muted-foreground">
              Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Home view
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xs space-y-6 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary flex items-center justify-center">
            <Zap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">QuizBlitz</h1>
          <p className="text-muted-foreground text-sm">Live multiplayer quizzes</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => setView("join")}
            className="w-full h-14 text-lg font-semibold"
          >
            <Users className="w-5 h-5 mr-2" />
            Join Game
          </Button>
          
          <Button
            onClick={() => setView("organizer")}
            variant="secondary"
            className="w-full h-12"
          >
            <Settings className="w-4 h-4 mr-2" />
            Organizer
          </Button>
        </div>
      </div>
    </div>
  )
}

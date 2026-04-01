"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap, Users, Settings, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"

export default function Home() {
  const router = useRouter()
  const [view, setView] = useState<"home" | "join" | "organizer">("home")
  const [joinCode, setJoinCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [joining, setJoining] = useState(false)
  const [appName, setAppName] = useState("Awaneies")

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("organizer_settings")
      .select("app_name")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.app_name) setAppName(data.app_name)
      })
  }, [])

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
      <div className="min-h-screen flex flex-col bg-background">
        {/* Top area with back button */}
        <div className="p-4">
          <button
            onClick={() => { setView("home"); setError(""); setJoinCode(""); setNickname("") }}
            className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-xs space-y-2 text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold mt-3">Join Game</h2>
            <p className="text-muted-foreground text-sm">Enter the code shown on screen</p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Game Code"
              className="text-center font-mono text-xl tracking-widest uppercase h-14"
              maxLength={8}
              autoFocus
            />
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Your Name"
              className="h-12"
              maxLength={20}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
          </div>
        </div>

        {/* Bottom action */}
        <div className="p-6 pb-10">
          <Button
            onClick={handleJoin}
            disabled={!joinCode.trim() || !nickname.trim() || joining}
            className="w-full h-14 text-base font-semibold rounded-2xl"
          >
            {joining ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Join Game
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  // Organizer login view
  if (view === "organizer") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="p-4">
          <button
            onClick={() => { setView("home"); setError(""); setPin("") }}
            className="flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-full max-w-xs space-y-2 text-center mb-8">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-secondary flex items-center justify-center">
              <Settings className="w-6 h-6 text-foreground" />
            </div>
            <h2 className="text-xl font-bold mt-3">Organizer</h2>
            <p className="text-muted-foreground text-sm">Enter your PIN to continue</p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="text-center text-2xl tracking-widest h-14"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleOrganizerLogin()}
            />
            {error && <p className="text-destructive text-sm text-center">{error}</p>}
          </div>
        </div>

        <div className="p-6 pb-10">
          <Button
            onClick={handleOrganizerLogin}
            disabled={!pin.trim()}
            className="w-full h-14 text-base font-semibold rounded-2xl"
          >
            <Settings className="w-5 h-5 mr-2" />
            Login
          </Button>
        </div>
      </div>
    )
  }

  // Home view — icon top, buttons bottom
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top spacer + branding */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
            <Zap className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="space-y-1 mt-2">
            <h1 className="text-3xl font-bold tracking-tight">{appName}</h1>
            <p className="text-muted-foreground text-sm">Live multiplayer quizzes</p>
          </div>
        </div>
      </div>

      {/* Bottom actions — pushed to bottom like a real app */}
      <div className="p-6 pb-12 space-y-3 w-full max-w-xs mx-auto">
        <Button
          onClick={() => setView("join")}
          className="w-full h-14 text-base font-semibold rounded-2xl"
        >
          <Users className="w-5 h-5 mr-2" />
          Join Game
        </Button>
        <Button
          onClick={() => setView("organizer")}
          variant="secondary"
          className="w-full h-12 rounded-2xl"
        >
          <Settings className="w-4 h-4 mr-2" />
          Organizer
        </Button>
      </div>
    </div>
  )
}

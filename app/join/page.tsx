"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Zap } from "lucide-react"

export default function JoinPage() {
  const router = useRouter()
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleJoin = async () => {
    setError("")
    if (!gameCode.trim()) return setError("Please enter a game code.")
    if (!playerName.trim()) return setError("Please enter your name.")

    setLoading(true)
    try {
      const res = await fetch("/api/quiz/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game_code: gameCode.trim(), player_name: playerName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) return setError(data.error || "Could not join game.")

      // Store player ID in sessionStorage so the player screen can use it
      sessionStorage.setItem(`player_${data.quiz.id}`, data.player.id)
      router.push(`/play/${data.quiz.id}`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <Link href="/" className="self-start p-2 rounded-xl hover:bg-secondary transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Zap className="w-7 h-7 text-primary-foreground" fill="currentColor" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-black text-foreground">Join Game</h1>
            <p className="text-muted-foreground text-sm mt-1">Enter the code shown on screen</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
          {error && (
            <div className="bg-destructive/20 border border-destructive/40 text-foreground rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-sm font-medium">Game Code</label>
            <input
              type="text"
              value={gameCode}
              onChange={e => setGameCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              autoCapitalize="characters"
              className="w-full bg-input border border-border rounded-xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-2xl font-black text-center tracking-widest uppercase"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-muted-foreground text-sm font-medium">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={20}
              className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold text-lg shadow-lg shadow-primary/25 transition-all hover:opacity-90 disabled:opacity-50 active:scale-[0.98] mt-1"
          >
            {loading ? "Joining..." : "Join Game"}
          </button>
        </div>
      </div>
    </main>
  )
}

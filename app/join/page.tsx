"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Zap, Loader2 } from "lucide-react"

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gameCode, setGameCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const code = searchParams.get("code")
    if (code) setGameCode(code.toUpperCase())
  }, [searchParams])

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

      sessionStorage.setItem(`player_${data.quiz.id}`, data.player.id)
      router.push(`/play/${data.quiz.id}`)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-4">
        <Link href="/" className="self-start p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-purple-500/30">
          <Zap className="w-8 h-8 text-white" fill="currentColor" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900">Join Game</h1>
          <p className="text-gray-500 text-sm mt-1">Enter the code shown on screen</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col gap-5 shadow-xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-gray-500 text-sm font-semibold">Game Code</label>
          <input
            type="text"
            value={gameCode}
            onChange={e => setGameCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            autoCapitalize="characters"
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-5 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-violet-500 focus:bg-white text-3xl font-black text-center tracking-[0.3em] uppercase transition-all"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-500 text-sm font-semibold">Your Name</label>
          <input
            type="text"
            value={playerName}
            onChange={e => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-4 text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-violet-500 focus:bg-white text-lg font-semibold transition-all"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white py-5 rounded-2xl font-bold text-xl shadow-xl shadow-purple-500/30 transition-all hover:scale-[1.02] hover:shadow-2xl disabled:opacity-50 active:scale-[0.98] mt-2"
        >
          {loading ? "Joining..." : "Join Game"}
        </button>
      </div>
    </div>
  )
}

function JoinLoading() {
  return (
    <div className="w-full max-w-sm flex flex-col items-center justify-center gap-4 py-20">
      <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
      <p className="text-gray-500">Loading...</p>
    </div>
  )
}

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4">
      <Suspense fallback={<JoinLoading />}>
        <JoinForm />
      </Suspense>
    </main>
  )
}

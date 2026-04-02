"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, X } from "lucide-react"

function JoinForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [joinCode, setJoinCode] = useState("")
  const [nickname, setNickname] = useState("")
  const [error, setError] = useState("")
  const [joining, setJoining] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const code = searchParams.get("code")
    if (code) setJoinCode(code.toUpperCase())
  }, [searchParams])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleJoin = async () => {
    if (!joinCode.trim() || !nickname.trim()) return
    setJoining(true)
    setError("")

    // Upload avatar to Blob if selected
    let avatarUrl: string | null = null
    if (avatarFile) {
      setUploadingAvatar(true)
      try {
        const fd = new FormData()
        fd.append("file", avatarFile)
        fd.append("type", "avatar")
        const res = await fetch("/api/upload", { method: "POST", body: fd })
        const data = await res.json()
        if (data.url) avatarUrl = data.url
      } catch {
        // Avatar upload failed — continue without it
      }
      setUploadingAvatar(false)
    }

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
      .insert({ quiz_id: quiz.id, name: nickname.trim(), score: 0, avatar_url: avatarUrl })
      .select()
      .single()

    if (joinError || !player) {
      setError("Failed to join")
      setJoining(false)
      return
    }

    localStorage.setItem("player_id", player.id)
    localStorage.setItem("player_name", nickname.trim())
    if (avatarUrl) localStorage.setItem("player_avatar", avatarUrl)
    router.push(`/play/${quiz.id}`)
  }

  const isLoading = joining || uploadingAvatar

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

          {/* Profile photo */}
          <div className="flex flex-col items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarPreview ? (
              <div className="relative">
                <img
                  src={avatarPreview}
                  alt="Your photo"
                  className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                />
                <button
                  type="button"
                  onClick={removeAvatar}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  aria-label="Remove photo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-full border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center gap-1 hover:border-primary/60 hover:bg-secondary/70 transition-colors"
              >
                <Camera className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Add photo</span>
              </button>
            )}
            <p className="text-xs text-muted-foreground">Optional — shown on the big screen</p>
          </div>

          {error && <p className="text-destructive text-sm text-center">{error}</p>}

          <Button
            onClick={handleJoin}
            disabled={!joinCode.trim() || !nickname.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
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

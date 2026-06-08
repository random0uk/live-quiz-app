"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import HeroSection from "@/components/hero-section"
import FeaturesSheet from "@/components/FeaturesSheet"
import { applyBrandColor } from "@/hooks/use-brand-color"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function Home() {
  const router = useRouter()
  const [view, setView] = useState<"home" | "organizer">("home")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [appName, setAppName] = useState("Awane Quiz")
  const [organizerName, setOrganizerName] = useState("Organizer")
  const [featuresOpen, setFeaturesOpen] = useState(false)
  const [colorReady, setColorReady] = useState(false)
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [joinPin, setJoinPin] = useState("")
  const [joinError, setJoinError] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("organizer_settings")
      .select("app_name, brand_color, organizer_name")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.app_name) setAppName(data.app_name)
        if (data?.brand_color) applyBrandColor(data.brand_color)
        if (data?.organizer_name) setOrganizerName(data.organizer_name)
        setColorReady(true)
      })
  }, [])

  // Wait for brand color to load before rendering to avoid color flash
  if (!colorReady) return null

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

  const handleJoinQuiz = async () => {
    if (!joinPin.trim()) return
    setJoinError("")
    
    const supabase = createClient()
    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id")
      .eq("pin_code", joinPin.toUpperCase())
      .single()

    if (quizzes?.id) {
      router.push(`/play/${quizzes.id}`)
    } else {
      setJoinError("Quiz not found. Check your PIN.")
    }
  }

  // Organizer login view
  if (view === "organizer") {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-4">
          <button
            onClick={() => {
              setView("home" as const)
              setError("")
              setPin("")
            }}
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
            <p className="text-primary text-sm font-medium mt-3">Hello Organiser</p>
            <h2 className="text-xl font-bold">Organizer Login</h2>
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

  // Home view with hero section
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <HeroSection onStartClick={() => setShowJoinModal(true)} />

      {/* Features Sheet */}
      <FeaturesSheet
        open={featuresOpen}
        onClose={() => setFeaturesOpen(false)}
        organizerName={organizerName}
      />

      {/* Join Quiz Modal */}
      <Dialog open={showJoinModal} onOpenChange={setShowJoinModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join a Quiz</DialogTitle>
            <DialogDescription>
              Enter the quiz PIN provided by the organizer
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="text"
              value={joinPin}
              onChange={(e) => setJoinPin(e.target.value.toUpperCase())}
              placeholder="Enter PIN"
              className="text-center text-2xl tracking-widest h-14 font-mono"
              maxLength={6}
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleJoinQuiz()}
            />
            {joinError && <p className="text-destructive text-sm text-center">{joinError}</p>}
            <Button
              onClick={handleJoinQuiz}
              disabled={!joinPin.trim()}
              className="w-full h-12 font-semibold"
            >
              Join Quiz
            </Button>
            <Button
              onClick={() => setView("organizer")}
              variant="outline"
              className="w-full h-12 font-semibold"
            >
              <Settings className="w-4 h-4 mr-2" />
              Organizer Login
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

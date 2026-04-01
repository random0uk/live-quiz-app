"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Zap, Settings, ArrowLeft, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import FeaturesSheet from "@/components/FeaturesSheet"
import { applyBrandColor } from "@/hooks/use-brand-color"

export default function Home() {
  const router = useRouter()
  const [view, setView] = useState<"home" | "organizer">("home")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [appName, setAppName] = useState("Awaneies")
  const [featuresOpen, setFeaturesOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from("organizer_settings")
      .select("app_name, brand_color")
      .eq("id", 1)
      .single()
      .then(({ data }) => {
        if (data?.app_name) setAppName(data.app_name)
        if (data?.brand_color) applyBrandColor(data.brand_color)
      })
  }, [])

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

  // Organizer login view
  if (view === "organizer") {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="p-4">
          <button
            onClick={() => { setView("home" as const); setError(""); setPin("") }}
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
    <div className="h-full flex flex-col bg-background">
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
      <div className="p-6 pb-6 space-y-3 w-full max-w-xs mx-auto">
        <Button
          onClick={() => setFeaturesOpen(true)}
          className="w-full h-14 text-base font-semibold rounded-2xl"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Discover Features
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

      <FeaturesSheet open={featuresOpen} onClose={() => setFeaturesOpen(false)} />
    </div>
  )
}

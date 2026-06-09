"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Settings, ArrowLeft, X, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import HeroSection from "@/components/hero-section"
import FeaturesSheet from "@/components/FeaturesSheet"
import { applyBrandColor } from "@/hooks/use-brand-color"
import { motion, AnimatePresence } from "framer-motion"

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
  const [darkMode, setDarkMode] = useState(false)

  const toggleDark = () => {
    setDarkMode((d) => {
      document.documentElement.classList.toggle("dark", !d)
      return !d
    })
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
      router.push("/organizer/history")
    } else {
      setError("Wrong PIN")
    }
  }

  // Organizer login view
  if (view === "organizer") {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Top bar: back left, dark/light toggle right */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button
            onClick={() => { setView("home" as const); setError(""); setPin("") }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <button
            onClick={toggleDark}
            className="p-2 rounded-full hover:bg-secondary transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
          </button>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-xs">
            {/* Title */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-yellow-500 mb-1">Organizer</p>
              <h2 className="text-2xl font-black text-foreground leading-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your PIN to access the dashboard</p>
            </div>

            {/* PIN Input */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setError("") }}
                  placeholder="••••••"
                  className="w-full h-14 rounded-2xl border-2 border-border bg-secondary/40 text-center text-2xl tracking-[0.4em] text-foreground placeholder:text-muted-foreground/40 placeholder:tracking-normal focus:border-yellow-400 outline-none transition-colors"
                  maxLength={6}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleOrganizerLogin()}
                />
              </div>
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-sm text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Bottom login button — plain yellow, no ugly blue */}
        <div className="px-8 pb-12">
          <button
            onClick={handleOrganizerLogin}
            disabled={!pin.trim()}
            className="w-full h-14 rounded-2xl bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-base transition-colors shadow-md"
          >
            Login
          </button>
        </div>
      </div>
    )
  }

  // Home view with hero section
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <HeroSection 
        onStartClick={() => setShowJoinModal(true)}
        onLearnMore={() => setFeaturesOpen(true)}
      />

      {/* Features Sheet */}
      <FeaturesSheet
        open={featuresOpen}
        onClose={() => setFeaturesOpen(false)}
        organizerName={organizerName}
      />

      {/* Join Quiz Bottom Sheet */}
      <AnimatePresence>
        {showJoinModal && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowJoinModal(false); setJoinPin(""); setJoinError("") }}
              className="fixed inset-0 bg-black/50 z-40"
            />

            {/* Bottom Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-6 pt-4 pb-10 shadow-2xl max-w-lg mx-auto"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />

              {/* Close button */}
              <button
                onClick={() => { setShowJoinModal(false); setJoinPin(""); setJoinError("") }}
                className="absolute top-5 right-5 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>

              {/* Title */}
              <div className="flex flex-col gap-1 mb-6">
                <h2 className="text-xl font-black text-gray-900">Enter Quiz PIN</h2>
                <p className="text-sm text-gray-400">Type the code shown on the projector screen</p>
              </div>

              {/* PIN Input */}
              <div className="space-y-3 mb-6">
                <input
                  type="text"
                  value={joinPin}
                  onChange={(e) => { setJoinPin(e.target.value.toUpperCase()); setJoinError("") }}
                  placeholder="Enter PIN code"
                  className="w-full h-16 rounded-2xl border-2 border-gray-200 focus:border-yellow-400 outline-none text-center text-2xl font-black tracking-[0.25em] text-gray-900 bg-gray-50 transition-colors placeholder:text-gray-300 placeholder:text-base placeholder:font-normal placeholder:tracking-normal"
                  maxLength={6}
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleJoinQuiz()}
                />
                <AnimatePresence>
                  {joinError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-500 text-sm text-center font-medium"
                    >
                      {joinError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleJoinQuiz}
                  disabled={!joinPin.trim()}
                  className="w-full h-14 rounded-2xl bg-yellow-400 hover:bg-yellow-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold text-base transition-colors shadow-lg"
                >
                  Join Quiz
                </button>
                <button
                  onClick={() => { setShowJoinModal(false); setView("organizer") }}
                  className="w-full h-11 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Organizer Login
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

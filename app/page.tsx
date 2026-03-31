"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Zap, Users, Play, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"

export default function Page() {
  const router = useRouter()
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleOrganizerLogin = async () => {
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data } = await supabase
      .from("organizer_settings")
      .select("pin_code")
      .eq("id", 1)
      .single()

    if (data && data.pin_code === pin) {
      localStorage.setItem("organizer_auth", "true")
      router.push("/organizer")
    } else {
      setError("Incorrect PIN. Default PIN is 1234")
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center gap-10">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
            <Zap className="w-12 h-12 text-white" fill="currentColor" />
          </div>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">QuizBlitz</h1>
          <p className="text-gray-500 text-center text-lg">Live multiplayer quizzes — play with friends!</p>
        </div>

        {/* Action Cards */}
        <div className="w-full flex flex-col gap-4">
          <a href="/join" className="group w-full block">
            <div className="w-full rounded-3xl bg-gradient-to-r from-violet-500 to-purple-600 p-6 flex items-center justify-between shadow-xl shadow-purple-500/25 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Play className="w-7 h-7 text-white" fill="currentColor" />
                </div>
                <div>
                  <div className="text-white font-bold text-xl">Join Game</div>
                  <div className="text-white/70 text-sm">Enter code to play</div>
                </div>
              </div>
              <div className="text-white/60 text-3xl font-light">{">"}</div>
            </div>
          </a>

          <button onClick={() => setShowPinDialog(true)} className="group w-full text-left">
            <div className="w-full rounded-3xl bg-white border-2 border-gray-200 p-6 flex items-center justify-between shadow-lg transition-all duration-300 group-hover:scale-[1.02] group-hover:border-violet-300 group-hover:shadow-xl active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Users className="w-7 h-7 text-gray-700" />
                </div>
                <div>
                  <div className="text-gray-900 font-bold text-xl">Organizer</div>
                  <div className="text-gray-500 text-sm">Manage quizzes</div>
                </div>
              </div>
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* PIN Dialog */}
      <Dialog open={showPinDialog} onOpenChange={setShowPinDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">Organizer Login</DialogTitle>
            <DialogDescription className="text-center text-gray-500">
              Enter your PIN to access the dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-4">
            <Input
              type="password"
              placeholder="Enter PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleOrganizerLogin()}
              className="text-center text-2xl tracking-[0.5em] h-14"
              maxLength={6}
            />
            {error && <p className="text-red-500 text-center text-sm font-medium">{error}</p>}
            <Button
              onClick={handleOrganizerLogin}
              disabled={loading || pin.length < 4}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 border-0"
            >
              {loading ? "Checking..." : "Enter"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  )
}

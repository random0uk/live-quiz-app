"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Zap, Monitor, Users, PuzzleIcon, Gauge, Swords, Target, BarChart3, QrCode, ToggleLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

const SLIDES = [
  {
    tag: "Overview",
    headline: "How the app\nworks in 5 screens",
    body: "There are 5 slides that walk you through every part of the app — from joining as a player, to running the quiz as an organizer, to watching the live results on a big screen.",
    visual: (
      <div className="flex flex-col gap-2 w-full max-w-[260px] mx-auto">
        {[
          { num: "1", label: "Home screen", sub: "Players scan a QR code to join" },
          { num: "2", label: "Organizer panel", sub: "Create & launch quizzes" },
          { num: "3", label: "Player screen", sub: "Answer questions on your phone" },
          { num: "4", label: "Projector screen", sub: "Cast the live view on a TV" },
          { num: "5", label: "Results screen", sub: "Leaderboard after each question" },
        ].map(({ num, label, sub }) => (
          <div key={num} className="flex items-center gap-3 p-3 bg-secondary/60 rounded-2xl">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-primary-foreground text-xs font-bold shrink-0">{num}</div>
            <div>
              <p className="text-sm font-semibold leading-none">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Screen 1 — Home",
    headline: "Players join\nby scanning a QR code",
    body: "On the home screen players see a QR code displayed on the projector. They scan it with their phone, enter their name, and they are in — no app download needed.",
    visual: (
      <div className="relative w-full max-w-[260px] mx-auto">
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center">
            <Monitor className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-primary/30" />
            <QrCode className="w-5 h-5 text-primary" />
            <div className="w-8 h-0.5 bg-primary/30" />
          </div>
          <div className="flex gap-2">
            {["A", "B", "C", "D"].map(l => (
              <div key={l} className="w-9 h-9 bg-card border border-border rounded-xl flex items-center justify-center text-xs font-bold">{l}</div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Screen 2 — Organizer",
    headline: "You control\neverything",
    body: "As an organizer you log in with your PIN, create quizzes, pick a game mode, set the timer, and launch the session. You can pause, skip questions, and end the game at any time.",
    visual: (
      <div className="flex flex-col gap-2 w-full max-w-[260px] mx-auto">
        {[
          { icon: PuzzleIcon, label: "Create quizzes", sub: "Add questions, images, options" },
          { icon: Gauge, label: "Pick a game mode", sub: "Classic, Fastest, Elimination, Teams" },
          { icon: Zap, label: "Launch the session", sub: "Start, pause, or skip at any time" },
          { icon: BarChart3, label: "See live results", sub: "Scores update after each answer" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3 p-3 bg-secondary/60 rounded-2xl">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Screen 3 — Players",
    headline: "Players answer\non their phones",
    body: "After joining, each player sees the question and answer options on their own phone. They tap their answer before the timer runs out. No app download or account needed.",
    visual: (
      <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] mx-auto">
        {[
          { icon: Target, label: "Multiple Choice", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
          { icon: ToggleLeft, label: "True / False", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
          { icon: BarChart3, label: "Poll", color: "bg-green-500/10 text-green-600 border-green-200" },
          { icon: PuzzleIcon, label: "Puzzle", color: "bg-red-500/10 text-red-600 border-red-200" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${color}`}>
            <Icon className="w-6 h-6" />
            <span className="text-xs font-semibold text-center">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Screen 4 — Projector",
    headline: "Cast the quiz\non any big screen",
    body: "Open the projector screen on any browser and cast or mirror it to a TV or projector. It shows the QR code, the question, the timer, and updates live — no refresh needed.",
    visual: (
      <div className="w-full max-w-[260px] mx-auto">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="bg-secondary/40 px-3 py-2 flex items-center justify-between">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">projector view</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="h-3 bg-primary/20 rounded-full w-3/4 mx-auto" />
            <div className="grid grid-cols-2 gap-1.5">
              {["A", "B", "C", "D"].map((l, i) => (
                <div key={l} className={`h-10 rounded-xl flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{l}</div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">12 players</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-medium text-primary">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    tag: "Screen 5 — Results",
    headline: "Live leaderboard\nafter every question",
    body: "After each question the projector shows the correct answer and the top players. Everyone sees their own rank and score on their phone. The final screen shows the winner.",
    visual: (
      <div className="flex flex-col gap-2 w-full max-w-[260px] mx-auto">
        {[
          { rank: 1, name: "Sarah", pts: 2800, highlight: true },
          { rank: 2, name: "James", pts: 2400, highlight: false },
          { rank: 3, name: "Mia", pts: 1900, highlight: false },
        ].map(({ rank, name, pts, highlight }) => (
          <motion.div
            key={rank}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rank * 0.1 }}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl ${highlight ? "bg-primary text-primary-foreground" : "bg-secondary/70"}`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${highlight ? "bg-primary-foreground/20" : "bg-background/60"}`}>{rank}</span>
              <span className="font-semibold text-sm">{name}</span>
            </div>
            <span className="font-mono font-bold text-sm">{pts}</span>
          </motion.div>
        ))}
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-secondary/30 border border-dashed border-border">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-background/60 flex items-center justify-center text-xs font-bold">4</span>
            <span className="font-semibold text-sm text-muted-foreground">You</span>
          </div>
          <span className="font-mono font-bold text-sm text-muted-foreground">1200</span>
        </div>
      </div>
    ),
  },
]

interface FeaturesSheetProps {
  open: boolean
  onClose: () => void
  organizerName?: string
}

export default function FeaturesSheet({ open, onClose, organizerName = "Organizer" }: FeaturesSheetProps) {
  const [slide, setSlide] = useState(0)
  const [dir, setDir] = useState(1)

  const go = (next: number) => {
    setDir(next > slide ? 1 : -1)
    setSlide(next)
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl flex flex-col overflow-hidden"
            style={{ height: "88vh" }}
          >
            {/* Handle + close row */}
            <div className="relative flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-border" />
              <button
                onClick={onClose}
                className="absolute right-4 top-2 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 pt-2 pb-1 shrink-0">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={`transition-all rounded-full ${i === slide ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"}`}
                />
              ))}
            </div>

            {/* Slide content — fills remaining height, no scroll */}
            <div className="flex-1 overflow-hidden px-6">
              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={slide}
                  custom={dir}
                  variants={{
                    enter: (d: number) => ({ x: d * 40, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: d * -40, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="flex flex-col items-center justify-center gap-4 h-full"
                >
                  {/* Greeting — only on first slide */}
                  {slide === 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-0.5"
                    >
                      <p className="text-lg font-bold">Hello, {organizerName}!</p>
                      <p className="text-xs text-muted-foreground">Here is a quick tour of all the screens in the app.</p>
                    </motion.div>
                  )}

                  {/* Tag */}
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
                    {SLIDES[slide].tag}
                  </span>

                  {/* Headline */}
                  <h2 className="text-2xl font-black text-center leading-tight text-balance whitespace-pre-line">
                    {SLIDES[slide].headline}
                  </h2>

                  {/* Visual */}
                  {SLIDES[slide].visual}

                  {/* Body */}
                  <p className="text-center text-sm text-muted-foreground leading-relaxed max-w-xs">
                    {SLIDES[slide].body}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation — pinned to bottom */}
            <div className="flex items-center justify-between px-6 py-4 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => go(slide - 1)}
                disabled={slide === 0}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>

              {slide < SLIDES.length - 1 ? (
                <Button size="sm" onClick={() => go(slide + 1)} className="gap-1 px-5 rounded-xl">
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={onClose} className="px-5 rounded-xl">
                  Got it
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

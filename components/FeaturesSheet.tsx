"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronRight, ChevronLeft, Zap, Monitor, Users, Trophy, PuzzleIcon, Gauge, Swords, Target, BarChart3, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"

const SLIDES = [
  {
    tag: "How it works",
    headline: "Live quizzes,\nprojected on screen",
    body: "The organizer displays a QR code on a projector or TV. Players scan it with their phone — no app download needed. Everyone plays live together.",
    visual: (
      <div className="relative w-full max-w-[260px] mx-auto">
        <div className="bg-primary/10 border border-primary/20 rounded-3xl p-6 flex flex-col items-center gap-4">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
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
    tag: "Game Modes",
    headline: "Four ways\nto play",
    body: "Classic scoring, Fastest Finger where only the quickest answer wins, Elimination where wrong answers knock you out, and Team Mode where friends compete together.",
    visual: (
      <div className="grid grid-cols-2 gap-2 w-full max-w-[260px] mx-auto">
        {[
          { icon: Zap, label: "Classic", color: "bg-blue-500/10 text-blue-600 border-blue-200" },
          { icon: Gauge, label: "Fastest", color: "bg-orange-500/10 text-orange-600 border-orange-200" },
          { icon: Swords, label: "Elimination", color: "bg-red-500/10 text-red-600 border-red-200" },
          { icon: Users, label: "Teams", color: "bg-green-500/10 text-green-600 border-green-200" },
        ].map(({ icon: Icon, label, color }) => (
          <div key={label} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${color}`}>
            <Icon className="w-6 h-6" />
            <span className="text-xs font-semibold">{label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "Question Types",
    headline: "More than\njust quizzes",
    body: "Mix Multiple Choice, True/False, Poll, and Puzzle questions in any order. Upload an image and players race to reassemble it on their phones.",
    visual: (
      <div className="flex flex-col gap-2 w-full max-w-[260px] mx-auto">
        {[
          { icon: Target, label: "Multiple Choice", sub: "4 options, fast scoring" },
          { icon: BarChart3, label: "Poll", sub: "No right answer, gather opinions" },
          { icon: PuzzleIcon, label: "Puzzle", sub: "Reassemble an image" },
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
    tag: "Real-time",
    headline: "Live leaderboard\nafter every question",
    body: "Scores update instantly after each question. The projector screen shows the live standings while players see their rank on their phone.",
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
  {
    tag: "Projector Screen",
    headline: "Built for\nbig screens",
    body: "Open the screen view on any browser and cast it. It auto-updates in real time — no refresh needed. Shows the QR code, questions, timers, and results.",
    visual: (
      <div className="w-full max-w-[260px] mx-auto">
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-lg">
          <div className="bg-secondary/40 px-3 py-2 flex items-center justify-between">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <div className="w-2 h-2 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-muted-foreground font-mono">screen view</span>
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
]

interface FeaturesSheetProps {
  open: boolean
  onClose: () => void
}

export default function FeaturesSheet({ open, onClose }: FeaturesSheetProps) {
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
            className="fixed inset-x-0 bottom-0 z-50 bg-background rounded-t-3xl overflow-hidden"
            style={{ maxHeight: "90vh" }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Slide content */}
            <div className="px-6 pb-8 overflow-y-auto" style={{ maxHeight: "calc(90vh - 40px)" }}>
              {/* Progress dots */}
              <div className="flex justify-center gap-1.5 mb-6">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    className={`transition-all rounded-full ${i === slide ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"}`}
                  />
                ))}
              </div>

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
                  className="flex flex-col items-center gap-6"
                >
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

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
